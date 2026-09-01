import { getAppointmentsAction } from "@/app/actions/appointmentsActions";
import { getDoctorsAction } from "@/app/actions/doctorActions";
import AppointmentsPage from "@/components/dashboard/Appoinment/AppoinmentsPage";
import React from "react";

const page = async (props: { searchParams: Promise<any> }) => {
  const searchParams = await props.searchParams;

  const page = searchParams.page || 1;
  const limit = searchParams.limit || 10;
  const status = searchParams.status || "";
  const search = searchParams.search || "";
  const doctor = searchParams.doctor || "";
  const year = searchParams.year || "";
  const month = searchParams.month || "";

  const appointmentsRes = await getAppointmentsAction(
    page,
    limit,
    doctor,
    search,
    status,
    year,
    month
  );
  const appointments = appointmentsRes?.data?.appointments ?? [];
  console.log(appointments);
  
  const pagination = {
    page: appointmentsRes?.data?.pagination?.page ?? 1,
    limit: appointmentsRes?.data?.pagination?.limit ?? 10,
    totalCount: appointmentsRes?.data?.pagination?.totalCount ?? 0,
    totalPages: appointmentsRes?.data?.pagination?.totalPages ?? 0,
  };
  //doctors
  const response = await getDoctorsAction(1, 0);
  const doctors = (response?.data?.doctors ?? []).map((doctor: any) => ({
    name: `${doctor.prefix} ${doctor.firstName} ${doctor.lastName}`,
    phone: doctor.contactNumber,
    ...doctor,
  }));

  return (
    <AppointmentsPage
      appointments={appointments}
      pagination={pagination}
      doctors={doctors}
    />
  );
};

export default page;
