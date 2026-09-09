import { getPatientsAction } from "@/app/actions/patientActions";
import { getOrganizationPlanAction } from "@/app/actions/organizationActions";
import MessagingPageClient from "@/components/dashboard/Messaging/MessagingPageClient";

export default async function MessagingPage() {
  const [patientsResponse, plan] = await Promise.all([
    getPatientsAction(1, 50),
    getOrganizationPlanAction(),
  ]);

  const initialPatients = patientsResponse?.data?.patients ?? [];

  return <MessagingPageClient initialPatients={initialPatients} plan={plan} />;
}
