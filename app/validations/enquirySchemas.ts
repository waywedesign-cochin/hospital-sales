import z from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const enquirySchema = z.object({
  organizationId: z.string().min(1, "Clinic ID is required"),
  firstName: z.string().min(2, "First name must be at least 2 characters long"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().refine((val) => isValidPhoneNumber(val), { message: "Invalid international phone number format" }),
  treatmentCategory: z.string().min(1, "Department / Category is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
  source: z.enum(
    ["WEBSITE", "PHONE", "WHATSAPP", "OTHER"],
    "Source is required",
  ),
});

export const updateEnquiryStatusSchema = z.object({
  status: z.enum(
    ["NEW", "CONTACTED", "APPOINTMENT_BOOKED", "FOLLOW_UP"],
    "Invalid status value",
  ),
  handledBy: z.string().min(1, "HandledBy is required"),
  staffNotes: z.string().min(1, "Staff notes is required"),
});

export const enquiryActivitySchema = z.object({
  enquiryId: z.string().min(1, "Enquiry ID is required"),
  type: z.enum(["NEW", "CONTACTED", "FOLLOW_UP", "APPOINTMENT_BOOKED"], {
    message: "Invalid activity type",
  }),
  note: z.string().min(1, "Note is required"),
  date: z.coerce.date().optional(),
  createdBy: z.string().optional(),
});
