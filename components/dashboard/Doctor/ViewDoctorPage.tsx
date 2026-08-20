"use client";

import Breadcrumb from "@/components/shared/Breadcrumb";
import DeleteDialog from "@/components/shared/DeleteDialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  UserCircle,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Award,
  GraduationCap,
  Briefcase,
  FileText,
  Activity,
  ArrowLeft,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

interface DoctorViewProps {
  doctor: {
    _id?: string;
    prefix?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    contactNumber?: string;
    address?: string;
    qualification?: string;
    education?: string;
    specialization?: string[];
    experience?: string;
    registrationNumber?: string;
    status?: string;
  };
}

export default function ViewDoctorPage({ doctor }: DoctorViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fullName = `${doctor.prefix ?? ""} ${doctor.firstName ?? ""} ${
    doctor.lastName ?? ""
  }`.trim();
  const isActive = doctor.status?.toLowerCase() === "active";

  // Edit
  const handleEdit = (id: string) => {
    const params = new URLSearchParams(searchParams);
    if (id) params.set("id", id);
    router.push(`/doctors/edit-doctor?${params.toString()}`);
  };

  //delete
  const handleDelete = async (id: string) => {
    const respose = await axios.delete(`/api/doctor?id=${id}`);
    if (!respose.data.success) {
      toast.error(respose.data.message || "Failed to delete doctor");
      return;
    }
    toast.success("Doctor deleted successfully");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-2">
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 px-2 hover:bg-green-600 hover:text-white transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="h-4 w-px bg-slate-300" />
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Doctors", href: "/doctors" },
            { label: fullName, current: true },
          ]}
        />
      </div>
      {/* Main Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
        {/* Header Section with Gradient */}
        <div className="bg-greenpick p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="relative flex flex-col sm:flex-row text-center sm:text-left items-center gap-6">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl">
              <UserCircle className="w-20 h-20" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">{fullName}</h1>
              <p className="text-blue-100 text-lg">{doctor.qualification}</p>
              <div className="flex justify-center sm:justify-start items-center gap-2 mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-green-400/80 text-green-100"
                      : "bg-yellow-400/30 text-yellow-100"
                  }`}
                >
                  {doctor.status ?? "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard
            icon={<Mail className="w-5 h-5" />}
            label="Email"
            value={doctor.email ?? "-"}
          />
          <InfoCard
            icon={<Phone className="w-5 h-5" />}
            label="Phone"
            value={doctor.contactNumber ?? "-"}
          />
          <InfoCard
            icon={<Briefcase className="w-5 h-5" />}
            label="Experience"
            value={`${doctor.experience ?? "-"} Years`}
          />
          <InfoCard
            icon={<Activity className="w-5 h-5" />}
            label="Specialization"
            value={
              doctor.specialization
                ?.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(", ") ?? "-"
            }
          />
          <InfoCard
            icon={<GraduationCap className="w-5 h-5" />}
            label="Education"
            value={doctor.education ?? "-"}
          />
          <InfoCard
            icon={<FileText className="w-5 h-5" />}
            label="Registration No."
            value={doctor.registrationNumber ?? "-"}
          />
          <InfoCard
            icon={<MapPin className="w-5 h-5" />}
            label="Address"
            value={doctor.address ?? "-"}
            className="sm:col-span-2 lg:col-span-3"
          />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-8 pb-8">
          <Button
            onClick={() => handleEdit(doctor._id ?? "")}
            className="flex-1 sm:flex-none px-6 py-3 w-full bg-linear-to-r from-green-700 to-green-800 text-white rounded-xl flex items-center justify-center gap-2 hover:from-green-700 hover:to-green-800 transition-all shadow-lg shadow-green-600/30 hover:shadow-xl hover:shadow-green-600/40 hover:-translate-y-0.5"
          >
            <Edit className="w-4 h-4" /> Edit Details
          </Button>
          <DeleteDialog
            trigger={
              <Button className="flex-1 sm:flex-none w-full px-6 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl flex items-center justify-center gap-2 hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 hover:-translate-y-0.5">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            }
            title="Delete Doctor"
            description="Are you sure you want to delete this doctor?"
            onConfirm={() => handleDelete(doctor._id as string)}
            key={doctor._id}
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({
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
      className={`group bg-linear-to-br from-slate-50 to-slate-100/50 p-5 rounded-xl border border-slate-200/60 hover:border-blue-300 hover:shadow-md transition-all ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-green-600 group-hover:text-green-700 transition-colors mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-sm font-medium text-slate-800 wrap-break-words">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
