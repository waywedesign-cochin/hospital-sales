import { getPatientsAction } from "@/app/actions/patientActions";
import PatientsPageClient from "@/components/dashboard/Patients/PatientsPageClient";

export default async function PatientsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";
  const page = Number(searchParams.page) || 1;
  const limit = 10;

  const response = await getPatientsAction(page, limit, search);

  const patients = response?.data?.patients ?? [];
  const pagination = {
    page: response?.data?.pagination?.page ?? 1,
    limit: response?.data?.pagination?.limit ?? limit,
    totalCount: response?.data?.pagination?.totalCount ?? 0,
    totalPages: response?.data?.pagination?.totalPages ?? 0,
  };
  const activeTreatments = response?.data?.activeTreatments ?? 0;
  const messagesSent = response?.data?.messagesSent ?? 0;

  return (
    <PatientsPageClient
      patients={patients}
      pagination={pagination}
      activeTreatments={activeTreatments}
      messagesSent={messagesSent}
    />
  );
}
