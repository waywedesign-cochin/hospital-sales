import { getPlatformBillingSummaryAction } from "@/app/actions/subscriptionActions";
import PlatformBillingDashboard from "@/components/dashboard/PlatformAdmin/PlatformBillingDashboard";

export default async function PlatformBillingPage() {
  const res = await getPlatformBillingSummaryAction();
  const data = res?.data ? JSON.parse(JSON.stringify(res.data)) : null;

  return <PlatformBillingDashboard data={data} />;
}
