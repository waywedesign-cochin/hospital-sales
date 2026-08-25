import TreatmentCategory from "../models/TreatmentCategory";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { sendResponse } from "../utils/responseHandler";
import { logActivity } from "./activityLogController";

export const addTreatmentCategory = async (data: {
  clinicId: string;
  userId?: string;
  name: string;
  description: string;
}) => {
  const existingTreatmentCategory = await TreatmentCategory.findOne({
    name: data.name,
    clinicId: data.clinicId,
  });
  if (existingTreatmentCategory) {
    return sendApiResponse(false, "Treatment Category already exists in this clinic");
  }
  const newTreatmentCategory = await TreatmentCategory.create(data);

  if (data.userId) {
    await logActivity(
      data.clinicId,
      data.userId,
      "ADDED_TREATMENT_CATEGORY",
      "TreatmentCategory",
      `Added a new treatment category: ${data.name}`,
      newTreatmentCategory._id
    );
  }

  return sendApiResponse(
    true,
    "Treatment Category created successfully",
    newTreatmentCategory
  );
};

export const getTreatmentCategories = async (clinicId: string) => {
  const treatmentCategories = await TreatmentCategory.find({ clinicId });
  const formattedTreatmentCategories = treatmentCategories.map((category) => ({
    _id: category._id.toString(),
    name: category.name,
    description: category.description,
  }))
  return sendResponse(
    true,
    "Treatment Categories fetched successfully",
    formattedTreatmentCategories
  );
};

export const updateTreatmentCategory = async (clinicId: string, id: string, userId: string, data: any) => {
  const updatedTreatmentCategory = await TreatmentCategory.findOneAndUpdate(
    { _id: id, clinicId },
    data,
    { new: true }
  );

  if (userId) {
    await logActivity(
      clinicId,
      userId,
      "UPDATED_TREATMENT_CATEGORY",
      "TreatmentCategory",
      `Updated treatment category`,
      id
    );
  }

  return sendApiResponse(
    true,
    "Treatment Category updated successfully",
    updatedTreatmentCategory
  );
};

export const deleteTreatmentCategory = async (clinicId: string, id: string, userId: string) => {
  const deletedTreatmentCategory = await TreatmentCategory.findOneAndDelete(
    { _id: id, clinicId }
  );

  if (userId) {
    await logActivity(
      clinicId,
      userId,
      "DELETED_TREATMENT_CATEGORY",
      "TreatmentCategory",
      `Deleted treatment category`,
      id
    );
  }

  return sendApiResponse(
    true,
    "Treatment Category deleted successfully",
    deletedTreatmentCategory
  );
};
