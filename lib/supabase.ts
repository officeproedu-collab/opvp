import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PortalUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'admin' | 'student';
  is_active: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type PortalVideo = {
  id: string;
  title: string;
  description: string;
  mega_link: string;
  thumbnail_url?: string;
  category: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};
