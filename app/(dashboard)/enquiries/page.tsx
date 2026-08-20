import {
  getEnquiriesAction,
  getEnquirySummaryAction,
} from "@/app/actions/enquiryActions";
// import { EnquirySummary } from "@/app/controllers/enquiryController";
import EnquiryPage, {
  EnquirySummaryCardsData,
} from "@/components/dashboard/Enquiries/EnquiryPage";

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

  return (
    <EnquiryPage
      enquiries={enquiries}
      pagination={pagination}
      summary={enquirySummary as EnquirySummaryCardsData}
    />
  );
};

export default page;
