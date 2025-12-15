import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Child {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  age?: number;
  gender?: string;
  qr_code?: string;
  qr_code_url?: string;
  parent_id?: string;
  group_id?: string;
  team_id?: string;
  squad_id?: string;
  house_id?: string;
  room_id?: string;
  checked_in?: boolean;
  payment_status?: string;
  created_at?: string;
}

export interface Parent {
  id: string;
  name: string;
  email?: string;
  phone_number: string;
  church?: string;
  referral_source?: string;
  is_rhema_youth?: string;
  created_at?: string;
}

export interface ChildWithParent extends Child {
  parent?: Parent;
}