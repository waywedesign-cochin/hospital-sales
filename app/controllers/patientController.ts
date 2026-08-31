import Patient from "../models/Patient";
import Appointment from "../models/Appointment";
import MessageLog from "../models/MessageLog";
import { sendApiResponse } from "../utils/nextResponseHandler";

export const getPatients = async (
  organizationId: string,
  page: number = 1,
  limit: number = 10,
  search?: string
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

  const [totalCount, patients, activeTreatments, messagesSent] = await Promise.all([
    Patient.countDocuments(whereClause),
    Patient.find(whereClause).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Appointment.countDocuments({ organizationId, status: "IN_PROGRESS" }),
    MessageLog.countDocuments({ organizationId })
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

export const getPatientById = async (organizationId: string, id: string) => {
  const patient = await Patient.findOne({ _id: id, organizationId }).lean();
  if (!patient) {
    return sendApiResponse(false, "Patient not found", null);
  }
  return sendApiResponse(true, "Patient fetched successfully", patient);
};
