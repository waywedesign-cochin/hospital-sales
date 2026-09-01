import {
  getDoctorsAction,
  getDoctorsLeavesAction,
} from "@/app/actions/doctorActions";
import DoctorLeaveList from "@/components/dashboard/Doctor/Leave/LeavesList";

const page = async (props: { searchParams: Promise<any> }) => {
  const searchParams = await props.searchParams;
  const search = searchParams.search || "";
  const page = searchParams.page || 1;
  const limit = searchParams.limit || 10;
  const type = searchParams.type || "";
  const doctor = searchParams.doctor || "";
  const month = searchParams.month || "";
  const year = searchParams.year || "";

  //leaves
  const response = await getDoctorsLeavesAction(
    search,
    page,
    limit,
    type,
    doctor,
    month,
    year
  );
  const leaves = response.data?.leaves ?? [];
  const pagination = {
    page: response?.data?.pagination?.page ?? 1,
    limit: response?.data?.pagination?.limit ?? 10,
    totalCount: response?.data?.pagination?.totalCount ?? 0,
    totalPages: response?.data?.pagination?.totalPages ?? 0,
  };

  //doctors
  const doctorResponse = await getDoctorsAction(1, 0);
  const doctors = (doctorResponse?.data?.doctors ?? []).map((doctor: any) => ({
    name: `${doctor.prefix} ${doctor.firstName} ${doctor.lastName}`,
    phone: doctor.contactNumber,
    departmentId: doctor.departmentId || "",
    consultationFee: doctor.consultationFee || 0,
    ...doctor,
  }));
  return (
    <DoctorLeaveList
      leaves={leaves}
      doctors={doctors}
      pagination={pagination}
    />
  );
};

export default page;
