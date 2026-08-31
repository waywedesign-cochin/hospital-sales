"use server"

import { getTreatmentCategories } from "../controllers/treatmentCategoryController";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";

export const getTreatmentCategoriesAction = async () => {
    await dbConnect();
    const user = await requireAuth();
    return await getTreatmentCategories(user.organizationId);
};