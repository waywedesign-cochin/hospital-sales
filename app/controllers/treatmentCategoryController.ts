import TreatmentCategory from "../models/TreatmentCategory";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { sendResponse } from "../utils/responseHandler";

export const addTreatmentCategory = async (data: {
  name: string;
  description: string;
}) => {
  const existingTreatmentCategory = await TreatmentCategory.findOne({
    name: data.name,
  });
  if (existingTreatmentCategory) {
    return sendApiResponse(false, "Treatment Category already exists");
  }
  const newTreatmentCategory = await TreatmentCategory.create(data);
  return sendApiResponse(
    true,
    "Treatment Category created successfully",
    newTreatmentCategory
  );
};

export const getTreatmentCategories = async () => {
  const treatmentCategories = await TreatmentCategory.find();
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

export const updateTreatmentCategory = async (id: string, data: any) => {
  const updatedTreatmentCategory = await TreatmentCategory.findByIdAndUpdate(
    id,
    data,
    { new: true }
  );
  return sendApiResponse(
    true,
    "Treatment Category updated successfully",
    updatedTreatmentCategory
  );
};

export const deleteTreatmentCategory = async (id: string) => {
  const deletedTreatmentCategory = await TreatmentCategory.findByIdAndDelete(
    id
  );
  return sendApiResponse(
    true,
    "Treatment Category deleted successfully",
    deletedTreatmentCategory
  );
};
