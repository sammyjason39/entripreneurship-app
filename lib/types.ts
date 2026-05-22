export type AppRole = 'participant' | 'crew' | 'admin';
export type TeamRole = 'CEO' | 'CTO' | 'CFO' | 'CMO' | 'COO' | 'CPO';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export type TransactionType = 'reward' | 'spend' | 'transfer';
export type ActivityType = 'form' | 'image' | 'both';
export type ContentType = 'case_study' | 'innovation_card';

export interface Profile {
  id: string;
  full_name: string;
  app_role: AppRole;
  pin_hash: string | null;
  qr_token: string | null;
  onboarding_complete: boolean;
  pin_failed_attempts?: number;
  pin_locked_until?: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  ceo_id: string;
  join_code: string;
  balance: number;
  business_idea: string | null;
  innovative_score: number | null;
  outfit_score: number | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  team_role: TeamRole;
  joined_at: string;
  profiles?: Profile;
}

export interface Station {
  id: string;
  number: number;
  name: string;
  tagline: string | null;
  activity_description: string | null;
  activity_type: ActivityType;
  form_schema: FormField[];
  map_x: number | null;
  map_y: number | null;
  point_reward: number;
  is_active: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'textarea' | 'text';
  required?: boolean;
}

export interface Submission {
  id: string;
  team_id: string;
  station_id: string;
  submitted_by: string;
  form_data: Record<string, string> | null;
  image_url: string | null;
  status: SubmissionStatus;
  rejection_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  stations?: Station;
}

export interface Transaction {
  id: string;
  from_user_id: string | null;
  from_team_id: string | null;
  to_team_id: string;
  amount: number;
  type: TransactionType;
  note: string | null;
  qr_session_id: string | null;
  created_at: string;
}

export interface QrSession {
  id: string;
  token: string;
  initiator_id: string;
  initiator_role: string;
  preset_amount: number | null;
  note: string | null;
  status: 'pending' | 'completed' | 'expired';
  expires_at: string;
  completed_at: string | null;
  completed_by: string | null;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  company: string;
  title: string;
  body: string | null;
  image_url: string | null;
  station_number: number | null;
  sort_order: number;
}

export interface QrPayload {
  type: 'static' | 'session';
  token: string;
}

export const TEAM_ROLES: TeamRole[] = ['CEO', 'CTO', 'CFO', 'CMO', 'COO', 'CPO'];
export const MAX_TEAM_SIZE = 6;
export const PIN_LENGTH = 6;
export const QR_SESSION_MINUTES = 5;
