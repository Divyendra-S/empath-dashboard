"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { sessionSchema } from "@/lib/validations/session";

interface SessionFormProps {
  session?: Session;
  defaultClientId?: string;
  defaultScheduledAt?: string;
  onSuccess?: () => void;
}

export function SessionForm({ session, defaultClientId, defaultScheduledAt, onSuccess }: SessionFormProps) {
  const router = useRouter();
  const { data: clients } = useClients();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();

  const form = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      client_id: session?.client_id || defaultClientId || "",
      scheduled_at: session?.scheduled_at
        ? formatDateForInput(session.scheduled_at)
        : defaultScheduledAt || "",
      duration_minutes: session?.duration_minutes || 60,
      notes: session?.notes || "",
      call_type: session?.call_type || "internal",
      meeting_url: session?.meeting_url || "",
    },
  });

  // Helper to format date for datetime-local input (local timezone)
  function formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const watchCallType = form.watch("call_type");

  async function onSubmit(data: Record<string, unknown>) {
    // Convert datetime-local to ISO string preserving local time
    const scheduledAtLocal = data.scheduled_at as string;
    const scheduledAtISO = new Date(scheduledAtLocal).toISOString();
    
    const submitData = {
      client_id: data.client_id as string,
      scheduled_at: scheduledAtISO,
      meeting_url: (data.meeting_url as string) || undefined,
      duration_minutes: (data.duration_minutes as number) || undefined,
      notes: (data.notes as string) || undefined,
      call_type: (data.call_type as "internal" | "external_link" | "local_recording") || undefined,
    };

    try {
      if (session) {
        await updateSession.mutateAsync({
          id: session.id,
          data: submitData,
        });
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/dashboard/sessions/${session.id}`);
        }
      } else {
        const newSession = await createSession.mutateAsync(submitData);
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/dashboard/sessions/${newSession.id}`);
        }
      }
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Failed to save session:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
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
                Choose how you&apos;ll conduct this session
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

        <div className="flex gap-4 pt-2">
          <Button
            type="submit"
            disabled={createSession.isPending || updateSession.isPending}
            className="flex-1"
          >
            {createSession.isPending || updateSession.isPending
              ? "Saving..."
              : session
              ? "Update Session"
              : "Create Session"}
          </Button>
          {!onSuccess && (
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
