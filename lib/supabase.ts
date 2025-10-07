import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jbmfzdhbdsxgrtuwnbuu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibWZ6ZGhiZHN4Z3J0dXduYnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc4NTEsImV4cCI6MjA3NDk5Mzg1MX0.mPNj5x-AbhdvIvPw0myQsioDdJdqWxEaWIZNnTORlW4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'pr' | 'collector';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  club_id: string;
  name: string;
  description?: string;
  event_date: string;
  venue?: string;
  max_capacity?: number;
  event_type: 'public' | 'private' | 'vip';
  created_by: string;
  created_at: string;
}

export interface GuestlistEntry {
  id: string;
  event_id: string;
  collector_assignment_id: string;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  guest_type: 'regular' | 'vip' | 'staff';
  plus_ones: number;
  special_notes?: string;
  invitation_sent_at?: string;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
  checked_in: boolean;
  checked_in_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CollectorAssignment {
  id: string;
  event_id: string;
  pr_id: string;
  collector_id: string;
  unique_token: string;
  invitation_link: string;
  assigned_at: string;
  is_active: boolean;
}
