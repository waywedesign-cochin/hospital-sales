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

export const DEPARTMENTS: Department[] = [
  {
    id: "1",
    name: "Cardiology",
    code: "CARD",
    icon: "Heart",
    description: "Heart and cardiovascular system",
    activeCount: 8,
  },
  {
    id: "2",
    name: "Neurology",
    code: "NEUR",
    icon: "Brain",
    description: "Brain and nervous system",
    activeCount: 6,
  },
  {
    id: "3",
    name: "Orthopedics",
    code: "ORTH",
    icon: "Bone",
    description: "Bones, joints, and muscles",
    activeCount: 10,
  },
  {
    id: "4",
    name: "Pediatrics",
    code: "PEDI",
    icon: "Baby",
    description: "Children's health",
    activeCount: 7,
  },
  {
    id: "5",
    name: "Dermatology",
    code: "DERM",
    icon: "Scan",
    description: "Skin, hair, and nails",
    activeCount: 5,
  },
  {
    id: "6",
    name: "General Medicine",
    code: "GENM",
    icon: "Stethoscope",
    description: "General medical care",
    activeCount: 12,
  },
];


