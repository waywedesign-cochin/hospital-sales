import MedicalNote from "../models/MedicalNote";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { logActivity } from "./activityLogController";

export const createMedicalNote = async (data: {
  organizationId: string;
  patientId: string;
  doctorId?: string;
  appointmentId?: string;
  type: "CONSULTATION" | "DIAGNOSIS" | "PRESCRIPTION" | "LAB_RESULT" | "FOLLOW_UP" | "GENERAL";
  title: string;
  content: string;
  createdBy: string;
}) => {
  const note = await MedicalNote.create(data);

  await logActivity(
    data.organizationId,
    data.createdBy,
    "ADDED_MEDICAL_NOTE",
    "MedicalNote",
    `Added ${data.type.toLowerCase()} note: ${data.title}`,
    note._id
  );

  return sendApiResponse(true, "Medical note added successfully", note);
};

export const getMedicalNotes = async (
  organizationId: string,
  patientId: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const totalCount = await MedicalNote.countDocuments({ organizationId, patientId });
  const notes = await MedicalNote.find({ organizationId, patientId })
    .populate("doctorId", "firstName lastName prefix")
    .populate("createdBy", "firstName lastName role")
    .populate("appointmentId", "bookingId treatmentCategory date startTime")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const serialized = notes.map((n: any) => ({
    _id: n._id.toString(),
    type: n.type,
    title: n.title,
    content: n.content,
    doctor: n.doctorId
      ? {
          _id: n.doctorId._id.toString(),
          firstName: n.doctorId.firstName,
          lastName: n.doctorId.lastName,
          prefix: n.doctorId.prefix,
        }
      : null,
    appointment: n.appointmentId
      ? {
          _id: n.appointmentId._id.toString(),
          bookingId: n.appointmentId.bookingId,
          treatmentCategory: n.appointmentId.treatmentCategory,
          date: n.appointmentId.date,
          startTime: n.appointmentId.startTime,
        }
      : null,
    createdBy: n.createdBy
      ? {
          firstName: n.createdBy.firstName,
          lastName: n.createdBy.lastName,
          role: n.createdBy.role,
        }
      : null,
    createdAt: n.createdAt,
  }));

  return sendApiResponse(true, "Medical notes fetched", {
    notes: serialized,
    pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
  });
};

export const deleteMedicalNote = async (
  organizationId: string,
  noteId: string,
  userId: string
) => {
  const note = await MedicalNote.findOneAndDelete({ _id: noteId, organizationId });
  if (!note) {
    return sendApiResponse(false, "Note not found");
  }

  await logActivity(
    organizationId,
    userId,
    "DELETED_MEDICAL_NOTE",
    "MedicalNote",
    `Deleted medical note: ${note.title}`,
    noteId
  );

  return sendApiResponse(true, "Medical note deleted");
};
