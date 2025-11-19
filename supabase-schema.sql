-- Tesla Ambassador Platform Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ambassadors Table
CREATE TABLE ambassadors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'USA',
  zip_code TEXT,
  tesla_model TEXT NOT NULL,
  tesla_year INTEGER NOT NULL,
  bio TEXT,
  profile_image_url TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Contact Requests Table
CREATE TABLE contact_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ambassador_id UUID REFERENCES ambassadors(id) ON DELETE CASCADE NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_ambassadors_location ON ambassadors(state, city);
CREATE INDEX idx_ambassadors_available ON ambassadors(available);
CREATE INDEX idx_ambassadors_user_id ON ambassadors(user_id);
CREATE INDEX idx_contact_requests_ambassador ON contact_requests(ambassador_id);
CREATE INDEX idx_contact_requests_created ON contact_requests(created_at);

-- Enable Row Level Security
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Ambassadors
-- Anyone can view available ambassadors
CREATE POLICY "Anyone can view available ambassadors" ON ambassadors
  FOR SELECT USING (available = true);

-- Users can insert their own ambassador profile
CREATE POLICY "Users can create their own profile" ON ambassadors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON ambassadors
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON ambassadors
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Contact Requests
-- Anyone can insert contact requests
CREATE POLICY "Anyone can create contact requests" ON contact_requests
  FOR INSERT WITH CHECK (true);

-- Ambassadors can view their own contact requests
CREATE POLICY "Ambassadors can view their contact requests" ON contact_requests
  FOR SELECT USING (
    ambassador_id IN (
      SELECT id FROM ambassadors WHERE user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ambassadors_updated_at BEFORE UPDATE ON ambassadors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to send email notification when contact request is created
-- Note: You'll need to set up Supabase Edge Function or use a webhook for actual email sending
CREATE OR REPLACE FUNCTION notify_ambassador_contact()
RETURNS TRIGGER AS $$
DECLARE
  ambassador_email TEXT;
  ambassador_name TEXT;
BEGIN
  -- Get ambassador details
  SELECT email, full_name INTO ambassador_email, ambassador_name
  FROM ambassadors
  WHERE id = NEW.ambassador_id;

  -- Here you would trigger an email notification
  -- For MVP, you can use Supabase Edge Functions or webhook to services like Resend/SendGrid
  -- The trigger is set up, but actual email sending needs to be implemented via Edge Function

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for contact request notification
CREATE TRIGGER on_contact_request_created
  AFTER INSERT ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_ambassador_contact();
