import { getDoctorsAction } from "@/app/actions/doctorActions";
import { Doctor } from "@/app/models/Doctor";
import DoctorsPage from "@/components/dashboard/Doctor/DoctorsPage";

export default async function DoctorsListPage(props: {
  searchParams: Promise<any>;
}) {
  const searchParams = await props.searchParams;

  const specialization = searchParams.specialization || "";
  const search = searchParams.search || "";
  const page = searchParams.page || 1;
  const limit = searchParams.limit || 10;
  
  const response = await getDoctorsAction(page, limit, search, specialization);

  const doctors = response?.data?.doctors ?? [];
  const pagination = {
    page: response?.data?.pagination?.page ?? 1,
    limit: response?.data?.pagination?.limit ?? 10,
    totalCount: response?.data?.pagination?.totalCount ?? 0,
    totalPages: response?.data?.pagination?.totalPages ?? 0,
  };

  return <DoctorsPage doctors={doctors} pagination={pagination} />;
}
