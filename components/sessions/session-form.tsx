"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/lib/hooks/use-clients";
import { useCreateSession, useUpdateSession } from "@/lib/hooks/use-sessions";
import type { Session } from "@/lib/types";

const sessionFormSchema = z.object({
  client_id: z.string().min(1, "Client is required"),
  scheduled_at: z.string().min(1, "Schedule date and time is required"),
  duration_minutes: z.coerce
    .number()
    .min(1, "Duration must be at least 1 minute")
    .optional(),
  notes: z.string().optional(),
  call_type: z
    .enum(["internal", "external_link", "local_recording"])
    .optional(),
  meeting_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;

interface SessionFormProps {
  session?: Session;
  defaultClientId?: string;
}

export function SessionForm({ session, defaultClientId }: SessionFormProps) {
  const router = useRouter();
  const { data: clients } = useClients();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      client_id: session?.client_id || defaultClientId || "",
      scheduled_at: session?.scheduled_at
        ? new Date(session.scheduled_at).toISOString().slice(0, 16)
        : "",
      duration_minutes: session?.duration_minutes || 60,
      notes: session?.notes || "",
      call_type: session?.call_type || "internal",
      meeting_url: session?.meeting_url || "",
    },
  });

  const watchCallType = form.watch("call_type");

  async function onSubmit(data: SessionFormValues) {
    const submitData = {
      ...data,
      meeting_url: data.meeting_url || undefined,
      duration_minutes: data.duration_minutes || undefined,
      notes: data.notes || undefined,
      call_type: data.call_type || undefined,
    };

    if (session) {
      await updateSession.mutateAsync({
        id: session.id,
        data: submitData,
      });
      router.push(`/dashboard/sessions/${session.id}`);
    } else {
      const newSession = await createSession.mutateAsync(submitData);
      router.push(`/dashboard/sessions/${newSession.id}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="scheduled_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Scheduled Date & Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormDescription>
                Estimated session duration in minutes
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="call_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Call Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="internal">Internal (Daily.co)</SelectItem>
                  <SelectItem value="external_link">
                    External Link (Zoom/Meet)
                  </SelectItem>
                  <SelectItem value="local_recording">
                    Local Recording
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose how you'll conduct this session
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchCallType === "external_link" && (
          <FormField
            control={form.control}
            name="meeting_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://zoom.us/j/..." {...field} />
                </FormControl>
                <FormDescription>
                  External meeting link (e.g., Zoom, Google Meet)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this session..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={createSession.isPending || updateSession.isPending}
          >
            {createSession.isPending || updateSession.isPending
              ? "Saving..."
              : session
              ? "Update Session"
              : "Create Session"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
