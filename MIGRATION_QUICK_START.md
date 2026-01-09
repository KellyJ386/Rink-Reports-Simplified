# Database Migration Quick Start

Streamlined guide for running all 7 database migrations in Supabase.

## Prerequisites

- Supabase project created
- Access to Supabase SQL Editor

## How to Run Migrations

1. Open Supabase dashboard: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New Query**
5. Copy/paste each migration below in order
6. Click **Run** after each migration
7. Verify "Success" message before proceeding to next

## Migration Checklist

Run these in order:

- [ ] Migration 001: Base Schema
- [ ] Migration 002: Ice Depth Schema
- [ ] Migration 003: Scheduling Schema
- [ ] Migration 004: Daily Reports Schema
- [ ] Migration 005: Refrigeration Schema
- [ ] Migration 006: Air Quality Schema
- [ ] Migration 007: Enhanced Circle Check
- [ ] Seed Data (optional test data)
- [ ] Initialize Circle Check Templates

---

## Migration 001: Base Schema

**File:** `supabase/migrations/001_base_schema.sql`

**What it creates:**
- `facilities` - Rink facilities
- `profiles` - User profiles linked to auth.users
- `rinks` - Individual rinks within facilities
- `ice_machines` - Zamboni/ice resurfacing machines

**Run this:**
```sql
-- Copy entire contents of supabase/migrations/001_base_schema.sql
-- Paste here and click Run
```

---

## Migration 002: Ice Depth Schema

**File:** `supabase/migrations/002_ice_depth_schema.sql`

**What it creates:**
- `ice_depth_logs` - Ice thickness measurements
- Indexes for performance
- RLS policies for multi-tenant security

**Run this:**
```sql
-- Copy entire contents of supabase/migrations/002_ice_depth_schema.sql
-- Paste here and click Run
```

---

## Migration 003: Scheduling Schema

**File:** `supabase/migrations/003_scheduling_schema.sql`

**What it creates:**
- `staff_members` - Employee roster
- `shifts` - Shift templates
- `shift_assignments` - Scheduled shifts for staff

**Run this:**
```sql
-- Copy entire contents of supabase/migrations/003_scheduling_schema.sql
-- Paste here and click Run
```

---

## Migration 004: Daily Reports Schema

**File:** `supabase/migrations/004_daily_reports_schema.sql`

**What it creates:**
- `daily_reports` - Parent table for daily operational reports
- `daily_report_tabs` - Custom tabs within reports
- `daily_report_fields` - Custom field definitions (JSONB)
- `daily_report_entries` - Actual report data

**Run this:**
```sql
-- Copy entire contents of supabase/migrations/004_daily_reports_schema.sql
-- Paste here and click Run
```

---

## Migration 005: Refrigeration Schema

**File:** `supabase/migrations/005_refrigeration_schema.sql`

**What it creates:**
- `refrigeration_logs` - Temperature, pressure, refrigerant readings
- `refrigeration_field_configs` - Custom field builder for facility-specific measurements

**Run this:**
```sql
-- Copy entire contents of supabase/migrations/005_refrigeration_schema.sql
-- Paste here and click Run
```

---

## Migration 006: Air Quality Schema

**File:** `supabase/migrations/006_air_quality_schema.sql`

**What it creates:**
- `air_quality_logs` - CO and NO2 level measurements
- `air_quality_thresholds` - Configurable warning/danger thresholds per facility
- Auto-create default thresholds trigger

**Run this:**
```sql
-- Copy entire contents of supabase/migrations/006_air_quality_schema.sql
-- Paste here and click Run
```

---

## Migration 007: Enhanced Circle Check

**File:** `supabase/migrations/007_enhanced_circle_check.sql`

**What it creates:**
- `circle_check_templates` - Machine-type templates (Electric/Gas)
- `circle_check_items` - Individual check items (41 Electric, 51 Gas)
- `circle_check_logs` - Completed inspections
- `circle_check_results` - Per-item results with photos
- Function: `create_default_circle_check_templates()`

**Run this:**
```sql
-- Copy entire contents of supabase/migrations/007_enhanced_circle_check.sql
-- Paste here and click Run
```

---

## Verify Migrations

After running all migrations, verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Expected tables (21 total):**
- air_quality_logs
- air_quality_thresholds
- circle_check_items
- circle_check_logs
- circle_check_results
- circle_check_templates
- daily_report_entries
- daily_report_fields
- daily_report_tabs
- daily_reports
- facilities
- ice_depth_logs
- ice_machines
- incidents
- profiles
- refrigeration_field_configs
- refrigeration_logs
- rinks
- shift_assignments
- shifts
- staff_members

