import { getTreatmentCategoriesAction } from "@/app/actions/treatmentCategoryActions";
import TreatmentCategoryPage from "@/components/dashboard/Settings/TreatmentCategoryPage";
import React from "react";

const page = async () => {
  const response = await getTreatmentCategoriesAction();
  const treatmentCategories = response?.data ?? [];
  return <TreatmentCategoryPage treatmentCategories={treatmentCategories} />;
};

export default page;
