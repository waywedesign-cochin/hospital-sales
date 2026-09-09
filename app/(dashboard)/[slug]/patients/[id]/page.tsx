import { getPatientByIdAction } from "@/app/actions/patientActions";
import PatientDetailClient from "@/components/dashboard/Patients/PatientDetailClient";

export default async function PatientProfilePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const response = await getPatientByIdAction(id);

  if (!response?.success || !response?.data) {
    return <div className="p-8 text-center text-slate-500">Patient not found.</div>;
  }

  return <PatientDetailClient id={id} initialPatient={response.data} />;
}
