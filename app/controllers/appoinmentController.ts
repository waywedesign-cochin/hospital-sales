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
import {
  timeStringToMinutes,
  minutesToTimeString,
  subtractIntervals,
  chunkIntoSlots,
  TimeInterval,
} from "@/lib/timeUtils";
import { resolveDoctorScope, RequestingUser } from "../utils/DoctorScope";

const generateBookingId = () => {
  return `BK-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
};

export const createAppointment = async (
  data: {
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
    treatmentCategory: string;
    date: string;
    startTime: string;
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
    handledBy?: string;
    notes?: string;
  },
  requestingUser?: RequestingUser,
) => {
  // If a scoped STAFF/DOCTOR user is booking, make sure they're allowed to book for this doctor.
  if (requestingUser) {
    const doctorScope = await resolveDoctorScope(
      data.organizationId,
      requestingUser,
    );
    if (
      doctorScope &&
      !doctorScope.some((id) => id.toString() === data.doctor)
    ) {
      return sendApiResponse(
        false,
        "You are not permitted to book appointments for this doctor.",
      );
    }
  }

  let existingPatient = null;

  if (data.enquiryId) {
    const enquiry = await Enquiry.findById(data.enquiryId).lean();
    if (enquiry?.patientId) {
      existingPatient = await Patient.findById(enquiry.patientId);
    }
  }

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

  let durationMinutes = 20;
  const category = await TreatmentCategory.findOne({
    name: data.treatmentCategory,
    organizationId: data.organizationId,
  });
  if (category && category.durationMinutes) {
    durationMinutes = category.durationMinutes;
  }

  const startMinutes = timeStringToMinutes(data.startTime);
  const endMinutes = startMinutes + durationMinutes;
  const appointmentDate = new Date(`${data.date}T00:00:00Z`);

  await DoctorDaySchedule.updateOne(
    { doctorId: data.doctor, date: appointmentDate },
    { $setOnInsert: { bookedIntervals: [] } },
    { upsert: true },
  );

  const scheduleResult = await DoctorDaySchedule.findOneAndUpdate(
    {
      doctorId: data.doctor,
      date: appointmentDate,
      bookedIntervals: {
        $not: {
          $elemMatch: {
            start: { $lt: endMinutes },
            end: { $gt: startMinutes },
          },
        },
      },
    },
    { $push: { bookedIntervals: { start: startMinutes, end: endMinutes } } },
    { new: true },
  );

  if (!scheduleResult) {
    return sendApiResponse(
      false,
      "Slot already booked. Please choose another time.",
    );
  }

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

  await DoctorDaySchedule.updateOne(
    {
      doctorId: data.doctor,
      date: appointmentDate,
      "bookedIntervals.start": startMinutes,
    },
    { $set: { "bookedIntervals.$.appointmentId": appointment._id } },
  );

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
    await Enquiry.findOneAndUpdate(
      { _id: enquiryId.toString(), organizationId: data.organizationId },
      {
        status: "APPOINTMENT_BOOKED",
        handledBy: data.handledBy || undefined,
        patientId: existingPatient._id,
      },
    );
  }

  const newAppointment = await Appointment.findById(appointment._id).populate(
    "doctor",
  );

  const doctorForAppointment = await Doctor.findById(data.doctor);

  if (!doctorForAppointment) {
    return sendApiResponse(false, "Doctor not found");
  }

  let whatsappWarning = "";
  try {
    const formattedDate = new Date(newAppointment!.date).toLocaleDateString(
      "en-IN",
    );

    const org = await Organization.findById(data.organizationId);
    const templateName =
      org?.whatsapp?.templateName || "appointment_confirmation";
    const doctorFullName = `${doctorForAppointment.prefix || "Dr."} ${doctorForAppointment.firstName} ${doctorForAppointment.lastName}`;

    await sendWhatsAppTemplate(
      data.organizationId,
      data.patientPhone,
      templateName,
      [
        data.firstName,
        `${doctorForAppointment.firstName} ${doctorForAppointment.lastName}`,
        formattedDate,
        data.startTime,
      ],
      existingPatient._id.toString(),
      "BOOKING_CONFIRMATION",
      undefined,
      `Appointment confirmed with ${doctorFullName} on ${formattedDate} at ${data.startTime}.`,
    );
  } catch (error) {
    console.error("WhatsApp send failed:", error);
    whatsappWarning =
      " (Note: WhatsApp notification failed to send - check configuration)";
  }

  if (data.userId) {
    await logActivity(
      data.organizationId,
      data.userId,
      "CREATED_APPOINTMENT",
      "Appointment",
      `Booked appointment for ${data.firstName} ${data.lastName || ""} on ${data.date} at ${data.startTime}`.trim(),
      appointment._id,
    );
  }

  const responseAppt: any = appointment.toObject();
  responseAppt.startTime = minutesToTimeString(responseAppt.startTime);
  if (responseAppt.endTime)
    responseAppt.endTime = minutesToTimeString(responseAppt.endTime);

  return sendApiResponse(
    true,
    `Appointment created successfully${whatsappWarning}`,
    responseAppt,
  );
};

export const getAllAppointments = async (
  organizationId: string,
  requestingUser: RequestingUser,
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

  const doctorScope = await resolveDoctorScope(organizationId, requestingUser);
  if (doctorScope) {
    if (doctor) {
      if (!doctorScope.some((id) => id.toString() === doctor)) {
        return sendResponse(true, "Appoinments found successfully", {
          appointments: [],
          pagination: { page, limit, totalCount: 0, totalPages: 0 },
        });
      }
      whereClause.doctor = doctor;
    } else {
      whereClause.doctor = { $in: doctorScope };
    }
  } else if (doctor) {
    whereClause.doctor = doctor;
  }

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
      firstName:
        appointment.firstName ||
        (appointment as any).patientName?.split(" ")[0] ||
        "Unknown",
      lastName:
        appointment.lastName ||
        (appointment as any).patientName?.split(" ").slice(1).join(" ") ||
        "",
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
      endTime: appointment.endTime
        ? minutesToTimeString(appointment.endTime)
        : undefined,
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

// Today's agenda for one doctor — a small, focused list (not paginated)
// meant for a "what's next" dashboard widget rather than the full
// appointments table.
export const getTodaysAgenda = async (
  organizationId: string,
  requestingUser: RequestingUser,
  doctorId: string,
  dateStr: string, // "YYYY-MM-DD"
) => {
  const doctorScope = await resolveDoctorScope(organizationId, requestingUser);
  if (doctorScope && !doctorScope.some((id) => id.toString() === doctorId)) {
    return sendResponse(true, "Today's agenda fetched successfully", {
      appointments: [],
    });
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  const dayStart = new Date(year, month - 1, day, 0, 0, 0);
  const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

  const appointments = await Appointment.find({
    organizationId,
    doctor: doctorId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $ne: "CANCELLED" },
  })
    .sort({ startTime: 1 })
    .lean();

  const agenda = appointments.map((appointment) => ({
    _id: appointment._id.toString(),
    bookingId: appointment.bookingId,
    firstName:
      appointment.firstName ||
      (appointment as any).patientName?.split(" ")[0] ||
      "Unknown",
    lastName:
      appointment.lastName ||
      (appointment as any).patientName?.split(" ").slice(1).join(" ") ||
      "",
    treatmentCategory: appointment.treatmentCategory,
    startTime: appointment.startTime,
    startTimeLabel: minutesToTimeString(appointment.startTime),
    status: appointment.status,
  }));

  return sendResponse(true, "Today's agenda fetched successfully", {
    appointments: agenda,
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
  requestingUser?: RequestingUser,
) => {
  // Access check: the existing appointment's doctor AND the (possibly changed)
  // target doctor must both be within the requesting user's scope.
  if (requestingUser) {
    const existing = await Appointment.findOne({
      _id: id,
      organizationId,
    }).select("doctor");
    if (!existing) {
      return sendApiResponse(false, "Appoinment not found");
    }
    const doctorScope = await resolveDoctorScope(
      organizationId,
      requestingUser,
    );
    if (doctorScope) {
      const currentDoctorAllowed = doctorScope.some(
        (sid) => sid.toString() === existing.doctor.toString(),
      );
      const targetDoctorAllowed = doctorScope.some(
        (sid) => sid.toString() === data.doctor,
      );
      if (!currentDoctorAllowed || !targetDoctorAllowed) {
        return sendApiResponse(false, "Appoinment not found");
      }
    }
  }

  const formattedDate = new Date(`${data.date}T00:00:00Z`);

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

  const appoinment = await Appointment.findOneAndUpdate(
    { _id: id, organizationId },
    updatedData,
    {
      new: true,
    },
  );

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
      patientUpdate.dateOfBirth = data.dateOfBirth
        ? new Date(data.dateOfBirth)
        : null;
    }
    await Patient.findByIdAndUpdate(appoinment.patientId, {
      $set: patientUpdate,
    });
  }

  if (userId) {
    await logActivity(
      organizationId,
      userId,
      "UPDATED_APPOINTMENT",
      "Appointment",
      `Updated appointment for ${data.firstName} ${data.lastName || ""}`.trim(),
      id,
    );
  }

  const responseAppt: any = appoinment ? appoinment.toObject() : null;
  if (responseAppt) {
    responseAppt.startTime = minutesToTimeString(responseAppt.startTime);
    if (responseAppt.endTime)
      responseAppt.endTime = minutesToTimeString(responseAppt.endTime);
  }

  return sendApiResponse(true, "Appoinment updated successfully", responseAppt);
};

//delete appoinment
export const deleteAppointment = async (
  organizationId: string,
  id: string,
  userId: string,
  requestingUser?: RequestingUser,
) => {
  const appopintmentExists = await Appointment.findOne({
    _id: id,
    organizationId,
  });

  if (!appopintmentExists) {
    return sendApiResponse(false, "Appoinment not found");
  }

  if (requestingUser) {
    const doctorScope = await resolveDoctorScope(
      organizationId,
      requestingUser,
    );
    if (doctorScope) {
      const allowed = doctorScope.some(
        (sid) => sid.toString() === appopintmentExists.doctor.toString(),
      );
      if (!allowed) {
        return sendApiResponse(false, "Appoinment not found");
      }
    }
  }

  const appoinment = await Appointment.findOneAndDelete({
    _id: id,
    organizationId,
  });

  await DoctorDaySchedule.updateOne(
    {
      doctorId: appopintmentExists.doctor as any,
      date: appopintmentExists.date,
    },
    { $pull: { bookedIntervals: { appointmentId: id as any } } },
  );

  if (userId) {
    await logActivity(
      organizationId,
      userId,
      "DELETED_APPOINTMENT",
      "Appointment",
      `Deleted appointment for ${appopintmentExists.firstName} ${appopintmentExists.lastName || ""}`.trim(),
      id,
    );
  }

  const responseAppt: any = appoinment ? appoinment.toObject() : null;
  if (responseAppt) {
    responseAppt.startTime = minutesToTimeString(responseAppt.startTime);
  }
  return sendApiResponse(true, "Appoinment deleted successfully", responseAppt);
};

export const getAppointmentById = async (
  organizationId: string,
  id: string,
  requestingUser?: RequestingUser,
) => {
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

  if (requestingUser) {
    const doctorScope = await resolveDoctorScope(
      organizationId,
      requestingUser,
    );
    if (doctorScope) {
      const appointmentDoctorId = (appointment.doctor as any)?._id?.toString();
      const allowed = doctorScope.some(
        (id) => id.toString() === appointmentDoctorId,
      );
      if (!allowed) {
        return sendResponse(false, "Appointment not found");
      }
    }
  }

  return sendResponse(true, "Appoinment found successfully", {
    ...appointment,
    startTime: minutesToTimeString(appointment.startTime),
    endTime: appointment.endTime
      ? minutesToTimeString(appointment.endTime)
      : undefined,
    firstName:
      appointment?.firstName ||
      (appointment as any)?.patientName?.split(" ")[0] ||
      "Unknown",
    lastName:
      appointment?.lastName ||
      (appointment as any)?.patientName?.split(" ").slice(1).join(" ") ||
      "",
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
export const getBookedSlots = async (
  organizationId: string,
  date: string,
  doctorId: string,
  categoryId?: string,
  requestingUser?: RequestingUser,
) => {
  if (!date || !doctorId) {
    return sendApiResponse(false, "Date and doctor required", []);
  }

  if (requestingUser) {
    const doctorScope = await resolveDoctorScope(
      organizationId,
      requestingUser,
    );
    if (doctorScope && !doctorScope.some((id) => id.toString() === doctorId)) {
      return sendApiResponse(
        false,
        "You are not permitted to view this doctor's schedule.",
        [],
      );
    }
  }

  const start = new Date(`${date}T00:00:00Z`);
  const end = new Date(`${date}T23:59:59Z`);

  const doctor = await Doctor.findOne({ _id: doctorId, organizationId }).lean();
  const org = await Organization.findById(organizationId).lean();

  if (!doctor) {
    return sendApiResponse(false, "Doctor not found", []);
  }

  const workingHours =
    doctor.workingHours && doctor.workingHours.length > 0
      ? doctor.workingHours
      : org?.defaultWorkingHours || [{ start: 600, end: 1080 }];

  const breakTime =
    doctor.breakTime && doctor.breakTime.length > 0
      ? doctor.breakTime
      : org?.defaultBreakTime || [{ start: 780, end: 840 }];

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
          end: timeStringToMinutes(leave.endTime),
        });
      }
    }
    if (leave.type === "PARTIAL_SLOTS" && leave.slots) {
      leave.slots.forEach((s: string) => {
        const startMin = timeStringToMinutes(s);
        blockingIntervals.push({ start: startMin, end: startMin + 20 });
      });
    }
  }

  const schedule = await DoctorDaySchedule.findOne({
    doctorId,
    date: start,
  }).lean();
  if (schedule && schedule.bookedIntervals) {
    for (const booked of schedule.bookedIntervals) {
      blockingIntervals.push({ start: booked.start, end: booked.end });
    }
  } else {
    const appointments = await Appointment.find({
      organizationId,
      doctor: doctorId,
      date: { $gte: start, $lte: end },
    }).lean();
    for (const appt of appointments) {
      blockingIntervals.push({
        start: appt.startTime,
        end: appt.endTime || appt.startTime + 20,
      });
    }
  }

  const freeIntervals = subtractIntervals(workingHours, blockingIntervals);

  let durationMinutes = 20;
  if (categoryId) {
    const cat = await TreatmentCategory.findOne({
      name: categoryId,
      organizationId,
    });
    if (cat && cat.durationMinutes) {
      durationMinutes = cat.durationMinutes;
    }
  }

  const chunks = chunkIntoSlots(freeIntervals, durationMinutes);

  const availableSlots = chunks.map((chunk) => ({
    time: minutesToTimeString(chunk.start),
    reason: "AVAILABLE",
  }));

  return sendApiResponse(true, "Available slots", availableSlots);
};

//get month wise report
export const getMonthWiseReport = async (
  organizationId: string,
  year?: string,
  doctorId?: string,
  requestingUser?: RequestingUser,
) => {
  const currentYear = year ? Number(year) : new Date().getFullYear();

  const startDate = new Date(currentYear, 0, 1);
  const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

  const matchCondition: any = {
    organizationId: new mongoose.Types.ObjectId(organizationId),
    date: { $gte: startDate, $lte: endDate },
  };

  if (requestingUser) {
    const doctorScope = await resolveDoctorScope(
      organizationId,
      requestingUser,
    );
    if (doctorScope) {
      if (doctorId) {
        if (!doctorScope.some((id) => id.toString() === doctorId)) {
          return sendResponse(true, "Report fetched successfully", []);
        }
        matchCondition.doctor = new mongoose.Types.ObjectId(doctorId);
      } else {
        matchCondition.doctor = { $in: doctorScope };
      }
    } else if (doctorId) {
      matchCondition.doctor = new mongoose.Types.ObjectId(doctorId);
    }
  } else if (doctorId) {
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
