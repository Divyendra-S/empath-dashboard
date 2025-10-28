"use server";

import { createServerClientA as createSupabaseClient } from "@/lib/supabase/server-a";
import { revalidatePath } from "next/cache";
import { getProjectBClients, getProjectBClient, getProjectBClientStats } from "./project-b";

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

  // Fetch from Project A
  let query = supabase
    .from("clients")
    .select("*")
    .eq("therapist_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: projectAClients, error } = await query;

  if (error) throw error;

  // Add source marker to Project A clients
  const projectAWithSource = (projectAClients || []).map(client => ({
    ...client,
    source: "project_a" as const,
  }));

  // Fetch from Project B
  const projectBClients = await getProjectBClients();

  // Filter Project B clients by search if needed
  let filteredProjectB = projectBClients;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredProjectB = projectBClients.filter(
      (client) =>
        client.full_name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower)
    );
  }

  // Create a Set of Project A client IDs for deduplication
  const projectAIds = new Set(projectAWithSource.map(c => c.id));

  // Filter out Project B clients that already exist in Project A (synced clients)
  const uniqueProjectB = filteredProjectB.filter(
    client => !projectAIds.has(client.id)
  );

  // Merge both lists (Project A first, then unique Project B clients)
  return [...projectAWithSource, ...uniqueProjectB];
}

export async function getClient(id: string) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Try Project A first
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("therapist_id", user.id)
    .single();

  if (!error && data) {
    return { ...data, source: "project_a" as const };
  }

  // If not found in Project A, try Project B
  const projectBClient = await getProjectBClient(id);
  if (projectBClient) {
    return projectBClient;
  }

  // If still not found, throw the original error
  throw error || new Error("Client not found");
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

  // Get session counts from Project A
  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("status")
    .eq("client_id", id);

  // Get session counts from Project B
  const projectBStats = await getProjectBClientStats(id);

  // If Project A has data, use it; otherwise use Project B
  if (!error && sessions && sessions.length > 0) {
    const total = sessions.length;
    const upcoming = sessions.filter((s) => s.status === "scheduled").length;
    const completed = sessions.filter((s) => s.status === "completed").length;

    return {
      total,
      upcoming,
      completed,
    };
  }

  // Return Project B stats
  return projectBStats;
}

export async function checkEmailUniqueness(email: string, excludeId?: string) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("clients")
    .select("id")
    .eq("therapist_id", user.id)
    .eq("email", email)
    .eq("status", "active");

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return !data || data.length === 0;
}
