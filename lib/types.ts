import { ObjectId } from "mongoose";

export type UserRole = "PLATFORM_ADMIN" | "STAFF" | "DOCTOR" | "ADMIN" | "GUEST";

export type BookingStatus =
  | "PENDING"
  | "CALLED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface User {
  _id: string;
  clinicId?: string;
  firstName: string;
  lastName?:string
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  departmentId?: string;
  specialization?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  icon: string;
  description?: string;
  activeCount: number;
}

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  specialization: string;
  qualification: string;
  avatar?: string;
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
  consultationFee: number;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  registeredAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  departmentId: string;
  departmentName: string;
  doctorId?: string;
  doctorName?: string;
  preferredDate: string;
  preferredTime?: string;
  status: BookingStatus;
  notes?: string;
  symptoms?: string;
  assignedSlotId?: string;
  createdAt: string;
  updatedAt: string;
  calledAt?: string;
  confirmedAt?: string;
  staffNotes?: string;
}

export interface Slot {
  id: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "BOOKED" | "BLOCKED" | "COMPLETED";
  bookingId?: string;
  patientName?: string;
}

export interface Appointment {
  _id: string;
  bookingId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctor: ObjectId | Doctor;
  doctorName: string;
  departmentName: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
}

export interface Analytics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  todayAppointments: number;
  activePatients: number;
  activeDoctors: number;
}

export interface Clinic {
  _id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  departments: string[];
  plan: string;
}
// types/enquiry.ts (frontend or shared DTO)

export interface EnquiryDTO {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  treatmentCategory: string;
  message: string;
  status: "NEW" | "CONTACTED" | "FOLLOW_UP" | "APPOINTMENT_BOOKED";
  source: "WEBSITE" | "PHONE" | "WHATSAPP" | "OTHER";
  handledBy?: {
    _id: string;
    firstName: string;
    lastName?: string;
  } | null;
  staffNotes?: string;
  createdAt?: string;
}
