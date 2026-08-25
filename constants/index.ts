import { Department, Doctor, Patient, Booking, Slot } from "../lib/types";

export const ROLES = {
  STAFF: "STAFF",
  DOCTOR: "DOCTOR",
  ADMIN: "ADMIN",
} as const;

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CALLED: "CALLED",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  NO_SHOW: "NO_SHOW",
} as const;

export const BOOKING_STATUS_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  PENDING: {
    bg: "bg-warning-50",
    text: "text-warning-700",
    border: "border-warning-200",
  },
  CALLED: {
    bg: "bg-primary-50",
    text: "text-primary-700",
    border: "border-primary-200",
  },
  CONFIRMED: {
    bg: "bg-success-50",
    text: "text-success-700",
    border: "border-success-200",
  },
  COMPLETED: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  },
  CANCELLED: {
    bg: "bg-error-50",
    text: "text-error-700",
    border: "border-error-200",
  },
  NO_SHOW: {
    bg: "bg-error-50",
    text: "text-error-700",
    border: "border-error-200",
  },
};




