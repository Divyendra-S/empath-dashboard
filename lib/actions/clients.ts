"use server";

import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ClientInsert {
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  notes?: string;
}

export async function getClients(search?: string) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("clients")
    .select("*")
    .eq("therapist_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getClient(id: string) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("therapist_id", user.id)
    .single();

  if (error) throw error;
  return data;
}

export async function createClient(data: ClientInsert) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      ...data,
      therapist_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/clients");
  return client;
}

export async function updateClient(id: string, data: Partial<ClientInsert>) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: client, error } = await supabase
    .from("clients")
    .update(data)
    .eq("id", id)
    .eq("therapist_id", user.id)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${id}`);
  return client;
}

export async function archiveClient(id: string) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("clients")
    .update({ status: "archived" })
    .eq("id", id)
    .eq("therapist_id", user.id);

  if (error) throw error;

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${id}`);
}

export async function unarchiveClient(id: string) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("clients")
    .update({ status: "active" })
    .eq("id", id)
    .eq("therapist_id", user.id);

  if (error) throw error;

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${id}`);
}

export async function getClientStats(id: string) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get session counts
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("status")
    .eq("client_id", id);

  if (error) throw error;

  const total = sessions?.length || 0;
  const upcoming =
    sessions?.filter((s) => s.status === "scheduled").length || 0;
  const completed =
    sessions?.filter((s) => s.status === "completed").length || 0;

  return {
    total,
    upcoming,
    completed,
  };
}
