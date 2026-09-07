import z from "zod";

export const treatmentCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  durationMinutes: z.coerce.number().min(5, "Duration must be at least 5 minutes").default(20),
});
