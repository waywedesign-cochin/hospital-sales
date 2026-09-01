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

  //appointment report
  const response = await getMonthWiseReportAction(year, doctorId);
  const report = response?.data ?? [];

  //enquiry report
  const enqResponse = await getEnquiryReportAction(year);
  const enquiryReport = enqResponse.data ?? [];
  //doctors
  const res = await getDoctorsAction(1, 0);
  const doctors = (res?.data?.doctors ?? []).map((doctor: any) => ({
    name: `${doctor.prefix} ${doctor.firstName} ${doctor.lastName}`,
    phone: doctor.contactNumber,
    ...doctor,
  }));

  //total summary
  const summaryRes = await getDashboardSummaryAction(year);
  const totalSummary = summaryRes?.data?.totalSummary ?? {
    totalAppointments: 0,
    totalEnquiries: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
  };

  //doctors summary
  const docSummaryRes = await getDoctorsAppointmentsSummaryAction(year??currentYear);
  const doctorsAppointmentSummary: DoctorAppointmentSummaryItem[] =
    docSummaryRes?.data ?? [];

  const todaysDate = new Date().toISOString().split("T")[0];
  //quick overview summary
  const quickOverviewRes = await getQuickOverviewSummaryAction(todaysDate);
  const quickOverviewSummary = quickOverviewRes.data;
 
  //setup status
  const setupStatusRes = await getSetupStatusAction();
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
