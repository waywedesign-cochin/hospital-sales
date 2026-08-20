export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { getDoctorsAction } from "@/app/actions/doctorActions";
import CalendarView from "@/components/dashboard/Appoinment/CalenderView";

export default async function Page() {
  const response = await getDoctorsAction(1, 0);
  const doctors = (response?.data?.doctors ?? []).map((doctor: any) => ({
    name: `${doctor.prefix} ${doctor.firstName} ${doctor.lastName}`,
    phone: doctor.contactNumber,
    departmentId: doctor.departmentId || "",
    departmentName: doctor.departmentName || "",
    consultationFee: doctor.consultationFee || 0,
    ...doctor,
  }));
  return <CalendarView doctors={doctors} />;
}
