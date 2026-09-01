"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  Activity,
  MessageCircle,
  FileText,
  Clock,
  Tag,
  Inbox,
  Plus,
  Stethoscope,
  Pill,
  FlaskConical,
  ClipboardList,
  Trash2,
  Edit,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  prefix?: string;
  specialization?: string[];
}

interface AppointmentRecord {
  _id: string;
  bookingId: string;
  firstName: string;
  lastName?: string;
  treatmentCategory: string;
  date: string;
  startTime: string;
  status: string;
  notes?: string;
  doctor: Doctor | null;
}

interface EnquiryRecord {
  _id: string;
  firstName: string;
  lastName?: string;
  treatmentCategory: string;
  message: string;
  status: string;
  source: string;
  createdAt: string;
}

interface MedicalNoteRecord {
  _id: string;
  type: string;
  title: string;
  content: string;
  doctor: { _id: string; firstName: string; lastName: string; prefix?: string } | null;
  appointment: { _id: string; bookingId: string; treatmentCategory: string; date: string; startTime: string } | null;
  createdBy: { firstName: string; lastName: string; role: string } | null;
  createdAt: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  medicalHistory?: string;
  createdAt: string;
  appointments: AppointmentRecord[];
  enquiries: EnquiryRecord[];
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-gray-100 text-gray-600",
};

const enquiryStatusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-indigo-100 text-indigo-700",
  FOLLOW_UP: "bg-amber-100 text-amber-700",
  APPOINTMENT_BOOKED: "bg-green-100 text-green-700",
};

const sourceLabels: Record<string, string> = {
  WEBSITE: "🌐 Website",
  PHONE: "📞 Phone",
  WHATSAPP: "💬 WhatsApp",
  OTHER: "📋 Other",
};

const NOTE_TYPES = [
  { value: "CONSULTATION", label: "Consultation", icon: Stethoscope, color: "bg-blue-100 text-blue-600" },
  { value: "DIAGNOSIS", label: "Diagnosis", icon: ClipboardList, color: "bg-purple-100 text-purple-600" },
  { value: "PRESCRIPTION", label: "Prescription", icon: Pill, color: "bg-green-100 text-green-600" },
  { value: "LAB_RESULT", label: "Lab Result", icon: FlaskConical, color: "bg-amber-100 text-amber-600" },
  { value: "FOLLOW_UP", label: "Follow Up", icon: Calendar, color: "bg-indigo-100 text-indigo-600" },
  { value: "GENERAL", label: "General", icon: FileText, color: "bg-slate-100 text-slate-600" },
];

