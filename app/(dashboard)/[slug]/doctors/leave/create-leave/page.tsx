import { getDoctorsAction } from "@/app/actions/doctorActions";
import DoctorLeaveForm from "@/components/dashboard/Doctor/Leave/CreateLeaveForm";
import React from "react";

const page = async (props: { searchParams: Promise<any> }) => {
  const response = await getDoctorsAction(1, 0);
  const doctors = (response?.data?.doctors ?? []).map((doctor: any) => ({
    name: `${doctor.prefix} ${doctor.firstName} ${doctor.lastName}`,
    phone: doctor.contactNumber,
    departmentId: doctor.departmentId || "",
    consultationFee: doctor.consultationFee || 0,
    ...doctor,
  }));
  return <DoctorLeaveForm doctors={doctors} />;
};

export default page;
