"use server";
import ActivityPage from "@/components/dashboard/Enquiries/ActivityPage";
import { getEnquiryActivitiesAction } from "@/app/actions/enquiryActivityActions";

export default async function ActivtyPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;

  const res = await getEnquiryActivitiesAction(slug, page, limit);
  const safeData = res?.data ?? {
    activities: [],
    pagination: {
      page,
      limit,
      totalCount: 0,
      totalPages: 1,
    },
  };
  return (
    <div className="space-y-8">
      <ActivityPage enquiryId={slug} initialData={safeData} />
    </div>
  );
}
