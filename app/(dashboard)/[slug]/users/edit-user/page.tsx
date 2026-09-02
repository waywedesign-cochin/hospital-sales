import { getUserByIdAction } from "@/app/actions/userActions";
import { EditUserForm } from "@/components/dashboard/User/EditUserForm";

export default async function Page(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const id = await searchParams.id;

  if (!id) {
    return <p>Invalid user ID.</p>;
  }

  const response = await getUserByIdAction(id);

  if (!response?.success || !response.data) {
    return <p>User not found.</p>;
  }

  return <EditUserForm id={id} user={response.data} />;
}
