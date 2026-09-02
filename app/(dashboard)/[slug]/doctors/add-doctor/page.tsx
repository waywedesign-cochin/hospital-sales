import AddDoctorPage from "@/components/dashboard/Doctor/addDoctorPage";
import { getTreatmentCategoriesAction } from "@/app/actions/treatmentCategoryActions";

async function AddDoctor() {
  const res = await getTreatmentCategoriesAction();
  const categories = (res?.data || []).map((c: any) => c.name);

  return <AddDoctorPage initialCategories={categories} />;
}

export default AddDoctor;
