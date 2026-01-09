# MFO Setup Instructions

Quick-start guide to get the MFO (Max Facility Operations) platform running locally.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works fine)
- Git installed

## Step 1: Supabase Project Setup

### 1.1 Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Enter project details:
   - Name: `mfo-development` (or your choice)
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to initialize (~2 minutes)

### 1.2 Get API Credentials

1. In your Supabase dashboard, click "Settings" (gear icon)
2. Navigate to "API" section
3. Copy these values:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public** key (long string starting with "eyJ...")

### 1.3 Configure Environment

1. In the project root, copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and paste your credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 2: Run Database Migrations

### 2.1 Access SQL Editor

1. In Supabase dashboard, click "SQL Editor" in left sidebar
2. Click "New Query"

### 2.2 Run Migrations in Order

Run each migration file from `supabase/migrations/` in numerical order:

**Migration 001: Base Schema**
```sql
-- Copy entire contents of supabase/migrations/001_base_schema.sql
-- Paste into SQL Editor and click "Run"
```

**Migration 002: Ice Depth Schema**
```sql
-- Copy entire contents of supabase/migrations/002_ice_depth_schema.sql
-- Paste and Run
```

**Migration 003: Scheduling Schema**
```sql
-- Copy entire contents of supabase/migrations/003_scheduling_schema.sql
-- Paste and Run
```

**Migration 004: Daily Reports Schema**
```sql
-- Copy entire contents of supabase/migrations/004_daily_reports_schema.sql
-- Paste and Run
```

**Migration 005: Refrigeration Schema**
```sql
-- Copy entire contents of supabase/migrations/005_refrigeration_schema.sql
-- Paste and Run
```

**Migration 006: Air Quality Schema**
```sql
-- Copy entire contents of supabase/migrations/006_air_quality_schema.sql
-- Paste and Run
```

**Migration 007: Enhanced Circle Check Schema**
```sql
-- Copy entire contents of supabase/migrations/007_enhanced_circle_check.sql
-- Paste and Run
```

### 2.3 Verify Migrations

Run this query to verify all tables were created:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see:
- facilities
- profiles
- rinks
- ice_machines
- ice_depth_logs
- staff_members
- shifts
- shift_assignments
- daily_reports
- daily_report_tabs
- daily_report_fields
- daily_report_entries
- incidents
- refrigeration_logs
- refrigeration_field_configs
- air_quality_logs
- air_quality_thresholds
- circle_check_templates
- circle_check_items
- circle_check_logs
- circle_check_results

## Step 3: Create Storage Bucket

### 3.1 Create Bucket

1. In Supabase dashboard, click "Storage" in left sidebar
2. Click "Create bucket"
3. Bucket name: `circle-check-photos`
4. Public: **OFF** (keep private)
5. Click "Create bucket"

### 3.2 Configure Storage Policies

1. Click on the `circle-check-photos` bucket
2. Click "Policies" tab
3. Click "New Policy"
4. Select "For full customization"
5. Add these policies:

**SELECT Policy (View Photos):**
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

**INSERT Policy (Upload Photos):**
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

## Step 4: Create Test Data

### 4.1 Run Seed Data

1. In SQL Editor, open a new query
2. Copy entire contents of `supabase/migrations/seed_data.sql`
3. Paste and click "Run"

This creates:
- Test facility: "Springfield Community Rink"
- 2 rinks: "Main Rink", "Practice Rink"
- 2 ice machines: "Zamboni 1", "Zamboni 2"
- 4 staff members
- Sample shifts
- Report templates
- Field configurations
- Thresholds

### 4.2 Initialize Circle Check Templates

Run this function to create default Electric and Gas Zamboni templates:

```sql
-- Get the facility ID first
SELECT id, name FROM facilities;

-- Use the ID from above in this function
SELECT create_default_circle_check_templates('PASTE-FACILITY-ID-HERE');
```

## Step 5: Create Test Users

### 5.1 Create Admin User

1. In Supabase dashboard, click "Authentication" → "Users"
2. Click "Add User" → "Create new user"
3. Enter:
   - Email: `admin@test.com`
   - Password: `Test1234!`
   - Auto Confirm: **ON**
4. Click "Create user"
5. Copy the user ID

### 5.2 Create Admin Profile

In SQL Editor, run:
```sql
-- Replace USER_ID and FACILITY_ID with actual values
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

### 5.3 Create Regular User

Repeat the process for a regular user:
- Email: `user@test.com`
- Password: `Test1234!`
- Role: `staff` (not admin)

## Step 6: Install Dependencies & Run

### 6.1 Install Packages

```bash
npm install
```

### 6.2 Start Development Server

```bash
npm run dev
```

The application should open at `http://localhost:5173`

### 6.3 First Login

1. Navigate to `http://localhost:5173`
2. You should see the login page
3. Login with:
   - Email: `admin@test.com`
   - Password: `Test1234!`
4. You should be redirected to the Dashboard

## Step 7: Verify Installation

### 7.1 Check Dashboard

You should see all 7 module cards:
- Ice Depth Log
- Employee Scheduling
- Ice Operations
- Daily Reports
- Incidents
- Refrigeration Log
- Air Quality Log

### 7.2 Test One Module

Click on "Ice Depth Log":
- Click "New Entry"
- Fill in the form
- Click "Save"
- Entry should appear in the list

## Troubleshooting

### Issue: "Invalid API credentials"
- Double-check `.env.local` has correct URL and anon key
- Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: "Table does not exist"
- Verify all migrations ran successfully
- Check for error messages in SQL Editor
- Run migrations in order (001-007)

### Issue: "Authentication error"
- Verify user exists in Authentication → Users
- Verify profile exists in profiles table
- Check that facility_id matches between user and data

### Issue: "Cannot read properties of null"
- Check browser console for specific error
- Verify facility has been created
- Verify user profile has facility_id set

## Next Steps

Once setup is complete, proceed to **TESTING_GUIDE.md** for comprehensive module testing.

## Quick Reference

**Supabase Dashboard:**
- Project: https://app.supabase.com
- SQL Editor: Dashboard → SQL Editor
- Storage: Dashboard → Storage
- Auth: Dashboard → Authentication

**Local Development:**
- Dev Server: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

**Database:**
- All tables use UUIDs
- Row Level Security (RLS) enforces multi-tenant isolation
- Soft deletes used where applicable

**Environment:**
- Development: `.env.local`
- Production: Configure in hosting platform
