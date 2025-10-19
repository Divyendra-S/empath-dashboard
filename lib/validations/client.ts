import { z } from "zod";

export const clientSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
