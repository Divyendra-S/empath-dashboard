"use server";

import { createServiceClientB } from "@/lib/supabase/server-b";

// Fetch profiles from Project B as clients
export async function getProjectBClients() {
  try {
    const supabaseB = createServiceClientB();

    // Fetch profiles (id, name, avatar, age, etc.)
    const { data: profiles, error: profilesError } = await supabaseB
      .from("profiles")
      .select("id, name, avatar, age, gender_identity, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching Project B profiles:", profilesError);
      return [];
    }

    // Fetch emails from auth.users
    const { data: users, error: usersError } = await supabaseB.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching auth.users:", usersError);
    }

    // Create map of user ID to email
    const idToEmail = new Map(
      users?.users?.map((u) => [u.id, u.email]) ?? []
    );

    // Transform profiles to match client structure
    return (profiles || []).map((profile) => ({
      id: profile.id,
      full_name: profile.name || "Unnamed Client",
      email: idToEmail.get(profile.id) || "",
      phone: null,
      date_of_birth: null,
      notes: profile.age 
        ? `Age: ${profile.age}${profile.gender_identity ? `, Gender: ${profile.gender_identity}` : ''}`
        : profile.gender_identity 
          ? `Gender: ${profile.gender_identity}`
          : null,
      status: "active",
      therapist_id: null,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      source: "project_b" as const,
      // Additional Project B fields
      avatar: profile.avatar,
      age: profile.age,
      gender_identity: profile.gender_identity,
    }));
  } catch (error) {
    console.error("Error in getProjectBClients:", error);
    return [];
  }
}

// Fetch a single profile from Project B
export async function getProjectBClient(id: string) {
  try {
    const supabaseB = createServiceClientB();

    // Fetch profile
    const { data: profile, error: profileError } = await supabaseB
      .from("profiles")
      .select("id, name, avatar, age, gender_identity, created_at, updated_at")
      .eq("id", id)
      .single();

    if (profileError) {
      console.error("Error fetching Project B profile:", profileError);
      return null;
    }

    // Fetch email from auth.users
    const { data: user, error: userError } = await supabaseB.auth.admin.getUserById(id);

    if (userError) {
      console.error("Error fetching user email:", userError);
    }

    return {
      id: profile.id,
      full_name: profile.name || "Unnamed Client",
      email: user?.user?.email || "",
      phone: null,
      date_of_birth: null,
      notes: profile.age 
        ? `Age: ${profile.age}${profile.gender_identity ? `, Gender: ${profile.gender_identity}` : ''}`
        : profile.gender_identity 
          ? `Gender: ${profile.gender_identity}`
          : null,
      status: "active",
      therapist_id: null,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      source: "project_b" as const,
      // Additional Project B fields
      avatar: profile.avatar,
      age: profile.age,
      gender_identity: profile.gender_identity,
    };
  } catch (error) {
    console.error("Error in getProjectBClient:", error);
    return null;
  }
}

