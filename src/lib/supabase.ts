import { createClient } from '@supabase/supabase-js';

// Use your own values from supabase.com → Settings → API
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://jbmfzdhbdsxgrtuwnbuu.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpibWZ6ZGhiZHN4Z3J0dXduYnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MTc4NTEsImV4cCI6MjA3NDk5Mzg1MX0.mPNj5x-AbhdvIvPw0myQsioDdJdqWxEaWIZNnTORlW4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  