---

## Optional: Seed Test Data

**File:** `supabase/migrations/seed_data.sql`

Creates test data:
- Facility: "Springfield Community Rink"
- 2 Rinks
- 2 Ice Machines
- 4 Staff Members
- Sample shifts, templates, configurations

```sql
-- Copy entire contents of supabase/migrations/seed_data.sql
-- Paste here and click Run
```

---

## Initialize Circle Check Templates

After seeding data, initialize the default Electric and Gas Zamboni templates:

```sql
-- First, get your facility ID
SELECT id, name FROM facilities;

-- Copy the facility ID from the result, then run:
SELECT create_default_circle_check_templates('PASTE-FACILITY-ID-HERE');
```

This creates:
- **Electric Zamboni Standard** template with 41 check items
- **Gas Zamboni Standard** template with 51 check items

---

## Create Storage Bucket

For Circle Check photo uploads:

1. In Supabase dashboard, go to **Storage**
2. Click **Create bucket**
3. Name: `circle-check-photos`
4. Public: **OFF**
5. Click **Create**

### Add Storage Policies

Click on bucket → **Policies** → **New Policy** → **For full customization**

**SELECT Policy:**
```sql
CREATE POLICY "Facility members can view photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'circle-check-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT facility_id::text
    FROM profiles
    WHERE id = auth.uid()
  )
);
```

**INSERT Policy:**
```sql
CREATE POLICY "Facility members can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'circle-check-photos' AND
  (storage.foldername(name))[1] IN (
    SELECT facility_id::text
    FROM profiles
    WHERE id = auth.uid()
  )
);
```

---

## Create Test Users

### Admin User

1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Email: `admin@test.com`
4. Password: `Test1234!`
5. Auto Confirm: **ON**
6. Click **Create user**
7. Copy the user ID

### Create Admin Profile

```sql
-- Get facility ID first
SELECT id FROM facilities LIMIT 1;

-- Create profile (replace USER_ID and FACILITY_ID)
INSERT INTO profiles (id, facility_id, first_name, last_name, role, email)
VALUES (
  'USER_ID',
  'FACILITY_ID',
  'Admin',
  'User',
  'admin',
  'admin@test.com'
);
```

### Regular User

Repeat for regular user:
- Email: `user@test.com`
- Password: `Test1234!`
- Role: `staff` (in profile)

---

## Troubleshooting

### Error: "relation does not exist"
- Run migrations in order (001 → 007)
- Some migrations depend on previous ones

### Error: "permission denied"
- Ensure you're using Service Role key in SQL Editor
- Check RLS policies are enabled

### Error: "duplicate key value"
- Migration already ran
- Check if table exists: `\dt circle_check_templates`
- Skip or drop table first (use caution!)

### No data showing in app
- Verify seed_data.sql ran successfully
- Check user profile has facility_id set
- Verify RLS policies with:
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## Next Steps

After completing migrations:

1. ✅ Configure `.env.local` with Supabase credentials
2. ✅ Run `npm install`
3. ✅ Run `npm run dev`
4. ✅ Login with `admin@test.com` / `Test1234!`
5. ✅ Proceed to **TESTING_GUIDE.md** for module testing

---

## Quick Commands

**List all tables:**
```sql
\dt
```

**Check table structure:**
```sql
\d+ circle_check_templates
```

**View RLS policies:**
```sql
\d circle_check_templates
```

**Count records:**
```sql
SELECT
  'facilities' as table, COUNT(*) FROM facilities
UNION ALL
SELECT 'rinks', COUNT(*) FROM rinks
UNION ALL
SELECT 'ice_machines', COUNT(*) FROM ice_machines
UNION ALL
SELECT 'staff_members', COUNT(*) FROM staff_members;
```

---

## Migration Files Location

All migration files are in:
```
supabase/migrations/
├── 001_base_schema.sql
├── 002_ice_depth_schema.sql
├── 003_scheduling_schema.sql
├── 004_daily_reports_schema.sql
├── 005_refrigeration_schema.sql
├── 006_air_quality_schema.sql
├── 007_enhanced_circle_check.sql
├── seed_data.sql
└── README.md
```

For detailed explanations, see `supabase/migrations/README.md`
