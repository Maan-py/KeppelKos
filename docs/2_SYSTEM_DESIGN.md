# [🏗️] System Design: KosKeppel

## 📊 ERD & RAT (Entity Relationship Diagram)

```sql
-- Tabel Kamar (Master Data)
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT UNIQUE NOT NULL,
  floor_level INT DEFAULT 1,
  price BIGINT NOT NULL,
  bathroom_location TEXT CHECK (bathroom_location IN ('dalam', 'luar')),
  status TEXT DEFAULT 'available'
);

-- Tabel Profil Penghuni (Link to Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  room_id UUID REFERENCES rooms(id),
  due_date INT, -- Tanggal jatuh tempo (misal: tiap tanggal 5)
  role TEXT DEFAULT 'tenant'
);
```
