"use client";

import DeleteDialog from "@/components/shared/DeleteDialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  FileText,
  Stethoscope,
  Edit,
  Trash2,
  UserCircle,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/shared/Breadcrumb";

export default function ViewAppointmentPage({
  appointment,
}: {
  appointment: any;
}) {
  const router = useRouter();

  const fullDoctorName = appointment.doctor
    ? `${appointment.doctor.prefix ?? ""} ${appointment.doctor.firstName} ${
        appointment.doctor.lastName
      }`
    : "Unknown";

  const isUpcoming =
    appointment.status === "SCHEDULED" || appointment.status === "IN_PROGRESS";

  const handleEdit = (id: string) => {
    router.push(`/appointments/edit-appointment?id=${id}`);
  };

  const handleDelete = async (id: string) => {
    const response = await axios.delete(`/api/appointment?id=${id}`);

    if (!response.data.success) {
      toast.error(response.data.message || "Failed to delete appointment");
      return;
    }

    toast.success("Appointment deleted");
    router.refresh();
    router.push("/appointments");
  };

  return (
    <div className="min-h-screen relative">
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 px-2.5 rounded-lg hover:bg-[#0D1117] hover:text-white transition-all duration-150 font-medium text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="h-4 w-px bg-slate-300" />
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Appointments", href: "/appointments" },
            { label: appointment.bookingId, current: true },
          ]}
        />
      </div>

      {/* Main Card */}
      <div className="relative z-10 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#0D1117] p-8 text-white flex flex-col sm:flex-row gap-6">
          <div className="p-4 rounded-2xl bg-white/5 flex items-center justify-center">
            <UserCircle className="w-20 h-20 text-emerald-400" />
          </div>

          <div>
            <h1 className="text-3xl font-bold">
              {appointment.firstName} {appointment.lastName || ""}
            </h1>
            <p className="text-slate-300 mt-1">
              Booking ID:{" "}
              <span className="font-semibold">{appointment.bookingId}</span>
            </p>

            <span
              className={`mt-3 inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${
                isUpcoming
                  ? "bg-emerald-400/20 text-emerald-300"
                  : "bg-amber-400/20 text-amber-300"
              }`}
            >
              {appointment.status}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoItem
            icon={<User className="w-5" />}
            label="Patient Name"
            value={
              `${appointment.firstName} ${appointment.lastName || ""}`.trim() ||
              "-"
            }
          />
          <InfoItem
            icon={<Phone className="w-5" />}
            label="Phone"
            value={appointment.patientPhone ?? "-"}
          />
          <InfoItem
            icon={<Mail className="w-5" />}
            label="Email"
            value={appointment.patientEmail ?? "-"}
          />
          <InfoItem
            icon={<Stethoscope className="w-5" />}
            label="Doctor"
            value={`${fullDoctorName}${
              appointment.doctor?.qualification?.trim()
                ? ` (${appointment.doctor.qualification})`
                : ""
            }`}
          />
          <InfoItem
            icon={<Calendar className="w-5" />}
            label="Date"
            value={new Date(appointment.date).toLocaleDateString() ?? "-"}
          />
          <InfoItem
            icon={<Clock className="w-5" />}
            label="Time"
            value={appointment.startTime ?? "-"}
          />
          <InfoItem
            icon={<Stethoscope className="w-5" />}
            label="Treatment Category"
            value={appointment.treatmentCategory ?? "-"}
            className="sm:col-span-2 lg:col-span-3"
          />
        </div>

        {/* Notes */}
        {appointment.notes && (
          <div className="px-8 pb-6">
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 text-slate-700">
              <p className="font-semibold mb-2 flex items-center gap-2 text-emerald-700">
                <FileText className="w-4" /> Notes
              </p>
              <p className="text-sm">{appointment.notes}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-8 pb-8 flex gap-4">
          <Button
            onClick={() => handleEdit(appointment._id ?? "")}
            className="px-6 py-3 flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm gap-2"
          >
            <Edit className="w-4" /> Edit
          </Button>

          <DeleteDialog
            trigger={
              <Button className="px-6 py-3 flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm gap-2">
                <Trash2 className="w-4" /> Delete
              </Button>
            }
            title="Delete Appointment"
            description="Are you sure you want to delete this appointment?"
            onConfirm={() => handleDelete(appointment._id ?? "")}
          />
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`group bg-white p-5 rounded-xl border border-slate-100 hover:border-emerald-300 transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-emerald-600 group-hover:text-emerald-700">
          {icon}
        </div>
        <div>
          <p className="text-xs text-emerald-600 uppercase font-semibold">
            {label}
          </p>
          <p className="text-sm font-medium text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
}
