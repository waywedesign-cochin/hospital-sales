import AddEnquiryForm from "@/components/dashboard/Enquiries/AddEnquiryForm";
import { getTreatmentCategoriesAction } from "@/app/actions/treatmentCategoryActions";
import React from "react";

const page = async () => {
  const res = await getTreatmentCategoriesAction();
  const categories = (res?.data || []).map((c: any) => c.name);

  return (
    <div>
      <AddEnquiryForm initialCategories={categories} />
    </div>
  );
};

export default page;
