import Patient from "../models/Patient";
import { sendApiResponse } from "../utils/nextResponseHandler";

export const getPatients = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  const skip = (page - 1) * limit;
  const whereClause: any = {};
  
  if (search) {
    whereClause.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const totalCount = await Patient.countDocuments(whereClause);
  const patients = await Patient.find(whereClause)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return sendApiResponse(true, "Patients fetched successfully", {
    patients,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
};

export const getPatientById = async (id: string) => {
  const patient = await Patient.findById(id).lean();
  if (!patient) {
    return sendApiResponse(false, "Patient not found", null);
  }
  return sendApiResponse(true, "Patient fetched successfully", patient);
};
