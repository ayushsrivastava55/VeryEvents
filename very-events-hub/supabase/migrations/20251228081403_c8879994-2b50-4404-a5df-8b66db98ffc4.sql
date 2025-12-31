-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  wallet_address TEXT,
  very_balance DECIMAL(18, 4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  image_url TEXT,
  price DECIMAL(18, 4) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT '$VERY',
  total_tickets INTEGER NOT NULL DEFAULT 100,
  sold_tickets INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  organizer_name TEXT,
  is_featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT NOT NULL UNIQUE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ticket_type TEXT NOT NULL DEFAULT 'General',
  price_paid DECIMAL(18, 4) NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid',
  nft_token_id TEXT,
  qr_code TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event categories table for filtering
CREATE TABLE public.event_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.event_categories (name, icon) VALUES
  ('All', 'Layers'),
  ('Tech', 'Cpu'),
  ('Music', 'Music'),
  ('Art', 'Palette'),
  ('Gaming', 'Gamepad2'),
  ('Wellness', 'Heart'),
  ('Education', 'GraduationCap'),
  ('Sports', 'Trophy'),
  ('Community', 'Users');

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Events policies (public read, authenticated create/update own)
CREATE POLICY "Events are viewable by everyone" 
ON public.events FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" 
ON public.events FOR INSERT TO authenticated WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their own events" 
ON public.events FOR UPDATE TO authenticated USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their own events" 
ON public.events FOR DELETE TO authenticated USING (auth.uid() = organizer_id);

-- Tickets policies
CREATE POLICY "Users can view their own tickets" 
ON public.tickets FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can purchase tickets" 
ON public.tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" 
ON public.tickets FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Categories are public
CREATE POLICY "Categories are viewable by everyone" 
ON public.event_categories FOR SELECT USING (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Timestamp triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment sold tickets
CREATE OR REPLACE FUNCTION public.increment_sold_tickets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.events 
  SET sold_tickets = sold_tickets + 1 
  WHERE id = NEW.event_id;
  RETURN NEW;
END;
$$;

-- Trigger to increment sold tickets on purchase
CREATE TRIGGER on_ticket_purchase
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.increment_sold_tickets();