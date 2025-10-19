"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SessionStatus } from "@/lib/types";

export interface SessionInsert {
  client_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  notes?: string;
  call_type?: "internal" | "external_link" | "local_recording";
  meeting_url?: string;
}

export async function getSessions(filters?: {
  status?: SessionStatus;
  clientId?: string;
}) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("sessions")
    .select(
      `
      *,
      client:clients(*)
    `
    )
    .eq("therapist_id", user.id)
    .order("scheduled_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.clientId) {
    query = query.eq("client_id", filters.clientId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getSession(id: string) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("sessions")
    .select(
      `
      *,
      client:clients(*),
      recordings(*)
    `
    )
    .eq("id", id)
    .eq("therapist_id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function createSession(data: SessionInsert) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      ...data,
      therapist_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/sessions");
  return session;
}

export async function updateSession(id: string, data: Partial<SessionInsert>) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: session, error } = await supabase
    .from("sessions")
    .update(data)
    .eq("id", id)
    .eq("therapist_id", user.id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/sessions");
  revalidatePath(`/dashboard/sessions/${id}`);
  return session;
}

export async function updateSessionStatus(id: string, status: SessionStatus) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("sessions")
    .update({ status })
    .eq("id", id)
    .eq("therapist_id", user.id);

  if (error) throw error;

  revalidatePath("/dashboard/sessions");
  revalidatePath(`/dashboard/sessions/${id}`);
}

export async function deleteSession(id: string) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id)
    .eq("therapist_id", user.id);

  if (error) throw error;

  revalidatePath("/dashboard/sessions");
}
