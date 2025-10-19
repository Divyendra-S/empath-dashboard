// Database types based on the schema

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientStatus = "active" | "archived";

export type Client = {
  id: string;
  therapist_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  notes: string | null;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
};

export type SessionStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";
export type CallType = "internal" | "external_link" | "local_recording";

export type Session = {
  id: string;
  therapist_id: string;
  client_id: string;
  scheduled_at: string;
  duration_minutes: number | null;
  status: SessionStatus;
  notes: string | null;
  call_type: CallType;
  daily_room_url: string | null;
  daily_room_name: string | null;
  meeting_url: string | null;
  created_at: string;
  updated_at: string;
};

export type TranscriptStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type Recording = {
  id: string;
  session_id: string;
  file_path: string;
  file_size_bytes: number | null;
  duration_seconds: number | null;
  transcript: string | null;
  transcript_status: TranscriptStatus;
  created_at: string;
};

// Extended types with relations
export type SessionWithClient = Session & {
  client: Client;
};

export type SessionWithDetails = Session & {
  client: Client;
  recordings: Recording[];
};

export type ClientWithSessions = Client & {
  sessions: Session[];
};
