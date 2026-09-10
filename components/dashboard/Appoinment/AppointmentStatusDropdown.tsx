"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectSeparator,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type AppointmentStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-linear-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS:
    "bg-linear-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200",
  COMPLETED: "bg-linear-to-r from-green-50 to-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-linear-to-r from-red-50 to-red-100 text-red-700 border-red-200",
  NO_SHOW: "bg-linear-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
};

export default function AppointmentStatusDropdown({
  appointmentId,
  status,
  onStatusChanged,
}: {
  appointmentId: string;
  status: AppointmentStatus;
  onStatusChanged: (id: string, status: AppointmentStatus) => void;
}) {
  const router = useRouter();
  const { slug } = (useParams() as { slug: string }) || {};
  const [saving, setSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<AppointmentStatus | null>(
    null,
  );

  const applyStatus = async (next: AppointmentStatus) => {
    if (next === status || saving) return;
    const previous = status;
    onStatusChanged(appointmentId, next);
    setSaving(true);

    try {
      const res = await axios.patch(`/api/appointment?id=${appointmentId}`, {
        status: next,
      });
      if (!res.data?.success) {
        throw new Error(res.data?.message || "Could not update status");
      }
      toast.success(`Marked as ${STATUS_LABELS[next]}`);
      router.refresh();
    } catch (error: unknown) {
      onStatusChanged(appointmentId, previous);
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : error instanceof Error
            ? error.message
            : "Could not update status";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (value: string) => {
    if (value === "RESCHEDULE") {
      router.push(`/${slug}/appointments/edit-appointment?id=${appointmentId}`);
      return;
    }
    setPendingStatus(value as AppointmentStatus);
  };

  const handleConfirm = () => {
    if (pendingStatus) applyStatus(pendingStatus);
    setPendingStatus(null);
  };

  return (
    <>
      <Select value={status} onValueChange={handleChange} disabled={saving}>
        <SelectTrigger
          size="sm"
          className={`w-auto min-w-[136px] rounded-full text-xs font-semibold border shadow-sm px-3 ${STATUS_STYLES[status]}`}
        >
          <SelectValue>
            {saving ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Updating...
              </span>
            ) : (
              STATUS_LABELS[status]
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="SCHEDULED">Scheduled</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="COMPLETED">Completed (Attended)</SelectItem>
          <SelectItem value="NO_SHOW">No Show (Didn&apos;t Come)</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
          <SelectSeparator />
          <SelectItem value="RESCHEDULE">Reschedule (Pick New Date)</SelectItem>
        </SelectContent>
      </Select>

      <AlertDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => !open && setPendingStatus(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "#00236F" }}>
              Change appointment status?
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: "#64748b" }}>
              {pendingStatus &&
                `Mark this appointment as "${STATUS_LABELS[pendingStatus]}"? This will update the status everywhere it appears.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                pendingStatus === "CANCELLED" || pendingStatus === "NO_SHOW"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-[#00236F] text-white hover:bg-[#001a52]"
              }
              onClick={handleConfirm}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
