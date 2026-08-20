import {
  getDoctorsAction,
  getDoctorsLeavesAction,
} from "@/app/actions/doctorActions";
import EditLeaveForm from "@/components/dashboard/Doctor/Leave/EditLeave";
import React from "react";

const page = async (props: { searchParams: Promise<any> }) => {
  const { id } = await props.searchParams;

  if (!id) {
    return <p className="text-red-500">Invalid or missing doctor ID.</p>;
  }
  const response = await getDoctorsAction(1, 0);
  const doctors = (response?.data?.doctors ?? []).map((doctor: any) => ({
    name: `${doctor.prefix} ${doctor.firstName} ${doctor.lastName}`,
    phone: doctor.contactNumber,
    departmentId: doctor.departmentId || "",
    consultationFee: doctor.consultationFee || 0,
    ...doctor,
  }));
  const leaveResponse = await getDoctorsLeavesAction(id);
  const leave = leaveResponse?.data?.leaves[0] ?? {};
  return <EditLeaveForm doctors={doctors} leaveId={id} initialData={leave} />;
};

export default page;
