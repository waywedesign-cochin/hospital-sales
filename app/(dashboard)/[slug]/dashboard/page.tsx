import {
  getMonthWiseReportAction,
  getAppointmentsAction,
  getTodaysAgendaAction,
} from "@/app/actions/appointmentsActions";
import {
  getDashboardSummaryAction,
  getDoctorsAppointmentsSummaryAction,
  getQuickOverviewSummaryAction,
  getSetupStatusAction,
} from "@/app/actions/dashboardActions";
import { getDoctorsAction } from "@/app/actions/doctorActions";
import {
  getEnquiryReportAction,
  getEnquiriesAction,
} from "@/app/actions/enquiryActions";
import { getPatientsAction } from "@/app/actions/patientActions";
import DashboardHome, {
  DoctorAppointmentSummaryItem,
  QuickOverviewData,
} from "@/components/dashboard/Overview/DashboardOverview";
import React from "react";

const page = async (props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<any>;
}) => {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const currentYear = new Date().getFullYear().toString();
  const year = searchParams.year || "";
  const doctorId = searchParams.doctor || "";
  const todaysDate = new Date().toISOString().split("T")[0];
  const quickOverviewRange = searchParams.quickOverviewRange || "daily";

  const [
    response,
    enqResponse,
    res,
    summaryRes,
    docSummaryRes,
    quickOverviewRes,
    setupStatusRes,
    recentAppointmentsRes,
    newEnquiriesRes,
    patientsRes,
    todaysAgendaRes,
  ] = await Promise.all([
    getMonthWiseReportAction(year, doctorId),
    getEnquiryReportAction(year),
    getDoctorsAction(1, 0),
    getDashboardSummaryAction(year),
    getDoctorsAppointmentsSummaryAction(year??currentYear),
    getQuickOverviewSummaryAction(todaysDate, quickOverviewRange),
    getSetupStatusAction(),
    getAppointmentsAction(1, 5),
    getEnquiriesAction(1, 5, undefined, undefined, "NEW"),
    getPatientsAction(1, 1),
    doctorId
      ? getTodaysAgendaAction(doctorId, todaysDate)
      : Promise.resolve({ data: { appointments: [] } }),
  ]);

  //appointment report
  const report = response?.data ?? [];

  //enquiry report
  const enquiryReport = enqResponse.data ?? [];
  //doctors
  const doctors = (res?.data?.doctors ?? []).map((doctor: any) => ({
    name: `${doctor.prefix} ${doctor.firstName} ${doctor.lastName}`,
    phone: doctor.contactNumber,
    ...doctor,
  }));

  //total summary
  const totalSummary = summaryRes?.data?.totalSummary ?? {
    totalAppointments: 0,
    totalEnquiries: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
  };

  //doctors summary
  const doctorsAppointmentSummary: DoctorAppointmentSummaryItem[] =
    docSummaryRes?.data ?? [];

  //quick overview summary
  const quickOverviewSummary = quickOverviewRes.data;

  //setup status
  const setupStatus = setupStatusRes.data;

  //recent appointments (for the "Recent Appointments" table)
  const recentAppointments = recentAppointmentsRes?.data?.appointments ?? [];

  //new enquiries awaiting follow-up (for the "New Enquiries" panel)
  const newEnquiries = newEnquiriesRes?.data?.enquiries ?? [];

  //total patients (scoped to the requesting user, same as the Patients page)
  const totalPatients = patientsRes?.data?.pagination?.totalCount ?? 0;

  //today's agenda (doctor's own schedule, only populated once ?doctor= is set)
  const todaysAgenda = todaysAgendaRes?.data?.appointments ?? [];

  return (
    <DashboardHome
      slug={slug}
      appointmentData={report}
      doctors={doctors}
      enquiryData={enquiryReport}
      totalSummary={totalSummary}
      recentAppointments={recentAppointments}
      newEnquiries={newEnquiries}
      totalPatients={totalPatients}
      todaysAgenda={todaysAgenda}
      doctorsAppointmentSummary={doctorsAppointmentSummary}
      quickOverview={quickOverviewSummary as QuickOverviewData}
      setupStatus={setupStatus}
    />
  );
};

export default page;