export default function PatientProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"appointments" | "enquiries" | "notes">("appointments");

  // Medical Notes state
  const [medicalNotes, setMedicalNotes] = useState<MedicalNoteRecord[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteForm, setNoteForm] = useState({
    type: "GENERAL" as string,
    title: "",
    content: "",
  });
  const [noteSaving, setNoteSaving] = useState(false);

  // Edit Patient State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    bloodGroup: "",
    gender: "",
    dateOfBirth: "",
    address: "",
  });
  const [editSaving, setEditSaving] = useState(false);


  useEffect(() => {
    if (!id) return;
    const fetchPatient = async () => {
      try {
        const res = await axios.get(`/api/patients/${id}`);
        if (res.data.success) {
          setPatient(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch patient:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  // Fetch medical notes
  const fetchNotes = async () => {
    try {
      setNotesLoading(true);
      const res = await axios.get(`/api/medical-notes?patientId=${id}`);
      if (res.data.success) {
        setMedicalNotes(res.data.data.notes || []);
      }
    } catch (error) {
      console.error("Failed to fetch medical notes:", error);
    } finally {
      setNotesLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchNotes();
  }, [id]);

  const handleAddNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    try {
      setNoteSaving(true);
      const res = await axios.post("/api/medical-notes", {
        patientId: id,
        type: noteForm.type,
        title: noteForm.title,
        content: noteForm.content,
      });
      if (res.data.success) {
        toast.success("Medical note added");
        setNoteModalOpen(false);
        setNoteForm({ type: "GENERAL", title: "", content: "" });
        fetchNotes();
      } else {
        toast.error(res.data.message || "Failed to add note");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add note");
    } finally {
      setNoteSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this medical note?")) return;
    try {
      const res = await axios.delete(`/api/medical-notes?id=${noteId}`);
      if (res.data.success) {
        toast.success("Note deleted");
        fetchNotes();
      }
    } catch {
      toast.error("Failed to delete note");
    }
  };

  const handleEditSubmit = async () => {
    try {
      setEditSaving(true);
      const res = await axios.put(`/api/patients/${id}`, editForm);
      if (res.data.success) {
        toast.success("Patient details updated");
        setPatient({ ...patient!, ...editForm });
        setEditModalOpen(false);
      } else {
        toast.error(res.data.message || "Failed to update");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update");
    } finally {
      setEditSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading patient profile...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return <div className="p-8 text-center text-slate-500">Patient not found.</div>;
  }

  const upcomingAppointments = patient.appointments.filter(
    (a) => a.status === "SCHEDULED" || a.status === "IN_PROGRESS"
  );

  const getNoteTypeInfo = (type: string) =>
    NOTE_TYPES.find((t) => t.value === type) || NOTE_TYPES[NOTE_TYPES.length - 1];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-blue-50">
        <div className="absolute inset-0" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 relative z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="rounded-full w-10 h-10 p-0 text-slate-500 hover:bg-white/50 hover:text-slate-800"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="bg-blue-primary p-3 rounded-xl shadow-lg shadow-blue-500/30">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                {patient.firstName} {patient.lastName && patient.lastName !== "-" ? patient.lastName : ""}
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
                  Active
                </span>
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Patient ID: {patient._id.slice(-6).toUpperCase()} • Joined{" "}
                {new Date(patient.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="border-slate-200 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600"
              onClick={() => {
                setEditForm({
                  bloodGroup: patient.bloodGroup || "",
                  gender: patient.gender || "",
                  dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split("T")[0] : "",
                  address: patient.address || "",
                });
                setEditModalOpen(true);
              }}
            >
              <Edit className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
            <Button
              variant="outline"
              className="border-slate-200 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600"
              onClick={() => router.push(`/messaging`)}
            >
              <MessageCircle className="w-4 h-4 mr-2" /> Message
            </Button>
            <Button
              className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-sm font-semibold"
              onClick={() =>
                router.push(
                  `/appointments/create-appointment?name=${encodeURIComponent(
                    `${patient.firstName} ${patient.lastName || ""}`.trim()
                  )}&patientEmail=${encodeURIComponent(patient.email || "")}&patientPhone=${encodeURIComponent(
                    patient.phone
                  )}`
                )
              }
            >
              <Calendar className="w-4 h-4 mr-2" /> Book Appointment
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="border-0 shadow-xl shadow-blue-900/20 rounded-3xl overflow-hidden bg-linear-to-br from-[#00236F] via-[#003fb3] to-[#0055ff] text-white relative">
            {/* Luminous overlay for premium texture */}
            <div className="absolute inset-0 bg-white/5 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-300/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="px-6 pb-8 pt-10 relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white/10 rounded-full border-4 border-white/20 shadow-xl flex items-center justify-center mb-5 backdrop-blur-md">
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#00236F] text-3xl font-extrabold shadow-inner">
                  {patient.firstName.charAt(0)}
                  {patient.lastName && patient.lastName !== "-" ? patient.lastName.charAt(0) : ""}
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-1 tracking-tight shadow-black/10 drop-shadow-md">
                {patient.firstName} {patient.lastName && patient.lastName !== "-" ? patient.lastName : ""}
              </h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-blue-100 text-xs font-medium bg-black/20 px-3 py-1 rounded-full border border-white/10 shadow-sm backdrop-blur-md">
                  ID: {patient._id.slice(-6).toUpperCase()}
                </span>
                <span className="text-blue-100 text-xs font-medium bg-black/20 px-3 py-1 rounded-full border border-white/10 shadow-sm backdrop-blur-md">
                  Joined {new Date(patient.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="space-y-4 w-full text-left bg-black/15 p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
                <div className="flex items-center gap-3 text-sm text-blue-50 font-medium">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Phone className="w-4 h-4 text-cyan-200" />
                  </div>
                  {patient.phone}
                </div>
                {patient.email && (
                  <div className="flex items-center gap-3 text-sm text-blue-50 font-medium">
                    <div className="p-2 rounded-lg bg-white/10">
                      <Mail className="w-4 h-4 text-cyan-200" />
                    </div>
                    {patient.email}
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-blue-50 font-medium">
                  <div className="p-2 rounded-lg bg-white/10">
                    <User className="w-4 h-4 text-cyan-200" />
                  </div>
                  {patient.gender || "Not specified"} • {patient.bloodGroup || "Blood Group N/A"}
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">{patient.appointments.length}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Appointments</p>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded-xl">
                  <p className="text-2xl font-bold text-indigo-600">{patient.enquiries.length}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Enquiries</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">
                    {patient.appointments.filter((a) => a.status === "COMPLETED").length}
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Completed</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-xl">
                  <p className="text-2xl font-bold text-amber-600">{upcomingAppointments.length}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Tab Bar */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "appointments"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Appointments ({patient.appointments.length})
            </button>
            <button
              onClick={() => setActiveTab("enquiries")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "enquiries"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Inbox className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Enquiries ({patient.enquiries.length})
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "notes"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Activity className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Medical Notes ({medicalNotes.length})
            </button>
          </div>

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl">
              <CardContent className="p-0">
                {patient.appointments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-700 font-medium mb-1">No appointments yet</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-4">
                      This patient hasn't booked any appointments or treatments yet.
                    </p>
                    <Button
                      className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-sm font-semibold"
                      onClick={() =>
                        router.push(
                          `/appointments/create-appointment?name=${encodeURIComponent(
                            `${patient.firstName} ${patient.lastName || ""}`.trim()
                          )}&patientEmail=${encodeURIComponent(patient.email || "")}&patientPhone=${encodeURIComponent(
                            patient.phone
                          )}`
                        )
                      }
                    >
                      Book First Appointment
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {patient.appointments.map((appt) => (
                      <div
                        key={appt._id}
                        className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/appointments`)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                              <Calendar className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-slate-800">
                                  {appt.treatmentCategory}
                                </p>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    statusColors[appt.status] || "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {appt.status.replace("_", " ")}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(appt.date).toLocaleDateString()} at {appt.startTime}
                                </span>
                                {appt.doctor && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {appt.doctor.prefix || "Dr."} {appt.doctor.firstName}{" "}
                                    {appt.doctor.lastName}
                                  </span>
                                )}
                              </div>
                              {appt.notes && (
                                <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">
                                  📝 {appt.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {appt.bookingId}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Enquiries Tab */}
          {activeTab === "enquiries" && (
            <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl">
              <CardContent className="p-0">
                {patient.enquiries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Inbox className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-700 font-medium mb-1">No enquiries found</h3>
                    <p className="text-sm text-slate-500 max-w-sm">
                      This patient has no associated leads or enquiries.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {patient.enquiries.map((enq) => (
                      <div
                        key={enq._id}
                        className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/enquiries`)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                            <Tag className="w-5 h-5 text-indigo-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-slate-800">
                                {enq.treatmentCategory}
                              </p>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  enquiryStatusColors[enq.status] || "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {enq.status.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1 mb-1">{enq.message}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span>{sourceLabels[enq.source] || enq.source}</span>
                              <span>{new Date(enq.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Medical Notes Tab */}
          {activeTab === "notes" && (
            <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl">
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" /> Medical Notes
                  </CardTitle>
                  <Button
                    size="sm"
                    className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold"
                    onClick={() => setNoteModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {notesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                ) : medicalNotes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <ClipboardList className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-700 font-medium mb-1">No medical notes yet</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-4">
                      Add consultation notes, diagnoses, prescriptions, or lab results for this patient.
                    </p>
                    <Button
                      size="sm"
                      className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold"
                      onClick={() => setNoteModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add First Note
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {medicalNotes.map((note) => {
                      const typeInfo = getNoteTypeInfo(note.type);
                      const TypeIcon = typeInfo.icon;
                      return (
                        <div key={note._id} className="p-4 hover:bg-slate-50/30 transition-colors group">
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${typeInfo.color}`}>
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-slate-800">{note.title}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                                  {typeInfo.label}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed mb-2">
                                {note.content}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(note.createdAt).toLocaleDateString()} at{" "}
                                  {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                {note.createdBy && (
                                  <span>
                                    by {note.createdBy.firstName} {note.createdBy.lastName}
                                  </span>
                                )}
                                {note.doctor && (
                                  <span>
                                    • {note.doctor.prefix || "Dr."} {note.doctor.firstName} {note.doctor.lastName}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteNote(note._id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">Add Medical Note</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Note Type Selection */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Note Type</label>
              <div className="grid grid-cols-3 gap-2">
                {NOTE_TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setNoteForm({ ...noteForm, type: t.value })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                        noteForm.type === t.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Title</label>
              <Input
                placeholder="e.g., Initial consultation, Follow-up visit"
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Details</label>
              <Textarea
                placeholder="Enter detailed notes, observations, prescriptions, or findings..."
                rows={5}
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
              onClick={handleAddNote}
              disabled={noteSaving}
            >
              {noteSaving ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                "Save Note"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-800">Edit Patient Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Blood Group</label>
              <Input
                placeholder="e.g., O+, A-, B+"
                value={editForm.bloodGroup}
                onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Gender</label>
              <select
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-transparent text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Date of Birth</label>
              <Input
                type="date"
                value={editForm.dateOfBirth}
                onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Address</label>
              <Textarea
                placeholder="Enter patient address"
                rows={3}
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-blue-primary hover:bg-blue-700 text-white font-semibold"
              onClick={handleEditSubmit}
              disabled={editSaving}
            >
              {editSaving ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
