import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const appointmentSchema = z.object({

  enquiryId: z.string().nullable().optional(),

  firstName: z.string().min(1, "First name is required"),

  lastName: z.string().optional(),

  patientPhone: z.string().refine((val) => isValidPhoneNumber(val), { message: "Invalid international phone number format" }),

  patientEmail: z.string().email("Invalid email format"),

  isNewPatient: z.boolean().default(false),

  doctor: z.string().min(1, "Doctor is required"),

  treatmentCategory: z.string().min(1, "Treatment category is required"),

  date: z.string().min(1, "Date is required"),

  startTime: z.string().min(1, "Start time is required"),

  status: z
    .enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"])
    .default("SCHEDULED"),
  handledBy: z.string().optional(),

  notes: z.string().optional(),
});
