import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const patientSchema = z.object({
  organizationId: z.string().min(1, "Clinic ID is required"),

  firstName: z.string().min(1, "First name is required"),

  lastName: z.string().optional(),

  email: z.string().email("Invalid email format").optional().or(z.literal("")),

  phone: z.string().refine((val) => isValidPhoneNumber(val), {
    message: "Invalid international phone number format",
  }),

  dateOfBirth: z.string().optional().or(z.literal("")),

  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
});
