import { z } from "zod"; // Import zod for schema definitions

export const userRoles = z.enum(["PLATFORM_ADMIN", "ADMIN", "STAFF", "DOCTOR", "GUEST"]); // members user roles

// Schema for Editing an Existing User (Password excluded)
export const editUserSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters long."),
  lastName: z.string().optional(),
  email: z.string().refine(
    (value) => {
      // Custom validation logic for email
      // You can use regular expressions or any other validation method you prefer
      // Return true if the email is valid, or an error message if it's not valid
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(value);
    },
    {
      message: "Email is not valid.",
    }
  ),
  role: userRoles,
});

export const userProfileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters long."),
  lastName: z.string().optional(),
});

// Infer the type from the schema for type safety
export type EditUserFormData = z.infer<typeof editUserSchema>;
