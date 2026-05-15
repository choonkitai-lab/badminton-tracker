// ============================================================
// Core TypeScript types for the Badminton String Tracker app
// ============================================================

// --- Enums (fixed set of allowed values) ---

export type RacketStatus = 'active' | 'inactive';

export type StringJobStatus = 'active' | 'broken' | 'cut' | 'restrung';

// Where the string broke on the racket
export type BreakLocation = 'vertical' | 'horizontal' | 'sweet_spot' | 'edge';

// Common badminton racket weight classes
export type WeightClass = 'U' | '3U' | '4U' | '5U' | 'F';

// --- Database row types (match Supabase table columns exactly) ---

export interface Racket {
  id: string;
  user_id: string;
  name: string;
  brand: string | null;
  model: string | null;
  weight_class: WeightClass | null;
  notes: string | null;
  status: RacketStatus;
  created_at: string;
  updated_at: string;
}

export interface StringJob {
  id: string;
  racket_id: string;
  user_id: string;
  string_model: string;
  string_brand: string | null;
  string_color: string | null;
  tension_main: number | null;   // in lbs
  tension_cross: number | null;  // in lbs
  stringing_date: string;        // ISO date "YYYY-MM-DD"
  cost: number | null;
  session_count: number;
  playing_hours: number;
  status: StringJobStatus;
  break_location: BreakLocation | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined relation (populated when fetched with .select('*, racket:rackets(*)'))
  racket?: Racket;
}

export interface Session {
  id: string;
  user_id: string;
  racket_id: string;
  string_job_id: string | null;
  session_date: string;         // ISO date "YYYY-MM-DD"
  duration_minutes: number;
  notes: string | null;
  // Optional feel ratings (1–5 scale)
  repulsion_rating: number | null;
  control_rating: number | null;
  sound_rating: number | null;
  durability_feeling: number | null;
  overall_feeling: number | null;
  created_at: string;
  // Joined relations
  racket?: Racket;
  string_job?: StringJob;
}

// --- Form data types (what the user types into forms) ---
// All fields are strings because HTML inputs always return strings.
// We parse them to numbers before sending to Supabase.

export interface RacketFormData {
  name: string;
  brand: string;
  model: string;
  weight_class: WeightClass | '';
  notes: string;
  status: RacketStatus;
}

export interface StringJobFormData {
  racket_id: string;
  string_model: string;
  string_brand: string;
  string_color: string;
  tension_main: string;
  tension_cross: string;
  stringing_date: string;
  cost: string;
  notes: string;
}

export interface SessionFormData {
  racket_id: string;
  string_job_id: string;
  session_date: string;
  duration_minutes: string;
  notes: string;
  repulsion_rating: string;
  control_rating: string;
  sound_rating: string;
  durability_feeling: string;
  overall_feeling: string;
}
