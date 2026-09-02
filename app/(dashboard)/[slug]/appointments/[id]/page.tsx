export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { getAppointmentByIdAction } from "@/app/actions/appointmentsActions";
import ViewAppointmentPage from "@/components/dashboard/Appoinment/ViewAppointmentPage";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const res = await getAppointmentByIdAction(id);

  const appointment = res?.data
    ? JSON.parse(JSON.stringify(res.data))
    : null;

  return <ViewAppointmentPage appointment={appointment} />;
}
