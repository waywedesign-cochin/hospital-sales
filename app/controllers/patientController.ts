import Patient from "../models/Patient";
import Appointment from "../models/Appointment";
import Enquiry from "../models/Enquiry";
import MessageLog from "../models/MessageLog";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { resolveDoctorScope, RequestingUser } from "../utils/DoctorScope";
import { logActivity } from "./activityLogController";

// A Patient record isn't tied to one doctor directly — visibility for a
// scoped STAFF/DOCTOR is normally derived from who they've had appointments
// with. But a patient with NO appointment at all yet (e.g. just added via
// "Add Patient", not booked with anyone) isn't tied to any doctor either —
// excluding them would make a freshly added patient invisible even to the
// staff member who just added them. Such patients stay visible to every
// scoped user until an appointment actually assigns them to a doctor.
async function getVisiblePatientIds(
  organizationId: string,
  doctorScope: any[],
): Promise<any[]> {
  const [scopedPatientIds, assignedPatientIds] = await Promise.all([
    Appointment.distinct("patientId", {
      organizationId,
      doctor: { $in: doctorScope },
    }),
    Appointment.distinct("patientId", { organizationId }),
  ]);

  return Patient.find({
    organizationId,
    $or: [
      { _id: { $in: scopedPatientIds } },
      { _id: { $nin: assignedPatientIds } },
    ],
  }).distinct("_id");
}

// Creates a patient directly (not via an enquiry or appointment booking).
// Phone numbers are deduped per organization the same way the appointment
// flow already does it, but here a duplicate is reported back as an error
// rather than silently reused — this is a deliberate "add a patient" action,
// so the staff member should know if the person is already on file.
export const createPatient = async (
  data: {
    organizationId: string;
    firstName: string;
    lastName?: string;
    email?: string;
    phone: string;
    dateOfBirth?: string;
    gender?: "MALE" | "FEMALE" | "OTHER" | "";
  },
  userId?: string,
) => {
  const existing = await Patient.findOne({
    organizationId: data.organizationId,
    phone: data.phone,
  });
  if (existing) {
    return sendApiResponse(
      false,
      "A patient with this phone number already exists",
    );
  }

  const patient = await Patient.create({
    organizationId: data.organizationId,
    firstName: data.firstName,
    lastName: data.lastName || "",
    email: data.email || undefined,
    phone: data.phone,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    gender: data.gender || undefined,
  });

  if (userId) {
    await logActivity(
      data.organizationId,
      userId,
      "CREATED_PATIENT",
      "Patient",
      `Added new patient ${data.firstName} ${data.lastName || ""}`.trim(),
      patient._id,
    );
  }

  return sendApiResponse(true, "Patient created successfully", patient);
};

const SORT_OPTIONS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name_asc: { firstName: 1, lastName: 1 },
  name_desc: { firstName: -1, lastName: -1 },
  dob_asc: { dateOfBirth: 1 },
  dob_desc: { dateOfBirth: -1 },
};

export const getPatients = async (
  organizationId: string,
  requestingUser: RequestingUser,
  page: number = 1,
  limit: number = 10,
  search?: string,
  sortBy: string = "newest",
) => {
  const skip = (page - 1) * limit;
  const whereClause: any = { organizationId };
  const sort = SORT_OPTIONS[sortBy] || SORT_OPTIONS.newest;

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

    whereClause._id = { $in: await getVisiblePatientIds(organizationId, doctorScope) };
    appointmentDoctorFilter = { doctor: { $in: doctorScope } };
  }

  const [totalCount, patients, activeTreatments, messagesSent] =
    await Promise.all([
      Patient.countDocuments(whereClause),
      Patient.find(whereClause)
        .sort(sort)
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

// Patients whose date of birth falls on today's calendar date (any birth
// year) — used to power the "Birthday Today" broadcast audience so staff can
// send a same-day birthday wish without hunting for who's celebrating.
export const getBirthdayPatients = async (
  organizationId: string,
  requestingUser: RequestingUser,
) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const whereClause: any = {
    organizationId,
    dateOfBirth: { $exists: true, $ne: null },
    $expr: {
      $and: [
        { $eq: [{ $month: "$dateOfBirth" }, month] },
        { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] },
      ],
    },
  };

  // Same doctor-scoping rule as the regular patient list: a scoped
  // STAFF/DOCTOR only sees patients they've actually had appointments with.
  const doctorScope = await resolveDoctorScope(organizationId, requestingUser);
  if (doctorScope) {
    if (doctorScope.length === 0) {
      return sendApiResponse(true, "Birthday patients fetched successfully", {
        patients: [],
      });
    }
    whereClause._id = { $in: await getVisiblePatientIds(organizationId, doctorScope) };
  }

  const patients = await Patient.find(whereClause)
    .select("firstName lastName phone dateOfBirth")
    .lean();

  return sendApiResponse(true, "Birthday patients fetched successfully", {
    patients,
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
  // that the patient exists elsewhere in the clinic) — unless the patient has
  // no appointment with ANYONE yet (e.g. just added via "Add Patient"), in
  // which case they aren't tied to another doctor either and stay visible.
  if (doctorScope) {
    if (doctorScope.length === 0) {
      return sendApiResponse(false, "Patient not found", null);
    }
    const patientAppointmentFilter = {
      organizationId,
      $or: [{ patientId: id }, { patientPhone: patient.phone }],
    };
    const [hasAccess, hasAnyAppointment] = await Promise.all([
      Appointment.exists({ ...patientAppointmentFilter, doctor: { $in: doctorScope } }),
      Appointment.exists(patientAppointmentFilter),
    ]);
    if (!hasAccess && hasAnyAppointment) {
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
