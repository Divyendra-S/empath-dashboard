"use server";

import { createServerClientA as createSupabaseClient } from "@/lib/supabase/server-a";
import { revalidatePath } from "next/cache";
import type { SessionStatus } from "@/lib/types";
import { getProjectBSessions, getProjectBSessionsByClient, getProjectBClient } from "./project-b";

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

  // Fetch from Project A
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

  const { data: projectASessions, error } = await query;

  if (error) throw error;

  // Add source marker to Project A sessions
  const projectAWithSource = (projectASessions || []).map(session => ({
    ...session,
    source: "project_a" as const,
  }));

  // Fetch from Project B
  const projectBSessions = filters?.clientId
    ? await getProjectBSessionsByClient(filters.clientId)
    : await getProjectBSessions();

  // Filter Project B sessions by status if needed
  let filteredProjectB = projectBSessions;
  if (filters?.status) {
    filteredProjectB = projectBSessions.filter(
      (session) => session.status === filters.status
    );
  }

  // Merge both lists
  return [...projectAWithSource, ...filteredProjectB];
}

export async function getSession(id: string) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Try Project A first
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

  if (!error && data) {
    return { ...data, source: "project_a" as const };
  }

  // If not found in Project A, try Project B
  const projectBSessions = await getProjectBSessions();
  const projectBSession = projectBSessions.find((s) => s.id === id);
  
  if (projectBSession) {
    return {
      ...projectBSession,
      client: null, // We'd need to fetch the client separately if needed
      recordings: [],
    };
  }

  // If still not found, throw the original error
  throw error || new Error("Session not found");
}

export async function createSession(data: SessionInsert) {
  const supabase = await createSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Check if the client exists in Project A
  const { data: existingClient } = await supabase
    .from("clients")
    .select("id")
    .eq("id", data.client_id)
    .single();

  // If client doesn't exist in Project A, it might be a Project B client - sync it
  if (!existingClient) {
    console.log(`Client ${data.client_id} not found in Project A, attempting to sync from Project B`);
    
    const projectBClient = await getProjectBClient(data.client_id);
    
    if (projectBClient) {
      console.log(`Syncing Project B client to Project A:`, projectBClient.full_name);
      
      // Insert the Project B client into Project A with the same ID
      const { error: insertError } = await supabase
        .from("clients")
        .insert({
          id: projectBClient.id, // Use same ID from Project B
          full_name: projectBClient.full_name,
          email: projectBClient.email,
          phone: projectBClient.phone,
          date_of_birth: projectBClient.date_of_birth,
          notes: `Synced from Project B. ${projectBClient.notes || ''}`.trim(),
          therapist_id: user.id,
          status: "active",
        });

      if (insertError) {
        // Check if it's a duplicate key error (client was created by another request)
        if (insertError.code === '23505') {
          console.log(`Client ${data.client_id} already exists (created by concurrent request)`);
        } else {
          console.error("Failed to sync client from Project B:", insertError);
          throw new Error(`Failed to sync client: ${insertError.message}`);
        }
      } else {
        console.log(`Successfully synced client ${projectBClient.full_name} to Project A`);
      }
    } else {
      throw new Error(`Client ${data.client_id} not found in either Project A or Project B`);
    }
  }

  // Now create the session
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
  revalidatePath("/dashboard/clients");
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
