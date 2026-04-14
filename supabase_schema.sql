-- Yaratilgan yangi Supabase proekti uchun to'liq va yakuniy ma'lumotlar bazasi sxemasi (AXIPH POS)

-- 1. Clubs jadvali
CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'active',
    is_frozen BOOLEAN DEFAULT false,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    login TEXT,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Zones jadvali
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label TEXT,
    icon TEXT,
    is_vip BOOLEAN DEFAULT false,
    price_per_hour INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tables jadvali
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES zones(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    start_time TIMESTAMP WITH TIME ZONE,
    orders JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Foods jadvali
CREATE TABLE IF NOT EXISTS foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Shifts jadvali
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    operator_name TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    end_time TIMESTAMP WITH TIME ZONE,
    initial_balance INTEGER DEFAULT 0,
    total_revenue INTEGER DEFAULT 0
);

-- 6. Sessions jadvali
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    elapsed_seconds INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    orders_json JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ROW LEVEL SECURITY (RLS) HOQUQLARI
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Eski siyosatlarni tozalash (xato qaytarmasligi uchun)
DROP POLICY IF EXISTS "Clubs: select if owner" ON clubs;
DROP POLICY IF EXISTS "Clubs: insert if owner" ON clubs;
DROP POLICY IF EXISTS "Clubs: update if owner" ON clubs;
DROP POLICY IF EXISTS "Clubs: select all" ON clubs;
DROP POLICY IF EXISTS "Clubs: insert all" ON clubs;
DROP POLICY IF EXISTS "Clubs: update all" ON clubs;
DROP POLICY IF EXISTS "Zones: owner access" ON zones;
DROP POLICY IF EXISTS "Tables: owner access" ON tables;
DROP POLICY IF EXISTS "Foods: owner access" ON foods;
DROP POLICY IF EXISTS "Shifts: owner access" ON shifts;
DROP POLICY IF EXISTS "Sessions: owner access" ON sessions;

-- Yangi qoidalar (Policies)
-- Clubs uchun barchaga yozish va o'qish (SuperAdmin va signup uchun ochiq)
CREATE POLICY "Clubs: select all" ON clubs FOR SELECT USING (true);
CREATE POLICY "Clubs: insert all" ON clubs FOR INSERT WITH CHECK (true);
CREATE POLICY "Clubs: update all" ON clubs FOR UPDATE USING (true);

-- Qolgan jadvallar uchun faqat o'zining klubiga (owner) tegishli yozuvlar ustida amallar
CREATE POLICY "Zones: owner access" ON zones FOR ALL USING (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()));
CREATE POLICY "Tables: owner access" ON tables FOR ALL USING (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()));
CREATE POLICY "Foods: owner access" ON foods FOR ALL USING (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()));
CREATE POLICY "Shifts: owner access" ON shifts FOR ALL USING (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()));
CREATE POLICY "Sessions: owner access" ON sessions FOR ALL USING (club_id IN (SELECT id FROM clubs WHERE owner_id = auth.uid()));

-- O'zgarishlar e'lon qilinishi uchun
NOTIFY pgrst, 'reload schema';
