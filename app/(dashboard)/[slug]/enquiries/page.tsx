import {
  getEnquiriesAction,
  getEnquirySummaryAction,
} from "@/app/actions/enquiryActions";
import { getSetupStatusAction } from "@/app/actions/dashboardActions";
// import { EnquirySummary } from "@/app/controllers/enquiryController";
import EnquiryPage, {
  EnquirySummaryCardsData,
} from "@/components/dashboard/Enquiries/EnquiryPage";
import { getTreatmentCategoriesAction } from "@/app/actions/treatmentCategoryActions";

const page = async (props: { searchParams: Promise<any> }) => {
  const searchParams = await props.searchParams;

  const page = searchParams.page || 1;
  const limit = searchParams.limit || 10;
  const search = searchParams.search || "";
  const treatmentCategory = searchParams.treatmentCategory || "";
  const status = searchParams.status || "";
  const source = searchParams.source || "";
  const fromDate = searchParams.fromDate || "";
  const toDate = searchParams.toDate || "";

  const response = await getEnquiriesAction(
    page,
    limit,
    search,
    treatmentCategory,
    status,
    source,
    fromDate,
    toDate,
  );
  const enquiries = (response?.data?.enquiries ?? []).map((enquiry: any) => ({
    ...enquiry,
    handledBy: enquiry.handledBy === null ? undefined : enquiry.handledBy,
  }));
  const pagination = {
    page: response?.data?.pagination?.page ?? 1,
    limit: response?.data?.pagination?.limit ?? 10,
    totalCount: response?.data?.pagination?.totalCount ?? 0,
    totalPages: response?.data?.pagination?.totalPages ?? 0,
  };

  const summary = await getEnquirySummaryAction(fromDate, toDate);
  const enquirySummary = summary.data ?? {
    newEnquiries: 0,
    contacted: 0,
    appointmentsBooked: 0,
    followUps: 0,
    totalEnquiries: 0,
    conversionRate: 0,
    topCategory: "SKIN",
  };

  const setupStatusRes = await getSetupStatusAction();
  const setupStatus = setupStatusRes?.data;

  const categoriesRes = await getTreatmentCategoriesAction();
  const categories = categoriesRes?.data?.map((c: any) => c.name) || [];

  return (
    <EnquiryPage
      enquiries={enquiries}
      pagination={pagination}
      summary={enquirySummary as EnquirySummaryCardsData}
      setupStatus={setupStatus}
      categories={categories}
    />
  );
};

export default page;
