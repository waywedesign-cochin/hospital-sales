"use client";

import { useAuthStore } from "@/providers/AuthStoreProvider";
import axios from "axios";
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DeleteDialog from "@/components/shared/DeleteDialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────────────
type ActivityType = "NEW" | "CONTACTED" | "FOLLOW_UP" | "APPOINTMENT_BOOKED";

interface IEnquiryActivity {
  _id?: string;
  enquiryId: string;
  type: ActivityType;
  note: string;
  createdBy?: {
    firstName: string;
    lastName: string;
  } | null;
  date?: string; // ISO string
  createdAt?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<ActivityType, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  FOLLOW_UP: "Follow Up",
  APPOINTMENT_BOOKED: "Appointment Booked",
};

const TYPE_BADGE: Record<ActivityType, string> = {
  NEW: "bg-green-100 text-green-800",
  CONTACTED: "bg-blue-100 text-blue-800",
  FOLLOW_UP: "bg-amber-100 text-amber-800",
  APPOINTMENT_BOOKED: "bg-green-100 text-green-800",
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Empty form state ───────────────────────────────────────────────────────
const EMPTY_FORM = { type: "" as ActivityType | "", date: "", note: "" };

// ── Page ──────────────────────────────────────────────────────────────────
const PER_PAGE = 10;

export default function ActivityPage({
  enquiryId,
  initialData,
}: {
  enquiryId: string;
  initialData: {
    activities: IEnquiryActivity[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  };
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);

  const [activities, setActivities] = useState<IEnquiryActivity[]>(
    initialData?.activities || [],
  );

  const totalPages = initialData?.pagination.totalPages || 1;
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IEnquiryActivity | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setActivities(initialData?.activities || []);
  }, [initialData]);
  // ── Modal helpers ────────────────────────────────────────────────────────
  function openAdd() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(a: IEnquiryActivity) {
    setEditTarget(a);
    setForm({
      type: a.type,
      date: a.date ? a.date.slice(0, 16) : "", // datetime-local format
      note: a.note,
    });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.type) e.type = "Please select a type.";
    if (!form.date) e.date = "Please select a date and time.";
    if (!form.note) e.note = "Please enter a note.";
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        enquiryId,
        type: form.type,
        note: form.note,
        date: new Date(form.date).toISOString(),
        createdBy: user?._id,
      };

      if (editTarget?._id) {
        // UPDATE
        await axios.put(
          `/api/enquiry/activities?activityId=${editTarget._id}`,
          payload,
        );
        toast.success("Activity updated successfully");
      } else {
        // CREATE
        await axios.post(`/api/enquiry/activities`, payload);
        toast.success("Activity added successfully");
      }
      router.refresh();
      setModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
      setErrors({});
      router.refresh();
    }
  }

  async function handleDelete(id?: string) {
    try {
      await axios.delete(`/api/enquiry/activities?id=${id}`);
      toast.success("Activity deleted successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }

  //pagination
  const currentPage = Number(
    searchParams.get("page") ?? initialData.pagination.page ?? 1,
  );

  const handlePageChange = (newPage: number) => {
    const page = Math.max(1, Math.min(totalPages, newPage));
    if (page === currentPage) return;

    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));

    router.push(`/enquiries/${enquiryId}?${params.toString()}`);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Back */}
      <Button
        onClick={() => router.push("/enquiries")}
        size={"sm"}
        className="inline-flex items-center gap-2 bg-green-800 shadow-md hover:bg-green-900 text-white px-4 py-2 rounded-lg text-sm transition-colors w-fit"
      >
        <ArrowLeftIcon size={16} /> Back
      </Button>

      {/* Card */}
      <div className="bg-white rounded-xl border border-green-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-100">
          <h2 className="text-lg font-semibold text-[#1a3a1a]">
            Activity Timeline ({activities.length})
          </h2>
          <Button
            size="sm"
            onClick={openAdd}
            className="inline-flex bg-green-800 shadow-md hover:bg-green-900 items-center gap-2 text-white  rounded-lg text-sm font-medium transition-colors"
          >
            <PlusIcon size={15} /> Add Activity
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">
            Loading…
          </div>
        ) : activities.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No activities yet. Add your first activity above.
          </div>
        ) : (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-primary">
                  <tr className="bg-blue-primary text-white text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Note</th>
                    <th className="px-5 py-3 text-left font-medium">Date</th>
                    <th className="px-5 py-3 text-left font-medium">
                      Created By
                    </th>
                    <th className="px-5 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a) => (
                    <tr
                      key={a._id}
                      className="border-b border-green-50 hover:bg-green-50/40 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-xs font-medium ${
                            TYPE_BADGE[a.type]
                          }
                        }`}
                        >
                          {TYPE_LABELS[a.type]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700 max-w-xs">
                        {a.note || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">
                        {fmtDate(a.date)}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">
                        {a.createdBy?.firstName
                          ? `${a.createdBy.firstName} ${a.createdBy.lastName ? ` ${a.createdBy.lastName}` : ""}`
                          : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => openEdit(a)}
                            size="sm"
                            className="bg-white rounded-md hover:bg-green-100 text-green-700 transition-colors shadow-md"
                          >
                            <PencilIcon size={14} />
                          </Button>
                          {/* Delete Button */}
                          <DeleteDialog
                            trigger={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-red-600 hover:text-red-700 px-2 py-1 shadow-md rounded-md hover:bg-red-50 transition-all"
                                disabled={a.type === "APPOINTMENT_BOOKED"}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            }
                            title="Delete Enquiry"
                            description="Are you sure you want to delete this enquiry activity? This action cannot be undone."
                            onConfirm={() => handleDelete(a._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {activities.map((a) => (
                <div
                  key={a._id}
                  className="border border-green-100 rounded-xl p-4 shadow-sm bg-white"
                >
                  {/* Status */}
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${TYPE_BADGE[a.type]}`}
                    >
                      {TYPE_LABELS[a.type]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {fmtDate(a.date)}
                    </span>
                  </div>

                  {/* Note */}
                  <p className="text-sm text-gray-700 mb-2">
                    {a.note || <span className="text-gray-300">—</span>}
                  </p>

                  {/* Created By */}
                  <p className="text-xs text-gray-500 mb-3">
                    {a.createdBy?.firstName
                      ? `${a.createdBy.firstName}${
                          a.createdBy.lastName ? ` ${a.createdBy.lastName}` : ""
                        }`
                      : "—"}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openEdit(a)}
                      size="sm"
                      className="flex-1 bg-green-50 text-green-700 hover:bg-green-100"
                    >
                      Edit
                    </Button>

                    <DeleteDialog
                      trigger={
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 text-red-600 hover:bg-red-50"
                          disabled={a.type === "APPOINTMENT_BOOKED"}
                        >
                          Delete
                        </Button>
                      }
                      title="Delete Enquiry"
                      description="Are you sure you want to delete this enquiry activity?"
                      onConfirm={() => handleDelete(a._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-green-100 text-sm text-gray-500">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-2 text-xs font-bold  text-green-700 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
            >
              Prev
            </button>

            {/* Page Numbers (hidden on very small screens) */}
            <div className="hidden sm:flex items-center gap-1 mx-1">
              {(() => {
                const total = totalPages;
                const cp = currentPage;
                const nodes: React.ReactNode[] = [];

                // first
                nodes.push(
                  <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all hover:shadow-md ${
                      cp === 1
                        ? "bg-blue-primary text-white shadow-lg shadow-green-500/30 scale-105"
                        : "text-green-700 hover:bg-linear-to-r hover:from-green-50 hover:to-green-50 border border-green-100"
                    }`}
                  >
                    1
                  </button>,
                );

                if (cp > 4) {
                  nodes.push(
                    <span
                      key="e1"
                      className="px-1.5 text-green-400 text-xs font-bold"
                    >
                      · · ·
                    </span>,
                  );
                }

                const start = Math.max(2, cp - 1);
                const end = Math.min(total - 1, cp + 1);

                for (let i = start; i <= end; i++) {
                  if (i <= 1 || i >= total) continue;
                  nodes.push(
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all hover:shadow-md ${
                        cp === i
                          ? "bg-blue-primary text-white shadow-lg shadow-indigo-500/40 scale-105"
                          : "text-green-700 hover:bg-linear-to-r hover:from-green-50 hover:to-green-50 border border-green-100"
                      }`}
                    >
                      {i}
                    </button>,
                  );
                }

                if (cp < total - 3) {
                  nodes.push(
                    <span
                      key="e2"
                      className="px-1.5 text-green-400 text-xs font-bold"
                    >
                      · · ·
                    </span>,
                  );
                }

                if (total > 1) {
                  nodes.push(
                    <button
                      key={total}
                      onClick={() => handlePageChange(total)}
                      className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all hover:shadow-md ${
                        cp === total
                          ? "bg-blue-600 text-white shadow-lg shadow-indigo-500/40 scale-105"
                          : "text-green-700 hover:bg-linear-to-r hover:from-indigo-50 hover:to-purple-50 border border-indigo-100"
                      }`}
                    >
                      {total}
                    </button>,
                  );
                }

                return nodes;
              })()}
            </div>

            {/* Next */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-2 text-xs font-bold text-green-700 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-7 shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#1a3a1a]">
                {editTarget ? "Edit Activity" : "Add Activity"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Activity Type <span className="text-red-500">*</span>
              </label>
              <select
                disabled={form.type === "APPOINTMENT_BOOKED"}
                value={form.type}
                onChange={(e) => {
                  setForm({ ...form, type: e.target.value as ActivityType });
                  if (e.target.value)
                    setErrors((prev) => ({ ...prev, type: "" }));
                }}
                className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a5c1a] focus:ring-2 focus:ring-green-100 ${
                  form.type === "APPOINTMENT_BOOKED"
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="">Select type</option>
                {/* <option value="NEW">New</option> */}
                <option value="CONTACTED">Contacted</option>
                <option value="FOLLOW_UP">Follow Up</option>
                {form.type === "APPOINTMENT_BOOKED" ? (
                  <option value="APPOINTMENT_BOOKED">Appointment Booked</option>
                ) : null}
              </select>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">{errors.type}</p>
              )}
            </div>

            {/* Date & Time */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date &amp; Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => {
                  setForm({ ...form, date: e.target.value });
                  if (e.target.value)
                    setErrors((prev) => ({ ...prev, date: "" }));
                }}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a5c1a] focus:ring-2 focus:ring-green-100"
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>

            {/* Note */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Note <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.note}
                onChange={(e) => {
                  setForm({ ...form, note: e.target.value });
                  if (e.target.value)
                    setErrors((prev) => ({ ...prev, note: "" }));
                }}
                placeholder="Add note about this activity"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a5c1a] focus:ring-2 focus:ring-green-100 resize-y"
              />
              {errors.note && (
                <p className="text-red-500 text-xs mt-1">{errors.note}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 rounded-lg bg-[#1a5c1a] hover:bg-[#2a7a2a] text-white text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
