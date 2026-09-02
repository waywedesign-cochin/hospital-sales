import { getOrgBillingSummaryAction } from "@/app/actions/subscriptionActions";
import BillingPage from "@/components/dashboard/Billing/BillingPage";

export default async function BillingPageWrapper() {
  const res = await getOrgBillingSummaryAction();
  const billingData = res?.data ? JSON.parse(JSON.stringify(res.data)) : null;

  return <BillingPage data={billingData} />;
}
