import Enquiry from "@/app/models/Enquiry";
import Appointment from "../models/Appointment";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { sendResponse } from "../utils/responseHandler";
import mongoose from "mongoose";
import DoctorLeave from "../models/DoctorLeave";
import { sendWhatsAppTemplate } from "../utils/whatsappService";
import Doctor from "@/app/models/Doctor";
import Organization from "@/app/models/Organization";
import EnquiryActivity from "../models/EnquiryActivity";
import Patient from "../models/Patient";
import TreatmentCategory from "../models/TreatmentCategory";
import DoctorDaySchedule from "../models/DoctorDaySchedule";
import { logActivity } from "./activityLogController";
import { timeStringToMinutes, minutesToTimeString, subtractIntervals, chunkIntoSlots, TimeInterval } from "@/lib/timeUtils";

const generateBookingId = () => {
  return `BK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
};

export const createAppointment = async (data: {
  organizationId: string;
  userId?: string;
  enquiryId?: string;
  firstName: string;
  lastName?: string;
  patientPhone: string;
  patientEmail?: string;
  dateOfBirth?: string;
  isNewPatient?: boolean;
  doctor: string;
  treatmentCategory: string; // This is a string right now, maybe category name or id
  date: string;
  startTime: string; // e.g. "10:20"
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  handledBy?: string;
  notes?: string;
}) => {
  // If booking from an enquiry, try to reuse the enquiry's linked patient first
  let existingPatient = null;

  if (data.enquiryId) {
    const enquiry = await Enquiry.findById(data.enquiryId).lean();
    if (enquiry?.patientId) {
      existingPatient = await Patient.findById(enquiry.patientId);
    }
  }

  // Fallback: look up by phone within the same clinic
  if (!existingPatient) {
    existingPatient = await Patient.findOne({
      organizationId: data.organizationId,
      phone: data.patientPhone,
    });
  }

  const isActuallyNew = !existingPatient;

  if (!existingPatient) {
    existingPatient = await Patient.create({
      organizationId: data.organizationId,
      firstName: data.firstName,
      lastName: data.lastName || "",
      email: data.patientEmail,
      phone: data.patientPhone,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    });
  }

  // Fetch duration from TreatmentCategory
  let durationMinutes = 20; // default fallback
  const category = await TreatmentCategory.findOne({ name: data.treatmentCategory, organizationId: data.organizationId });
  if (category && category.durationMinutes) {
    durationMinutes = category.durationMinutes;
  }

  const startMinutes = timeStringToMinutes(data.startTime);
  const endMinutes = startMinutes + durationMinutes;
  const appointmentDate = new Date(`${data.date}T00:00:00Z`);

  // --- CONCURRENCY FIX: ATOMIC PUSH TO DOCTORDAYSCHEDULE ---
  await DoctorDaySchedule.updateOne(
    { doctorId: data.doctor, date: appointmentDate },
    { $setOnInsert: { bookedIntervals: [] } },
    { upsert: true }
  );

  const scheduleResult = await DoctorDaySchedule.findOneAndUpdate(
    {
      doctorId: data.doctor,
      date: appointmentDate,
      bookedIntervals: {
        $not: { $elemMatch: { start: { $lt: endMinutes }, end: { $gt: startMinutes } } },
      },
    },
    { $push: { bookedIntervals: { start: startMinutes, end: endMinutes } } },
    { new: true }
  );

  if (!scheduleResult) {
    return sendApiResponse(false, "Slot already booked. Please choose another time.");
  }
  // ---------------------------------------------------------

  // Create appointment
  const appointment = await Appointment.create({
    ...data,
    startTime: startMinutes,
    endTime: endMinutes,
    durationMinutes,
    bookingId: generateBookingId(),
    date: appointmentDate,
    isNewPatient: isActuallyNew,
    patientId: existingPatient._id,
  });

  // Update DoctorDaySchedule with appointmentId
  await DoctorDaySchedule.updateOne(
    { doctorId: data.doctor, date: appointmentDate, "bookedIntervals.start": startMinutes },
    { $set: { "bookedIntervals.$.appointmentId": appointment._id } }
  );

  // Update enquiry status
  if (appointment.enquiryId) {
    const enquiryId = appointment.enquiryId as mongoose.Types.ObjectId;
    await EnquiryActivity.create({
      organizationId: data.organizationId,
      enquiryId,
      type: "APPOINTMENT_BOOKED",
      createdBy: data.handledBy,
      note: data.notes || "Appointment booked",
      date: new Date(),
    });
    // Actually update the Enquiry's main status field and link patient
    await Enquiry.findOneAndUpdate({ _id: enquiryId.toString(), organizationId: data.organizationId }, {
      status: "APPOINTMENT_BOOKED",
      handledBy: data.handledBy || undefined,
      patientId: existingPatient._id,
    });
  }

  // Fetch populated appointment
  const newAppointment = await Appointment.findById(appointment._id).populate(
    "doctor",
  );

  // Fetch doctor
  const doctorForAppointment = await Doctor.findById(data.doctor);

  if (!doctorForAppointment) {
    return sendApiResponse(false, "Doctor not found");
  }

  /* ---------------- WhatsApp (Meta Graph API) ---------------- */
  let whatsappWarning = "";
  try {
    const formattedDate = new Date(newAppointment!.date).toLocaleDateString(
      "en-IN",
    );

    await sendWhatsAppTemplate(
      data.organizationId,
      data.patientPhone,
      "appointment_confirmation", // Ensure this matches the template name registered in Meta
      [
        data.firstName,
        `${doctorForAppointment.firstName} ${doctorForAppointment.lastName}`,
        formattedDate,
        data.startTime,
      ],
      appointment._id.toString()
    );
  } catch (error) {
    console.error("WhatsApp send failed:", error);
    whatsappWarning = " (Note: WhatsApp notification failed to send - check configuration)";
    // Non-blocking — appointment still created even if WA fails
  }

  if (data.userId) {
    await logActivity(
      data.organizationId,
      data.userId,
      "CREATED_APPOINTMENT",
      "Appointment",
      `Booked appointment for ${data.firstName} ${data.lastName || ""} on ${data.date} at ${data.startTime}`.trim(),
      appointment._id
    );
  }

  // Return formatted time string for consistency
  const responseAppt: any = appointment.toObject();
  responseAppt.startTime = minutesToTimeString(responseAppt.startTime);
  if (responseAppt.endTime) responseAppt.endTime = minutesToTimeString(responseAppt.endTime);

  return sendApiResponse(true, `Appointment created successfully${whatsappWarning}`, responseAppt);
};

export const getAllAppointments = async (
  organizationId: string,
  page: number,
  limit: number,
  doctor?: string,
  search?: string,
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
  startDate?: string,
  endDate?: string,
  year?: string,
  month?: string,
) => {
  const skip = (page - 1) * limit;
  const whereClause: any = { organizationId };

  if (status) whereClause.status = status;
  if (doctor) whereClause.doctor = doctor;
  if (search) {
    whereClause.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { patientPhone: { $regex: search, $options: "i" } },
      { patientEmail: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } },
      { treatmentCategory: { $regex: search, $options: "i" } },
    ];
  }

  //  Add date range filtering
  if (startDate && endDate) {
    whereClause.date = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);

    whereClause.date = {
      $gte: start,
      $lte: end,
    };
  }

  const totalCount = await Appointment.countDocuments(whereClause);
  const appointments = await Appointment.find(whereClause)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "doctor",
      select:
        "firstName lastName email specialization qualification contactNumber status",
    })
    .populate({
      path: "enquiryId",
      select: "name description phone email",
    })
    .lean();

  const appointmentsList = appointments.map((appointment) => {
    return {
      _id: appointment._id.toString(),
      bookingId: appointment.bookingId,
      enquiryId: appointment.enquiryId
        ? {
            ...appointment.enquiryId,
            _id: appointment.enquiryId._id.toString(),
          }
        : null,
      firstName: appointment.firstName || (appointment as any).patientName?.split(" ")[0] || "Unknown",
      lastName: appointment.lastName || (appointment as any).patientName?.split(" ").slice(1).join(" ") || "",
      patientPhone: appointment.patientPhone,
      patientEmail: appointment.patientEmail,
      isNewPatient: appointment.isNewPatient,
      doctor: appointment.doctor
        ? {
            ...appointment.doctor,
            _id: appointment.doctor._id.toString(),
          }
        : null,
      treatmentCategory: appointment.treatmentCategory,
      date: appointment.date,
      startTime: minutesToTimeString(appointment.startTime),
      endTime: appointment.endTime ? minutesToTimeString(appointment.endTime) : undefined,
      status: appointment.status,
      notes: appointment.notes,
    };
  });
  return sendResponse(true, "Appoinments found successfully", {
    appointments: appointmentsList,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
};

//update appoinment
export const updateAppointment = async (
  organizationId: string,
  id: string,
  userId: string,
  data: {
    firstName: string;
    lastName?: string;
    patientPhone: string;
    patientEmail?: string;
    dateOfBirth?: string;
    isNewPatient?: boolean;
    doctor: string;
    treatmentCategory: string;
    date: string;
    startTime: string;
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
    notes?: string;
  },
) => {
  const formattedDate = new Date(`${data.date}T00:00:00Z`);
  
  // Handle startTime parsing if it is provided
  let startMinutes: number | undefined;
  if (data.startTime) {
    startMinutes = timeStringToMinutes(data.startTime);
  }

  const updatedData: any = {
    ...data,
    date: formattedDate,
  };
  
  if (startMinutes !== undefined) {
    updatedData.startTime = startMinutes;
  }

  const appoinment = await Appointment.findOneAndUpdate({ _id: id, organizationId }, updatedData, {
    new: true,
  });

  if (appoinment && appoinment.patientId) {
    const patientUpdate: any = {
      firstName: data.firstName,
      lastName: data.lastName || "",
      phone: data.patientPhone,
    };
    if (data.patientEmail !== undefined) {
      patientUpdate.email = data.patientEmail;
    }
    if (data.dateOfBirth !== undefined) {
      patientUpdate.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    }
    await Patient.findByIdAndUpdate(appoinment.patientId, { $set: patientUpdate });
  }

  if (userId) {
    await logActivity(
      organizationId,
      userId,
      "UPDATED_APPOINTMENT",
      "Appointment",
      `Updated appointment for ${data.firstName} ${data.lastName || ""}`.trim(),
      id
    );
  }
  
  const responseAppt: any = appoinment ? appoinment.toObject() : null;
  if (responseAppt) {
    responseAppt.startTime = minutesToTimeString(responseAppt.startTime);
    if (responseAppt.endTime) responseAppt.endTime = minutesToTimeString(responseAppt.endTime);
  }

  return sendApiResponse(true, "Appoinment updated successfully", responseAppt);
};

//delete appoinment
export const deleteAppointment = async (organizationId: string, id: string, userId: string) => {
  const appopintmentExists = await Appointment.findOne({ _id: id, organizationId });

  if (!appopintmentExists) {
    return sendApiResponse(false, "Appoinment not found");
  }
  const appoinment = await Appointment.findOneAndDelete({ _id: id, organizationId });

  // Also remove from DoctorDaySchedule
  await DoctorDaySchedule.updateOne(
    { doctorId: appopintmentExists.doctor as any, date: appopintmentExists.date },
    { $pull: { bookedIntervals: { appointmentId: id as any } } }
  );

  if (userId) {
    await logActivity(
      organizationId,
      userId,
      "DELETED_APPOINTMENT",
      "Appointment",
      `Deleted appointment for ${appopintmentExists.firstName} ${appopintmentExists.lastName || ""}`.trim(),
      id
    );
  }

  const responseAppt: any = appoinment ? appoinment.toObject() : null;
  if (responseAppt) {
    responseAppt.startTime = minutesToTimeString(responseAppt.startTime);
  }
  return sendApiResponse(true, "Appoinment deleted successfully", responseAppt);
};

export const getAppointmentById = async (organizationId: string, id: string) => {
  const appointment = await Appointment.findOne({ _id: id, organizationId })
    .populate(
      "doctor",
      "_id firstName lastName email phone prefix specialization qualification",
    )
    .populate({
      path: "enquiryId",
      select: "name description phone email",
    })
    .lean();
    
  if (!appointment) {
    return sendResponse(false, "Appointment not found");
  }
  
  return sendResponse(true, "Appoinment found successfully", {
    ...appointment,
    startTime: minutesToTimeString(appointment.startTime),
    endTime: appointment.endTime ? minutesToTimeString(appointment.endTime) : undefined,
    firstName: appointment?.firstName || (appointment as any)?.patientName?.split(" ")[0] || "Unknown",
    lastName: appointment?.lastName || (appointment as any)?.patientName?.split(" ").slice(1).join(" ") || "",
    _id: appointment?._id.toString(),
    doctor: appointment?.doctor
      ? {
          ...appointment.doctor,
          _id: appointment.doctor._id.toString(),
        }
      : null,
    enquiryId: appointment?.enquiryId
      ? {
          ...appointment.enquiryId,
          _id: appointment.enquiryId._id.toString(),
        }
      : null,
  });
};

// get free intervals logic
export const getBookedSlots = async (organizationId: string, date: string, doctorId: string, categoryId?: string) => {
  if (!date || !doctorId) {
    return sendApiResponse(false, "Date and doctor required", []);
  }

  const start = new Date(`${date}T00:00:00Z`);
  const end = new Date(`${date}T23:59:59Z`);

  // 1. Fetch Doctor and Org to get working hours and breaks
  const doctor = await Doctor.findOne({ _id: doctorId, organizationId }).lean();
  const org = await Organization.findById(organizationId).lean();
  
  if (!doctor) {
    return sendApiResponse(false, "Doctor not found", []);
  }

  let workingHours = doctor.workingHours && doctor.workingHours.length > 0 
    ? doctor.workingHours 
    : org?.defaultWorkingHours || [{ start: 600, end: 1080 }]; // default 10:00 - 18:00
    
  let breakTime = doctor.breakTime && doctor.breakTime.length > 0
    ? doctor.breakTime
    : org?.defaultBreakTime || [{ start: 780, end: 840 }]; // default 13:00 - 14:00

  // 2. Fetch Doctor Leaves
  const leaves = await DoctorLeave.find({
    organizationId,
    doctor: doctorId,
    fromDate: { $lte: end },
    toDate: { $gte: start },
  }).lean();

  const blockingIntervals: TimeInterval[] = [...breakTime];

  for (const leave of leaves) {
    if (leave.type === "FULL_DAY") {
      blockingIntervals.push({ start: 0, end: 1440 });
    }
    if (leave.type === "TIME_RANGE" || leave.type === "HALF_DAY") {
      if (leave.startTime && leave.endTime) {
        blockingIntervals.push({
          start: timeStringToMinutes(leave.startTime),
          end: timeStringToMinutes(leave.endTime)
        });
      }
    }
    if (leave.type === "PARTIAL_SLOTS" && leave.slots) {
      // Legacy support: each string in partial slots blocks 20 mins
      leave.slots.forEach((s: string) => {
        const startMin = timeStringToMinutes(s);
        blockingIntervals.push({ start: startMin, end: startMin + 20 });
      });
    }
  }

  // 3. Fetch Booked Appointments
  const schedule = await DoctorDaySchedule.findOne({ doctorId, date: start }).lean();
  if (schedule && schedule.bookedIntervals) {
    for (const booked of schedule.bookedIntervals) {
      blockingIntervals.push({ start: booked.start, end: booked.end });
    }
  } else {
    // Fallback if schedule doc isn't created yet for older appointments
    const appointments = await Appointment.find({
      organizationId,
      doctor: doctorId,
      date: { $gte: start, $lte: end },
    }).lean();
    for (const appt of appointments) {
      blockingIntervals.push({ 
        start: appt.startTime, 
        end: appt.endTime || (appt.startTime + 20) 
      });
    }
  }

  // 4. Subtract blocking intervals from working hours
  const freeIntervals = subtractIntervals(workingHours, blockingIntervals);

  // 5. Chunk into slots based on duration
  let durationMinutes = 20; // default
  if (categoryId) {
    // we can lookup treatment category
    const cat = await TreatmentCategory.findOne({ name: categoryId, organizationId });
    if (cat && cat.durationMinutes) {
      durationMinutes = cat.durationMinutes;
    }
  }
  
  const chunks = chunkIntoSlots(freeIntervals, durationMinutes);

  // Map to format that frontend expects
  const availableSlots = chunks.map(chunk => ({
    time: minutesToTimeString(chunk.start),
    reason: "AVAILABLE"
  }));

  // But wait! The frontend currently expects an array of all slots with reason = BOOKED or LEAVE.
  // Or if we return only AVAILABLE, we need to check if frontend understands it.
  // Wait, let's just return the available slots. The previous return was:
  // Array.from(slotMap.entries()).map(([time, reason]) => ({ time, reason }))
  // where only blocked slots were returned! If we return only available slots, the frontend might break if it expects all slots and checks `reason === 'BOOKED'`.
  // Let's actually just return what's available under a different structure or just return the booked ones?
  // Let's format the return to be backward compatible if needed. Wait, if it's dynamic, there is no fixed grid.
  // The frontend component that displays slots will iterate over the API response.
  
  return sendApiResponse(true, "Available slots", availableSlots);
};

//get month wise report
export const getMonthWiseReport = async (organizationId: string, year?: string, doctorId?: string) => {
  const currentYear = year ? Number(year) : new Date().getFullYear();

  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

  const matchCondition: any = {
    organizationId: new mongoose.Types.ObjectId(organizationId),
    date: { $gte: startDate, $lte: endDate },
  };

  if (doctorId) {
    matchCondition.doctor = new mongoose.Types.ObjectId(doctorId);
  }

  const report = await Appointment.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: { month: { $month: "$date" } },
        totalAppointments: { $sum: 1 },
        statusBreakdown: { $push: "$status" },
      },
    },
    { $sort: { "_id.month": 1 } },
  ]);

  const formatted = report.map((entry, index) => {
    const monthNumber = entry._id.month;

    const statusCount = entry.statusBreakdown.reduce(
      (acc: any, status: string) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      {},
    );

    const prevTotal = index > 0 ? report[index - 1].totalAppointments : null;
    const currentTotal = entry.totalAppointments;

    let growth: string | null = null;

    if (prevTotal !== null) {
      const diff = currentTotal - prevTotal;

      if (diff > 0) growth = `+${diff}`;
      else if (diff < 0) growth = `${diff}`;
      else growth = "0";
    }

    return {
      month: monthNumber,
      monthName: new Date(0, monthNumber - 1).toLocaleString("default", {
        month: "short",
      }),
      totalAppointments: currentTotal,
      growth,
      statusSummary: {
        SCHEDULED: statusCount["SCHEDULED"] || 0,
        COMPLETED: statusCount["COMPLETED"] || 0,
        CANCELLED: statusCount["CANCELLED"] || 0,
        NO_SHOW: statusCount["NO_SHOW"] || 0,
      },
    };
  });

  return sendResponse(true, "Report fetched successfully", formatted);
};
