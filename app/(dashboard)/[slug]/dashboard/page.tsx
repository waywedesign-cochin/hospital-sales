import { getMonthWiseReportAction } from "@/app/actions/appointmentsActions";
import {
  getDashboardSummaryAction,
  getDoctorsAppointmentsSummaryAction,
  getQuickOverviewSummaryAction,
  getSetupStatusAction,
} from "@/app/actions/dashboardActions";
import { getDoctorsAction } from "@/app/actions/doctorActions";
import { getEnquiryReportAction } from "@/app/actions/enquiryActions";
import DashboardHome, {
  DoctorAppointmentSummaryItem,
  QuickOverviewData,
} from "@/components/dashboard/Overview/DashboardOverview";
import React from "react";

const page = async (props: { searchParams: Promise<any> }) => {
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
  ] = await Promise.all([
    getMonthWiseReportAction(year, doctorId),
    getEnquiryReportAction(year),
    getDoctorsAction(1, 0),
    getDashboardSummaryAction(year),
    getDoctorsAppointmentsSummaryAction(year??currentYear),
    getQuickOverviewSummaryAction(todaysDate, quickOverviewRange),
    getSetupStatusAction(),
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

  return (
    <DashboardHome
      appointmentData={report}
      doctors={doctors}
      enquiryData={enquiryReport}
      totalSummary={totalSummary}
      doctorsAppointmentSummary={doctorsAppointmentSummary}
      quickOverview={quickOverviewSummary as QuickOverviewData}
      setupStatus={setupStatus}
    />
  );
};

export default page;
