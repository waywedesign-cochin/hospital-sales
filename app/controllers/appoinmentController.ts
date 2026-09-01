import Enquiry from "@/app/models/Enquiry";
import Appointment from "../models/Appointment";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { sendResponse } from "../utils/responseHandler";
import mongoose from "mongoose";
import DoctorLeave from "../models/DoctorLeave";
import { DEFAULT_TIME_SLOTS } from "@/constants/timeSlots";
import { sendWhatsAppMessage } from "../utils/whatsapp";
import Doctor from "@/app/models/Doctor";
import EnquiryActivity from "../models/EnquiryActivity";
import Patient from "../models/Patient";
import { logActivity } from "./activityLogController";
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
  isNewPatient?: boolean;
  doctor: string;
  treatmentCategory: string;
  date: string;
  startTime: string;
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
    });
  }

  // Create appointment
  const appointment = await Appointment.create({
    ...data,
    bookingId: generateBookingId(),
    date: new Date(`${data.date}T00:00:00Z`),
    isNewPatient: isActuallyNew,
    patientId: existingPatient._id,
  });

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

  /* ---------------- WhatsApp (Testing) ---------------- */
  try {
    const formattedDate = new Date(newAppointment!.date).toLocaleDateString(
      "en-IN",
    );

    const customerMessage = `Hello ${newAppointment?.firstName} 👋,

Your dermatology appointment has been confirmed ✅

📅 Date: ${formattedDate}
⏰ Time: ${newAppointment?.startTime}
🧑‍⚕️ Doctor: Dr. ${doctorForAppointment.firstName} ${doctorForAppointment.lastName}
💼 Treatment: ${data.treatmentCategory}

Please arrive a few minutes early.
For assistance or rescheduling, feel free to contact our clinic.

Thank you,
Dermatology Center`;

    // TEST NUMBER (Sandbox joined)
    await sendWhatsAppMessage("+919946957636", customerMessage);

    //doctor message
    const doctorMessage =
      "Hello Dr. James Peter 👋,\n\n" +
      "A new dermatology appointment has been booked 📢\n\n" +
      "👤 Patient: Midhun\n" +
      "📅 Date: 24/12/2025\n" +
      "⏰ Time: 10:00\n" +
      "💼 Treatment: Hair\n\n" +
      "Thank you.";

    // TEST NUMBER (Sandbox joined)
    await sendWhatsAppMessage("+919946957636", doctorMessage);
  } catch (error) {
    console.error("WhatsApp send failed:", error);
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

  return sendApiResponse(true, "Appointment created successfully", appointment);
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
  const Doctor = (await import("@/app/models/Doctor")).default;
  const Enquiry = (await import("@/app/models/Enquiry")).default;
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
      startTime: appointment.startTime,
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
  const updatedData = {
    ...data,
    date: formattedDate,
  };
  const appoinment = await Appointment.findOneAndUpdate({ _id: id, organizationId }, updatedData, {
    new: true,
  });

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

  return sendApiResponse(true, "Appoinment updated successfully", appoinment);
};

//delete appoinment
export const deleteAppointment = async (organizationId: string, id: string, userId: string) => {
  const appopintmentExists = await Appointment.findOne({ _id: id, organizationId });
  console.log(appopintmentExists);

  if (!appopintmentExists) {
    return sendApiResponse(false, "Appoinment not found");
  }
  const appoinment = await Appointment.findOneAndDelete({ _id: id, organizationId });

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

  return sendApiResponse(true, "Appoinment deleted successfully", appoinment);
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
  return sendResponse(true, "Appoinment found successfully", {
    ...appointment,
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

//get booked slots
const getSlotsInRange = (start: string, end: string) =>
  DEFAULT_TIME_SLOTS.filter((t) => t >= start && t <= end);

export const getBookedSlots = async (organizationId: string, date: string, doctor: string) => {
  if (!date || !doctor) {
    return sendApiResponse(false, "Date and doctor required", []);
  }

  const start = new Date(`${date}T00:00:00Z`);
  const end = new Date(`${date}T23:59:59Z`);

  const appointments = await Appointment.find({
    organizationId,
    doctor,
    date: { $gte: start, $lte: end },
  }).lean();

  const leaves = await DoctorLeave.find({
    organizationId,
    doctor,
    fromDate: { $lte: end },
    toDate: { $gte: start },
  }).lean();

  const slotMap = new Map<string, "BOOKED" | "LEAVE">();

  appointments.forEach((a) => slotMap.set(a.startTime, "BOOKED"));

  for (const leave of leaves) {
    if (leave.type === "FULL_DAY") {
      DEFAULT_TIME_SLOTS.forEach((t) => slotMap.set(t, "LEAVE"));
    }

    if (leave.type === "PARTIAL_SLOTS") {
      leave.slots?.forEach((t: string) => slotMap.set(t, "LEAVE"));
    }

    if (leave.type === "TIME_RANGE") {
      getSlotsInRange(leave.startTime!, leave.endTime!).forEach((t) =>
        slotMap.set(t, "LEAVE"),
      );
    }
  }

  return sendApiResponse(
    true,
    "Blocked slots",
    Array.from(slotMap.entries()).map(([time, reason]) => ({
      time,
      reason,
    })),
  );
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
    matchCondition.doctor = new mongoose.Types.ObjectId(doctorId); // FIXED
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
