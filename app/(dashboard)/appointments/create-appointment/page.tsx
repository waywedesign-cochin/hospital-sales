import { getDoctorsAction } from "@/app/actions/doctorActions";
import AppointmentForm from "@/components/dashboard/Appoinment/CreateAppoinmentForm";
import React from "react";

const page = async (props: { searchParams: Promise<any> }) => {
  const searchParams = await props.searchParams;
 //date from calender view
  const date = searchParams?.date ?? "";
  //prefill data from enquiry
  const prefillData = {
    name: searchParams?.name ?? "",
    email: searchParams?.email ?? "",
    phone: searchParams?.phone ?? "",
    enquiryId: searchParams?.enquiryId ?? "",
    status: searchParams?.status ?? "",
    staffNotes: searchParams?.staffNotes ?? "",
  };
  const specialization = searchParams.specialization || "";

  const response = await getDoctorsAction(1, 0, specialization);
  const doctors = (response?.data?.doctors ?? []).map((doctor: any) => ({
    name: `${doctor.prefix} ${doctor.firstName} ${doctor.lastName}`,
    phone: doctor.contactNumber,
    departmentId: doctor.departmentId || "",
    consultationFee: doctor.consultationFee || 0,
    ...doctor,
  }));
  return <AppointmentForm doctors={doctors} date={date} prefill={prefillData} />;
};

export default page;
