import { getUsersAction } from "@/app/actions/userActions";
import UserManagementPage from "@/components/dashboard/User/UserManagementPage";

export default async function UsersPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;

  const role = searchParams.role || "";
  const search = searchParams.search || "";
  const page = searchParams.page || 1;
  const limit = searchParams.limit || 10;

  const response = await getUsersAction(page, limit, role, search);
  
  const users = response?.data?.users ?? [];
  const pagination = {
    page: response?.data?.pagination?.page ?? 1,
    limit: response?.data?.pagination?.limit ?? 10,
    totalCount: response?.data?.pagination?.totalCount ?? 0,
    totalPages: response?.data?.pagination?.totalPages ?? 0,
  };
  return <UserManagementPage users={users} pagination={pagination} />;
}
