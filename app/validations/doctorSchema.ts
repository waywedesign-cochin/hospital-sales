import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

// Assuming these messages are defined elsewhere in your file or imports
const minLengthErrorMessage = "Password must be at least 8 characters.";
const maxLengthErrorMessage = "Password must be at most 20 characters.";
const uppercaseErrorMessage =
  "Password requires at least one uppercase letter (A-Z).";
const lowercaseErrorMessage =
  "Password requires at least one lowercase letter (a-z).";
const numberErrorMessage = "Password requires at least one number (0-9).";
const specialCharacterErrorMessage =
  "Password requires at least one special character (!@#$%^&*).";
const passwordMismatchErrorMessage = "Passwords do not match.";

export const passwordSchema = z
  .string()
  .min(8, { message: minLengthErrorMessage })
  .max(20, { message: maxLengthErrorMessage })
  // Regex refinement checks for required character types
  .refine((password) => /[A-Z]/.test(password), {
    message: uppercaseErrorMessage,
  })
  .refine((password) => /[a-z]/.test(password), {
    message: lowercaseErrorMessage,
  })
  .refine((password) => /[0-9]/.test(password), { message: numberErrorMessage })
  .refine((password) => /[!@#$%^&*]/.test(password), {
    message: specialCharacterErrorMessage,
  });

export const doctorSchema = z
  .object({
    // ... other doctor fields (prefix, firstName, email, etc.) ...
    prefix: z
      .string()
      .min(2, { message: "Prefix must be at least 2 characters long." }),
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters long." }),
    lastName: z.string().optional(),
    email: z.email({ error: "Invalid email address" }),
    contactNumber: z
      .string()
      .refine((val) => isValidPhoneNumber(val), { message: "Invalid international phone number format." }),
    address: z
      .string()
      .min(5, { message: "Address must be at least 5 characters long." }),

    // SECURITY DETAILS: Use the robust password schema here
    password: passwordSchema, // <-- Using the externally defined schema
    confirmPassword: z.string(), // We only need the type check; the content validation comes from the refinement below

    // ... other professional fields (qualification, education, etc.) ...
    qualification: z
      .string()
      .min(2, { message: "Qualification must be at least 2 characters long." }),
    education: z
      .string()
      .min(5, { message: "Education must be at least 5 characters long." }),
    specialization: z
      .array(z.string()) // <-- CHANGED TO ARRAY OF STRINGS
      .min(1, { message: "Please select at least one specialization area." }),
    experience: z.string(),
    registrationNumber: z.string().min(5, {
      message: "Registration number must be at least 5 characters long.",
    }),
  })
  // REFINEMENT: Ensure password and confirmPassword match
  .refine((data) => data.password === data.confirmPassword, {
    message: passwordMismatchErrorMessage,
    path: ["confirmPassword"],
  });

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string(), // Doesn't need the complexity of passwordSchema as it's just a verification field
    password: passwordSchema, // Uses the robust validation for the new password
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: passwordMismatchErrorMessage,
    path: ["confirmPassword"],
  });

// -------------------------------
// NEW: doctorUpdateSchema (NO PASSWORD VALIDATION)
// -------------------------------
export const doctorUpdateSchema = z.object({
  prefix: z
    .string()
    .min(2, { message: "Prefix must be at least 2 characters long." }),

  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters long." }),

  lastName: z.string().optional(),

  email: z.email({ message: "Invalid email address" }),

  contactNumber: z
    .string()
    .refine((val) => isValidPhoneNumber(val), { message: "Invalid international phone number format." }),

  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters long." }),

  qualification: z
    .string()
    .min(2, { message: "Qualification must be at least 2 characters long." }),

  education: z
    .string()
    .min(5, { message: "Education must be at least 5 characters long." }),

  specialization: z
    .array(z.string())
    .min(1, { message: "Please select at least one specialization area." }),

  experience: z.string(),

  registrationNumber: z.string().min(5, {
    message: "Registration number must be at least 5 characters long.",
  }),

  // status optional for update
  status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE"]),
});

//doctor leave schema
export const doctorLeaveSchema = z.object({
  doctor: z.string().min(1, "Doctor is required"),
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  type: z
    .enum(["FULL_DAY", "HALF_DAY", "TIME_RANGE", "PARTIAL_SLOTS"])
    .default("FULL_DAY"),
  slots: z.array(z.string()),
  startTime: z.string(),
  endTime: z.string(),
  reason: z.string(),
});

// Type for Edit Form
export type DoctorUpdateFormData = z.infer<typeof doctorUpdateSchema>;

export type DoctorFormData = z.infer<typeof doctorSchema>;

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
