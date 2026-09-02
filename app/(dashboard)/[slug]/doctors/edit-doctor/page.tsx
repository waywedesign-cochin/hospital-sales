"use server";

import { getDoctorByIdAction } from "@/app/actions/doctorActions";
import { getTreatmentCategoriesAction } from "@/app/actions/treatmentCategoryActions";
import DoctorForm from "@/components/dashboard/Doctor/EditForm";

export default async function Page(props: { searchParams: Promise<any> }) {
  const { id } = await props.searchParams;
  console.log(id);

  if (!id) {
    return <p className="text-red-500">Invalid or missing doctor ID.</p>;
  }

  const response = await getDoctorByIdAction(id);
  const doctor = response.data ?? {};

  const catRes = await getTreatmentCategoriesAction();
  const categories = (catRes?.data || []).map((c: any) => c.name);

  return (
    <DoctorForm initialData={doctor} initialCategories={categories} />
  );
}
