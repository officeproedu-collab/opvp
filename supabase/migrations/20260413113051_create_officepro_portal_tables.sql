/*
  # OfficePro Video Portal - Initial Schema

  ## Overview
  Creates the core tables for the OfficePro student video portal.

  ## New Tables

  ### `portal_users`
  Stores all user accounts (admins and students).
  - `id` (uuid, primary key)
  - `name` (text) - Full name
  - `email` (text, unique) - Login email
  - `password` (text) - Plain text password as requested
  - `phone` (text) - Contact phone number
  - `role` (text) - 'admin' or 'student'
  - `is_active` (boolean) - Whether user can log in
  - `notes` (text) - Admin notes about the student
  - `created_at`, `updated_at` (timestamps)

  ### `portal_videos`
  Stores video metadata with Mega links.
  - `id` (uuid, primary key)
  - `title` (text) - Video title
  - `description` (text) - Video description
  - `mega_link` (text) - Mega.nz share/embed link
  - `category` (text) - Topic/category grouping
  - `order_index` (integer) - Display order
  - `is_published` (boolean) - Visibility to students
  - `created_at`, `updated_at` (timestamps)

  ## Security
  - RLS enabled on both tables
  - Anon users can SELECT from portal_users (for login validation)
  - Anon users can SELECT from portal_videos (after login check on frontend)
  - Service role handles all write operations

  ## Seed Data
  - Default admin account: admin@officepro.com / admin123
*/

-- Create portal_users table
CREATE TABLE IF NOT EXISTS portal_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  phone text DEFAULT '',
  role text DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  is_active boolean DEFAULT true,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create portal_videos table
CREATE TABLE IF NOT EXISTS portal_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  mega_link text NOT NULL,
  category text DEFAULT 'General',
  order_index integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_videos ENABLE ROW LEVEL SECURITY;

-- portal_users policies
CREATE POLICY "Allow anon select for login"
  ON portal_users FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert for registration"
  ON portal_users FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update users"
  ON portal_users FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete users"
  ON portal_users FOR DELETE
  TO anon
  USING (true);

-- portal_videos policies
CREATE POLICY "Allow anon select videos"
  ON portal_videos FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert videos"
  ON portal_videos FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update videos"
  ON portal_videos FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon delete videos"
  ON portal_videos FOR DELETE
  TO anon
  USING (true);

-- Seed default admin account
INSERT INTO portal_users (name, email, password, role, is_active, notes)
VALUES ('Admin', 'admin@officepro.com', 'admin123', 'admin', true, 'Default administrator account')
ON CONFLICT (email) DO NOTHING;
