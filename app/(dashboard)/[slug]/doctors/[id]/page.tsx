export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { getDoctorByIdAction } from "@/app/actions/doctorActions";
import ViewDoctorPage from "@/components/dashboard/Doctor/ViewDoctorPage";

export default async function ViewDoctor(props: {
  params: Promise<{ id: string }>;
}) {
  // ⬅ Must await params in Next.js 15+
  const { id } = await props.params;

  if (!id) {
    return <p className="text-red-500">Invalid or missing doctor ID.</p>;
  }

  const response = await getDoctorByIdAction(id);

  // Convert Mongoose -> plain object
  const doctor = JSON.parse(JSON.stringify(response.data ?? {}));

  return <ViewDoctorPage doctor={doctor} />;
}