// Fetch sessions from Project B
export async function getProjectBSessions(userId?: string) {
  try {
    const supabaseB = createServiceClientB();

    let query = supabaseB
      .from("sessions")
      .select(
        `
        id,
        user_id,
        start_time,
        end_time,
        status,
        session_type,
        scheduled_for,
        recording_url,
        summary,
        insights,
        strategies,
        post_session_reflection,
        transcription,
        transcription_data,
        source,
        original_filename,
        file_type,
        file_size,
        progress_percentage,
        abandoned,
        created_at,
        updated_at
      `
      )
      .order("start_time", { ascending: false })
      .limit(100);

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error("Error fetching Project B sessions:", error);
      return [];
    }

    // Fetch all unique user IDs from sessions
    const userIds = [...new Set(sessions?.map(s => s.user_id) || [])];
    
    // Fetch profiles for all users (include all profile fields)
    const { data: profiles } = await supabaseB
      .from("profiles")
      .select("id, name, avatar, age, gender_identity, custom_gender, created_at, updated_at")
      .in("id", userIds);

    // Fetch emails from auth.users
    const { data: users } = await supabaseB.auth.admin.listUsers();
    const idToEmail = new Map(users?.users?.map((u) => [u.id, u.email]) ?? []);

    // Create a map of user_id to client data (full profile info)
    const userToClient = new Map(
      (profiles || []).map((profile) => [
        profile.id,
        {
          id: profile.id,
          full_name: profile.name || "Unnamed Client",
          email: idToEmail.get(profile.id) || "",
          phone: null,
          date_of_birth: null,
          notes: profile.age 
            ? `Age: ${profile.age}${profile.gender_identity ? `, Gender: ${profile.gender_identity}` : ''}`
            : profile.gender_identity 
              ? `Gender: ${profile.gender_identity}`
              : null,
          status: "active",
          therapist_id: null,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          // Additional profile fields
          avatar: profile.avatar,
          age: profile.age,
          gender_identity: profile.gender_identity,
          custom_gender: profile.custom_gender,
        },
      ])
    );

    // Transform sessions to match Project A structure
    return (sessions || []).map((session) => {
      const startTime = session.start_time ? new Date(session.start_time) : null;
      const endTime = session.end_time ? new Date(session.end_time) : null;
      const scheduledFor = session.scheduled_for ? new Date(session.scheduled_for) : null;
      
      // Get client data for this session (fallback if not found)
      const client = userToClient.get(session.user_id) || {
        id: session.user_id,
        full_name: "Unknown Client",
        email: "",
        phone: null,
        date_of_birth: null,
        notes: null,
        status: "active",
        therapist_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar: null,
        age: null,
        gender_identity: null,
        custom_gender: null,
      };
      
      return {
        id: session.id,
        client_id: session.user_id,
        therapist_id: null,
        scheduled_at: (scheduledFor || startTime || new Date()).toISOString(),
        completed_at: endTime?.toISOString() || null,
        duration_minutes: endTime && startTime 
          ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
          : 60,
        status: mapProjectBStatus(session.status),
        notes: buildSessionNotes(session),
        call_type: "internal" as const,
        meeting_url: null,
        created_at: session.created_at,
        updated_at: session.updated_at,
        source: "project_b" as const,
        // Populate client relationship
        client,
        // Additional Project B specific fields
        session_type: session.session_type,
        recording_url: session.recording_url,
        transcription: session.transcription,
        transcription_data: session.transcription_data,
        summary: session.summary,
        insights: session.insights,
        strategies: session.strategies,
        post_session_reflection: session.post_session_reflection,
        original_filename: session.original_filename,
        file_type: session.file_type,
        file_size: session.file_size,
        progress_percentage: session.progress_percentage,
        abandoned: session.abandoned,
        source_type: session.source, // renamed to avoid conflict with our 'source' field
      };
    });
  } catch (error) {
    console.error("Error in getProjectBSessions:", error);
    return [];
  }
}

// Build comprehensive notes from Project B session data
function buildSessionNotes(session: {
  summary?: string | null;
  insights?: string | null;
  strategies?: string | null;
  post_session_reflection?: string | null;
}): string | null {
  const parts: string[] = [];
  
  if (session.summary) {
    parts.push(`Summary: ${session.summary}`);
  }
  
  if (session.insights) {
    parts.push(`Insights: ${session.insights}`);
  }
  
  if (session.strategies) {
    parts.push(`Strategies: ${session.strategies}`);
  }
  
  if (session.post_session_reflection) {
    parts.push(`Reflection: ${session.post_session_reflection}`);
  }
  
  return parts.join('\n\n') || null;
}

// Fetch sessions for a specific client from Project B
export async function getProjectBSessionsByClient(userId: string) {
  return getProjectBSessions(userId);
}

// Map Project B status to Project A status
function mapProjectBStatus(status: string): "scheduled" | "completed" | "cancelled" | "no_show" {
  switch (status) {
    case "scheduled":
      return "scheduled";
    case "completed":
    case "processing":
      return "completed";
    case "abandoned":
    case "cancelled":
      return "cancelled";
    default:
      return "scheduled";
  }
}

// Get client stats from Project B
export async function getProjectBClientStats(userId: string) {
  const sessions = await getProjectBSessions(userId);
  
  const total = sessions.length;
  const upcoming = sessions.filter((s) => s.status === "scheduled").length;
  const completed = sessions.filter((s) => s.status === "completed").length;

  return {
    total,
    upcoming,
    completed,
  };
}
