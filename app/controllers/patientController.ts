import Patient from "../models/Patient";
import Appointment from "../models/Appointment";
import Enquiry from "../models/Enquiry";
import MessageLog from "../models/MessageLog";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { resolveDoctorScope, RequestingUser } from "../utils/DoctorScope";

export const getPatients = async (
  organizationId: string,
  requestingUser: RequestingUser,
  page: number = 1,
  limit: number = 10,
  search?: string,
) => {
  const skip = (page - 1) * limit;
  const whereClause: any = { organizationId };

  if (search) {
    whereClause.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  // Doctor scoping: a Patient record isn't tied to one doctor directly, so a
  // scoped STAFF/DOCTOR user's visible patients are derived from who they've
  // had appointments with.
  const doctorScope = await resolveDoctorScope(organizationId, requestingUser);
  let appointmentDoctorFilter: any = {};

  if (doctorScope) {
    if (doctorScope.length === 0) {
      // DOCTOR account not yet linked to a profile, or STAFF assigned to
      // doctors that somehow don't resolve — sees nothing rather than everything.
      return sendApiResponse(true, "Patients fetched successfully", {
        patients: [],
        activeTreatments: 0,
        messagesSent: 0,
        pagination: { page, limit, totalCount: 0, totalPages: 0 },
      });
    }

    const patientIds = await Appointment.distinct("patientId", {
      organizationId,
      doctor: { $in: doctorScope },
    });
    whereClause._id = { $in: patientIds };
    appointmentDoctorFilter = { doctor: { $in: doctorScope } };
  }

  const [totalCount, patients, activeTreatments, messagesSent] =
    await Promise.all([
      Patient.countDocuments(whereClause),
      Patient.find(whereClause)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments({
        organizationId,
        status: "IN_PROGRESS",
        ...appointmentDoctorFilter,
      }),
      // Note: MessageLog isn't doctor-scoped in the current schema, so this stays
      // clinic-wide even for scoped users. Flag if you want it scoped too.
      MessageLog.countDocuments({ organizationId }),
    ]);

  return sendApiResponse(true, "Patients fetched successfully", {
    patients,
    activeTreatments,
    messagesSent,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
};

export const getPatientById = async (
  organizationId: string,
  requestingUser: RequestingUser,
  id: string,
) => {
  const patient = await Patient.findOne({ _id: id, organizationId }).lean();
  if (!patient) {
    return sendApiResponse(false, "Patient not found", null);
  }

  const doctorScope = await resolveDoctorScope(organizationId, requestingUser);

  // If scoped, this patient must have at least one appointment with an
  // assigned/linked doctor, otherwise treat them as not found (don't leak
  // that the patient exists elsewhere in the clinic).
  if (doctorScope) {
    if (doctorScope.length === 0) {
      return sendApiResponse(false, "Patient not found", null);
    }
    const hasAccess = await Appointment.exists({
      organizationId,
      $or: [{ patientId: id }, { patientPhone: patient.phone }],
      doctor: { $in: doctorScope },
    });
    if (!hasAccess) {
      return sendApiResponse(false, "Patient not found", null);
    }
  }

  // Fetch patient's appointments (by patientId OR matching phone for legacy records)
  const appointmentQuery: any = {
    organizationId,
    $or: [{ patientId: id }, { patientPhone: patient.phone }],
  };
  if (doctorScope) {
    // Also hide this patient's appointments with doctors outside the scope,
    // not just gate access to the patient record itself.
    appointmentQuery.doctor = { $in: doctorScope };
  }

  const appointments = await Appointment.find(appointmentQuery)
    .populate("doctor", "firstName lastName prefix specialization")
    .sort({ date: -1 })
    .limit(20)
    .lean();

  // Fetch patient's enquiries/leads (by patientId OR matching phone for legacy records)
  const enquiries = await Enquiry.find({
    organizationId,
    $or: [{ patientId: id }, { phone: patient.phone }],
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const serializedAppointments = appointments.map((a) => ({
    _id: a._id.toString(),
    bookingId: a.bookingId,
    firstName:
      a.firstName || (a as any).patientName?.split(" ")[0] || "Unknown",
    lastName:
      a.lastName || (a as any).patientName?.split(" ").slice(1).join(" ") || "",
    treatmentCategory: a.treatmentCategory,
    date: a.date,
    startTime: a.startTime,
    status: a.status,
    notes: a.notes,
    doctor: a.doctor
      ? {
          _id: (a.doctor as any)._id.toString(),
          firstName: (a.doctor as any).firstName,
          lastName: (a.doctor as any).lastName,
          prefix: (a.doctor as any).prefix,
          specialization: (a.doctor as any).specialization,
        }
      : null,
  }));

  const serializedEnquiries = enquiries.map((e) => ({
    _id: e._id.toString(),
    firstName: e.firstName,
    lastName: e.lastName,
    treatmentCategory: e.treatmentCategory,
    message: e.message,
    status: e.status,
    source: e.source,
    createdAt: e.createdAt,
  }));

  return sendApiResponse(true, "Patient fetched successfully", {
    ...patient,
    _id: patient._id.toString(),
    appointments: serializedAppointments,
    enquiries: serializedEnquiries,
  });
};

export const updatePatient = async (
  organizationId: string,
  requestingUser: RequestingUser,
  id: string,
  data: any,
) => {
  const doctorScope = await resolveDoctorScope(organizationId, requestingUser);

  if (doctorScope) {
    if (doctorScope.length === 0) {
      return sendApiResponse(false, "Patient not found", null);
    }
    const patient = await Patient.findOne({ _id: id, organizationId }).lean();
    if (!patient) {
      return sendApiResponse(false, "Patient not found", null);
    }
    const hasAccess = await Appointment.exists({
      organizationId,
      $or: [{ patientId: id }, { patientPhone: patient.phone }],
      doctor: { $in: doctorScope },
    });
    if (!hasAccess) {
      return sendApiResponse(false, "Patient not found", null);
    }
  }

  const patient = await Patient.findOneAndUpdate(
    { _id: id, organizationId },
    { $set: data },
    { new: true },
  );

  if (!patient) {
    return sendApiResponse(false, "Patient not found", null);
  }

  return sendApiResponse(true, "Patient updated successfully", patient);
};
