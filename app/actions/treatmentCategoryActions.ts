"use server"

import { getTreatmentCategories } from "../controllers/treatmentCategoryController";
import { dbConnect } from "../lib/dbConnect";

export const getTreatmentCategoriesAction = async () => {
    await dbConnect();
    return await getTreatmentCategories();
};