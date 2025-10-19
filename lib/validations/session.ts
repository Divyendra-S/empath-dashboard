import { z } from "zod";

const numberOrString = z.union([z.number(), z.string()]).transform((val) => {
  const num = typeof val === "string" ? parseInt(val, 10) : val;
  return isNaN(num) ? undefined : num;
});

export const sessionSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  scheduled_at: z.string().min(1, "Schedule date and time is required"),
  duration_minutes: numberOrString
    .refine((val) => val === undefined || (val >= 1 && val <= 480), {
      message: "Duration must be between 1 and 480 minutes",
    })
    .optional(),
  notes: z.string().max(5000, "Notes cannot exceed 5000 characters").optional(),
  call_type: z
    .enum(["internal", "external_link", "local_recording"])
    .optional(),
  meeting_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

export type SessionFormValues = {
  client_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  notes?: string;
  call_type?: "internal" | "external_link" | "local_recording";
  meeting_url?: string;
};
