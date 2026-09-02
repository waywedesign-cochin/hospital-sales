import { getAppointmentByIdAction } from "@/app/actions/appointmentsActions";
import { getDoctorsAction } from "@/app/actions/doctorActions";
import EditAppointmentForm from "@/components/dashboard/Appoinment/EditAppointmentForm";
import React from "react";

const page = async (props: { searchParams: Promise<any> }) => {
  const { id } = await props.searchParams;
  const { specialization } = (await props.searchParams) || "";

  if (!id) {
    return <p className="text-red-500">Invalid or missing appointment ID.</p>;
  }

  const response = await getAppointmentByIdAction(id);
  const appointment = response?.data ?? {};

  const docResponse = await getDoctorsAction(1, 0, specialization);
  const doctors = (docResponse?.data?.doctors ?? []).map((doctor: any) => ({
    name: `${doctor.prefix} ${doctor.firstName} ${doctor.lastName}`,
    phone: doctor.contactNumber,
    departmentId: doctor.departmentId || "",
    consultationFee: doctor.consultationFee || 0,
    ...doctor,
  }));

  const serializedAppointment = JSON.parse(JSON.stringify(appointment));
  const serializedDoctors = JSON.parse(JSON.stringify(doctors));

  return <EditAppointmentForm appointment={serializedAppointment} doctors={serializedDoctors} />;
};

export default page;
