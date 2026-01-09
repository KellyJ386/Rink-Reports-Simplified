# MFO Testing Guide - Week 2
## Complete Application Testing & Authentication Flow

**Status**: Ready for Testing
**Prerequisites**: All database migrations ready (001-007)
**Duration**: 2-3 hours

---

## 📋 Testing Checklist Overview

- [ ] Environment Setup
- [ ] Database Migrations
- [ ] Storage Bucket Configuration
- [ ] Test Data Creation
- [ ] Authentication Flow Testing
- [ ] Module 1: Ice Depth Log
- [ ] Module 2: Employee Scheduling
- [ ] Module 3: Ice Maintenance Log
- [ ] Module 4: Daily Reports
- [ ] Module 5: Incidents
- [ ] Module 6: Refrigeration Log
- [ ] Module 7: Air Quality Log
- [ ] Enhanced Circle Check System
- [ ] Multi-Tenant Isolation Testing
- [ ] Mobile Responsiveness Check

---

## PART 1: ENVIRONMENT SETUP

### Step 1.1: Create Supabase Project

If you don't have one already:

1. Go to https://supabase.com
2. Click "New Project"
3. Name: `mfo-dev` (or your choice)
4. Database Password: (save this!)
5. Region: Choose closest to you
6. Wait 2-3 minutes for project creation

### Step 1.2: Get Supabase Credentials

1. Go to Project Settings → API
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)

### Step 1.3: Configure Environment Variables

Create `.env.local` in project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**⚠️ Important**: Make sure `.env.local` is in `.gitignore`

---

## PART 2: DATABASE MIGRATIONS

### Step 2.1: Run All Migrations

Go to Supabase Dashboard → SQL Editor → New Query

**Run migrations in order:**

#### Migration 001: Core Schema
```sql
-- Copy content from: supabase/migrations/001_initial_schema.sql
-- Paste and click "Run"
```

#### Migration 002: Ice Depth Statistics
```sql
-- Copy content from: supabase/migrations/002_add_ice_depth_statistics.sql
-- Paste and click "Run"
```

#### Migration 003: Fuel Type & Circle Check
```sql
-- Copy content from: supabase/migrations/003_add_fuel_type_and_circle_check_fields.sql
-- Paste and click "Run"
```

#### Migration 004: Daily Reports
```sql
-- Copy content from: supabase/migrations/004_daily_reports_schema.sql
-- Paste and click "Run"
```

#### Migration 005: Refrigeration
```sql
-- Copy content from: supabase/migrations/005_refrigeration_schema.sql
-- Paste and click "Run"
```

#### Migration 006: Air Quality
```sql
-- Copy content from: supabase/migrations/006_air_quality_schema.sql
-- Paste and click "Run"
```

#### Migration 007: Enhanced Circle Check
```sql
-- Copy content from: supabase/migrations/007_enhanced_circle_check.sql
-- Paste and click "Run"
```

### Step 2.2: Verify Migrations

Run this verification query:

```sql
-- Check all tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected: 25 tables
```

Expected tables:
- facilities
- profiles
- rinks
- ice_machines
- user_permissions
- ice_depth_templates
- ice_depth_measurements
- schedule_staff
- schedule_shifts
- schedule_time_off
- ice_maintenance_logs
- circle_check_templates ✨ NEW
- circle_check_items ✨ NEW
- circle_check_logs ✨ NEW
- circle_check_results ✨ NEW
- daily_report_tabs
- daily_report_submissions
- incidents
- refrigeration_logs
- refrigeration_field_configs
- air_quality_logs
- air_quality_thresholds

### Step 2.3: Verify RLS Enabled

```sql
-- Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE table_schema = 'public'
AND rowsecurity = true;

-- Should show all 25 tables
```

---

## PART 3: STORAGE BUCKET SETUP

### Step 3.1: Create Circle Check Photos Bucket

1. Go to Storage → Create new bucket
2. Bucket name: `circle-check-photos`
3. Public: **OFF** (Private)
4. Click "Create bucket"

### Step 3.2: Configure Storage RLS Policy

Go to Storage → circle-check-photos → Policies → New Policy

**Policy Name**: Users can access own facility photos

**SELECT Policy**:
```sql
(bucket_id = 'circle-check-photos'::text)
AND (
  (storage.foldername(name))[1] IN (
    SELECT facility_id::text
    FROM profiles
    WHERE id = auth.uid()
  )
)
```

**INSERT Policy**:
```sql
(bucket_id = 'circle-check-photos'::text)
AND (
  (storage.foldername(name))[1] IN (
    SELECT facility_id::text
    FROM profiles
    WHERE id = auth.uid()
  )
)
```

---

## PART 4: TEST DATA CREATION

### Step 4.1: Create Test Facility

```sql
INSERT INTO facilities (id, facility_name, address, city, state, zip, phone, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Ice Arena',
  '123 Hockey Way',
  'Testville',
  'CA',
  '12345',
  '555-0100',
  'test@icearena.com'
);
```

### Step 4.2: Create Rinks

```sql
INSERT INTO rinks (id, facility_id, rink_name, dimensions) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Rink 1', '200ft x 85ft'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Rink 2', '200ft x 85ft');
```

### Step 4.3: Create Ice Machines

```sql
INSERT INTO ice_machines (id, facility_id, machine_name, machine_type, model, serial_number) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Zamboni 1', 'Electric Zamboni', '552AC', 'Z-2021-001'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Zamboni 2', 'Gas Zamboni', '552AC', 'Z-2021-002');
```

### Step 4.4: Initialize Circle Check Templates

```sql
SELECT create_default_circle_check_templates('00000000-0000-0000-0000-000000000001');

-- Verify templates were created
SELECT template_name, machine_type,
  (SELECT COUNT(*) FROM circle_check_items WHERE template_id = circle_check_templates.id) as item_count
FROM circle_check_templates
WHERE facility_id = '00000000-0000-0000-0000-000000000001';

-- Expected:
-- Electric Zamboni Standard | electric | 41
-- Gas Zamboni Standard | gas | 51
```

### Step 4.5: Create Schedule Staff

```sql
INSERT INTO schedule_staff (facility_id, first_name, last_name, email, phone, role, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Mike', 'Johnson', 'mike@test.com', '555-0201', 'manager', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Sarah', 'Williams', 'sarah@test.com', '555-0202', 'attendant', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Tom', 'Davis', 'tom@test.com', '555-0203', 'maintenance', 'active');
```

### Step 4.6: Create Daily Report Templates

```sql
INSERT INTO daily_report_tabs (facility_id, tab_name, tab_order, form_schema) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Opening Checklist',
    1,
    '[
      {"id": "field1", "type": "text", "label": "Manager on Duty", "required": true},
      {"id": "field2", "type": "time", "label": "Doors Opened", "required": true},
      {"id": "field3", "type": "checkbox", "label": "Lights On", "required": false},
      {"id": "field4", "type": "checkbox", "label": "Ice Inspected", "required": false}
    ]'::jsonb
  );
```

---

## PART 5: CREATE TEST USERS

### Step 5.1: Create Admin User

1. Go to Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter:
   - Email: `admin@test.com`
   - Password: `TestPass123!`
   - Auto Confirm User: **ON**
4. Click "Create user"
5. **Copy the User ID** (looks like: `a1b2c3d4-...`)

### Step 5.2: Create Admin Profile

```sql
-- Replace USER-ID-HERE with the UUID from Step 5.1
INSERT INTO profiles (id, facility_id, first_name, last_name, role) VALUES
  ('USER-ID-HERE', '00000000-0000-0000-0000-000000000001', 'Admin', 'User', 'admin');
```

### Step 5.3: Create Standard User

1. Go to Authentication → Users
2. Click "Add user"
3. Enter:
   - Email: `user@test.com`
   - Password: `TestPass123!`
   - Auto Confirm User: **ON**
4. Click "Create user"
5. **Copy the User ID**

```sql
-- Replace USER-ID-HERE with the second user's UUID
INSERT INTO profiles (id, facility_id, first_name, last_name, role) VALUES
  ('USER-ID-HERE', '00000000-0000-0000-0000-000000000001', 'Test', 'User', 'staff');
```

---

## PART 6: APPLICATION SETUP & LAUNCH

### Step 6.1: Install Dependencies

```bash
cd /path/to/Rink-Reports-Simplified
npm install
```

### Step 6.2: Start Development Server

```bash
npm run dev
```

**Expected output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 6.3: Open Application

Open browser to: http://localhost:5173

---

## PART 7: AUTHENTICATION TESTING

### Test 7.1: Login with Admin User

- [ ] Navigate to http://localhost:5173
- [ ] Should redirect to /login
- [ ] Enter: `admin@test.com` / `TestPass123!`
- [ ] Click "Sign In"
- [ ] Should redirect to /dashboard
- [ ] Verify: "Admin User" shows in header (if implemented)

### Test 7.2: Dashboard Loads

- [ ] Dashboard displays 7 module cards:
  - Ice Depth Log
  - Employee Scheduling
  - Ice Maintenance Log
  - Daily Reports
  - Incident Reports
  - Refrigeration Log
  - Air Quality Log
- [ ] All cards are clickable
- [ ] Navigation menu shows all modules

### Test 7.3: Logout & Re-login

- [ ] Click "Sign Out" button
- [ ] Should redirect to /login
- [ ] Login with `user@test.com` / `TestPass123!`
- [ ] Should redirect to /dashboard
- [ ] Verify different user is logged in

---

## PART 8: MODULE TESTING

### MODULE 1: ICE DEPTH LOG ✅

**8.1.1: Create Ice Depth Template**
- [ ] Navigate to Ice Depth Log
- [ ] Click "Admin" or "Templates" section
- [ ] Click "Create Template"
- [ ] Enter name: "9-Point Grid"
- [ ] Add 9 measurement points
- [ ] Save template
- [ ] Verify: Template appears in list

**8.1.2: Log Ice Depth Measurement**
- [ ] Click "New Measurement"
- [ ] Select rink: "Rink 1"
- [ ] Select template: "9-Point Grid"
- [ ] Enter depths for all points (e.g., 0.75")
- [ ] Add notes: "Test measurement"
- [ ] Click "Save"
- [ ] Verify: Measurement appears in history

**8.1.3: View Measurements Grid**
- [ ] View saved measurement
- [ ] Verify: All depths display correctly
- [ ] Verify: Min/Max/Avg calculated
- [ ] Edit measurement
- [ ] Delete measurement (with confirmation)

---

### MODULE 2: EMPLOYEE SCHEDULING ✅

**8.2.1: Create Shift**
- [ ] Navigate to Scheduling
- [ ] Click "New Shift"
- [ ] Select date: Tomorrow
- [ ] Start time: 08:00
- [ ] End time: 16:00
- [ ] Assign to: "Mike Johnson"
- [ ] Position: "Manager"
- [ ] Click "Save"
- [ ] Verify: Shift appears on calendar

**8.2.2: Submit Time-Off Request**
- [ ] Click "Time-Off Requests"
- [ ] Click "Request Time Off"
- [ ] Select dates: Next week (3 days)
- [ ] Reason: "Vacation"
- [ ] Submit
- [ ] Verify: Request shows as "Pending"

**8.2.3: Approve Time-Off (as admin)**
- [ ] View time-off request
- [ ] Click "Approve"
- [ ] Verify: Status changes to "Approved"

---

### MODULE 3: ICE MAINTENANCE LOG ✅

**8.3.1: Log Ice Make (Resurfacing)**
- [ ] Navigate to Maintenance → Ice Make tab
- [ ] Click "New Ice Make"
- [ ] Select machine: "Zamboni 1"
- [ ] Select rink: "Rink 1"
- [ ] Ice temp: 20°F
- [ ] Water temp: 140°F
- [ ] Blade condition: "Good"
- [ ] Notes: "Clean cut"
- [ ] Save
- [ ] Verify: Log appears with today's count updated

**8.3.2: Log Blade Change**
- [ ] Click "Blade Change" tab
- [ ] Click "New Blade Change"
- [ ] Select machine: "Zamboni 1"
- [ ] Blade hours: 250
- [ ] Old blade ID: "B-001"
- [ ] New blade ID: "B-002"
- [ ] Save
- [ ] Verify: This month's count updated

**8.3.3: Log Edging**
- [ ] Click "Edging" tab
- [ ] Create edging log
- [ ] Edge depth: 0.5"
- [ ] Save
- [ ] Verify: This week's count updated

---

### MODULE 4: DAILY REPORTS ✅

**8.4.1: Admin - View Templates**
- [ ] Navigate to Daily Reports
- [ ] Click "Admin" view
- [ ] Verify: "Opening Checklist" template exists
- [ ] View template details
- [ ] See 4 fields configured

**8.4.2: Submit Daily Report**
- [ ] Click "Submit" view
- [ ] Select tab: "Opening Checklist"
- [ ] Fill in fields:
  - Manager: "Admin User"
  - Doors Opened: "08:00"
  - Checkboxes: Check both
- [ ] Submit
- [ ] Verify: Success message

**8.4.3: View Report History**
- [ ] Click "History" view
- [ ] Filter by today's date
- [ ] Verify: Submitted report appears
- [ ] Click "Edit" on report
- [ ] Modify a field
- [ ] Save
- [ ] Verify: Changes saved

**8.4.4: Create New Report Template (Admin)**
- [ ] Click "Admin" view
- [ ] Click "Create Tab"
- [ ] Name: "Closing Checklist"
- [ ] Add fields:
  - Text: "Closing Manager"
  - Time: "Doors Locked"
  - Number: "Cash Deposit"
- [ ] Save
- [ ] Verify: New tab appears in list
- [ ] Submit view should show new tab

---

### MODULE 5: INCIDENTS ✅

**8.5.1: Create Incident Report**
- [ ] Navigate to Incidents
- [ ] Click "New Incident"
- [ ] Date/Time: Today, current time
- [ ] Location: "Rink 1 - North End"
- [ ] Incident Type: "Slip/Trip/Fall"
- [ ] Severity: "Minor"
- [ ] Injured Name: "Test Person"
- [ ] Age: 25
- [ ] Description: "Slipped on ice near boards"
- [ ] Response Actions: Check "First Aid" and "Ice Pack"
- [ ] Click "Save"
- [ ] Verify: Incident number auto-generated (YYYY-NNNN format)

**8.5.2: View Incident Details**
- [ ] Click on saved incident
- [ ] Verify: All information displays correctly
- [ ] Verify: Response actions show with checkmarks
- [ ] Verify: Severity badge colored correctly

**8.5.3: Lock Incident**
- [ ] Click "Lock" button
- [ ] Verify: Lock icon appears
- [ ] Try to edit: Should be disabled
- [ ] Unlock incident
- [ ] Edit should work again

**8.5.4: Filter Incidents**
- [ ] Use severity filter: Select "Minor"
- [ ] Verify: Only minor incidents show
- [ ] Use date range filter
- [ ] Verify: Results filtered correctly

---

### MODULE 6: REFRIGERATION LOG ✅

**8.6.1: Create Refrigeration Log**
- [ ] Navigate to Refrigeration
- [ ] Click "New Log"
- [ ] Select rink: "Rink 1"
- [ ] Date/Time: Now
- [ ] Refrigerant Type: "R-404A"
- [ ] Supply Temp: 18.5°F
- [ ] Return Temp: 22.3°F
- [ ] Ambient Temp: 70°F
- [ ] High Pressure: 225 PSI
- [ ] Low Pressure: 35 PSI
- [ ] Compressor Status: "Running"
- [ ] Notes: "All systems normal"
- [ ] Save
- [ ] Verify: Log appears in list

**8.6.2: View Trends**
- [ ] Click "Trends" tab
- [ ] Verify: Temperature chart displays
- [ ] Verify: Pressure chart displays
- [ ] Change time range: 30 days
- [ ] Verify: Charts update

**8.6.3: Test Alert System**
- [ ] Create new log with out-of-range value:
  - Supply Temp: 30°F (above threshold)
- [ ] Save
- [ ] Verify: Log shows alert indicator (orange border)
- [ ] Verify: Alert count in stats increases

---

### MODULE 7: AIR QUALITY LOG ✅

**8.7.1: Create Air Quality Log**
- [ ] Navigate to Air Quality
- [ ] Click "New Log"
- [ ] Select rink: "Rink 1"
- [ ] Date/Time: Now
- [ ] CO Level: 5.2 ppm (normal)
- [ ] NO2 Level: 0.03 ppm (normal)
- [ ] Temperature: 55°F
- [ ] Humidity: 45%
- [ ] Ventilation: "Normal"
- [ ] Notes: "All readings normal"
- [ ] Save
- [ ] Verify: Log shows as "Normal"

**8.7.2: Test Warning Threshold**
- [ ] Create new log:
  - CO Level: 12 ppm (warning range)
- [ ] Verify: Warning alert shows in form
- [ ] Save
- [ ] Verify: Log shows warning status (yellow)

**8.7.3: Test Danger Threshold**
- [ ] Create new log:
  - CO Level: 40 ppm (danger)
- [ ] Verify: Danger alert shows in form (red)
- [ ] Add corrective actions: "Increased ventilation"
- [ ] Save
- [ ] Verify: Log shows danger status (red)
- [ ] Verify: Danger count in stats increases

**8.7.4: View Trends & Compliance**
- [ ] Click "Trends & Compliance" tab
- [ ] Verify: CO chart shows with threshold lines
- [ ] Verify: NO2 chart shows with threshold lines
- [ ] Verify: Compliance summary shows correct status
- [ ] Verify: Alert summary displays

---

### MODULE 8: ENHANCED CIRCLE CHECK ✨ NEW

**8.8.1: Admin - View Templates**
- [ ] Navigate to Maintenance → Circle Check tab
- [ ] Click "Admin" or "Configure" view
- [ ] Select template: "Electric Zamboni Standard"
- [ ] Verify: 41 items show
- [ ] Verify: Items organized by category

**8.8.2: Admin - Toggle Items**
- [ ] Find item: "Battery Gauge"
- [ ] Toggle "Enabled" to OFF
- [ ] Verify: Item grays out
- [ ] Toggle back to ON
- [ ] Verify: Item returns to normal

**8.8.3: Admin - Mark Item as Required**
- [ ] Find item: "Key out of Ignition"
- [ ] Toggle "Required" to ON
- [ ] Verify: Marked as mandatory

**8.8.4: Admin - Reorder Items**
- [ ] Find first item
- [ ] Click down arrow
- [ ] Verify: Item moves down one position
- [ ] Click up arrow
- [ ] Verify: Item returns to position

**8.8.5: Admin - Add Custom Item**
- [ ] Click "Add Custom Item"
- [ ] Item text: "Check custom component XYZ"
- [ ] Category: "Custom"
- [ ] Save
- [ ] Verify: Item added to bottom of list

**8.8.6: Operator - Complete Circle Check**
- [ ] Switch to "Operator" view
- [ ] Click "New Circle Check"
- [ ] Select machine: "Zamboni 1"
- [ ] Select template: "Electric Zamboni Standard"
- [ ] Date/Time: Now
- [ ] Verify: Progress bar shows 0/41 items
- [ ] Complete first 5 items:
  - Item 1: Click "Pass" (green)
  - Item 2: Click "Pass"
  - Item 3: Click "Fail" (red)
  - Item 4: Click "N/A" (gray)
  - Item 5: Click "Pass"
- [ ] Verify: Progress updates to 5/41

**8.8.7: Add Photo to Failed Item**
- [ ] On failed item (Item 3)
- [ ] Verify: Notes field appears
- [ ] Add notes: "Battery gauge not working"
- [ ] Click "Add Photo"
- [ ] Select a test image
- [ ] Verify: Photo thumbnail shows

**8.8.8: Complete & Submit Circle Check**
- [ ] Complete all remaining items (can use Pass for speed)
- [ ] Add general notes: "Completed pre-shift inspection"
- [ ] Check "Manager notified" (if failures)
- [ ] Click "Complete Circle Check"
- [ ] Verify: Success message
- [ ] Verify: Redirects to list view

**8.8.9: View Completed Circle Check**
- [ ] Find completed circle check in list
- [ ] Verify: Shows pass/fail status
- [ ] Verify: Shows failed items count
- [ ] Verify: Shows operator name
- [ ] Click "View Details"
- [ ] Verify: All items display correctly
- [ ] Verify: Failed item shows note and photo
- [ ] Verify: General notes display

**8.8.10: Filter Circle Checks**
- [ ] Use status filter: "Failed Only"
- [ ] Verify: Only failed checks show
- [ ] Use machine filter: "Zamboni 1"
- [ ] Verify: Filters correctly

---

## PART 9: MULTI-TENANT ISOLATION TESTING

### Step 9.1: Create Second Facility

```sql
INSERT INTO facilities (id, facility_name, address) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Second Arena', '456 Ice Street');

INSERT INTO rinks (facility_id, rink_name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Arena Rink 1');
```

### Step 9.2: Create User for Second Facility

1. Create user: `user2@test.com` / `TestPass123!`
2. Copy User ID

```sql
-- Replace USER-ID with second facility user's UUID
INSERT INTO profiles (id, facility_id, first_name, last_name, role) VALUES
  ('USER-ID', '11111111-1111-1111-1111-111111111111', 'User', 'Two', 'admin');
```

### Step 9.3: Test Data Isolation

- [ ] Login as `admin@test.com`
- [ ] Create an incident
- [ ] Create a refrigeration log
- [ ] Logout
- [ ] Login as `user2@test.com`
- [ ] Navigate to Incidents
- [ ] Verify: NO incidents from first facility show
- [ ] Navigate to Refrigeration
- [ ] Verify: NO logs from first facility show
- [ ] Create incident for second facility
- [ ] Logout
- [ ] Login as `admin@test.com`
- [ ] Verify: Cannot see second facility's incident

**✅ CRITICAL: Data must be completely isolated between facilities**

---

## PART 10: MOBILE RESPONSIVENESS

### Test 10.1: Mobile Navigation

- [ ] Open browser dev tools (F12)
- [ ] Select mobile device (iPhone 12)
- [ ] Refresh page
- [ ] Verify: Navigation collapses to hamburger menu
- [ ] Click hamburger
- [ ] Verify: Menu opens
- [ ] Verify: All nav items accessible

### Test 10.2: Module Cards on Mobile

- [ ] View Dashboard on mobile
- [ ] Verify: Cards stack vertically
- [ ] Verify: Cards are tappable
- [ ] Verify: No horizontal scroll

### Test 10.3: Forms on Mobile

- [ ] Open any form (e.g., New Incident)
- [ ] Verify: Form fields stack vertically
- [ ] Verify: Input fields sized appropriately
- [ ] Verify: Date picker works on mobile
- [ ] Verify: Select dropdowns are native
- [ ] Verify: Submit button accessible

### Test 10.4: Lists on Mobile

- [ ] View any list (e.g., Incidents list)
- [ ] Verify: List scrolls smoothly
- [ ] Verify: Action buttons are tappable (44x44px)
- [ ] Verify: No content cutoff

### Test 10.5: Charts on Mobile

- [ ] View Refrigeration Trends
- [ ] Verify: Charts responsive and viewable
- [ ] Verify: Legend readable
- [ ] Verify: No horizontal overflow

---

## PART 11: ERROR HANDLING

### Test 11.1: Offline Behavior

- [ ] Open application
- [ ] Disconnect internet
- [ ] Try to load data
- [ ] Verify: Appropriate error message
- [ ] Reconnect internet
- [ ] Verify: Data loads

### Test 11.2: Invalid Data

- [ ] Try to submit form with missing required fields
- [ ] Verify: Validation errors show
- [ ] Try to enter invalid date (past date where not allowed)
- [ ] Verify: Validation prevents submission

### Test 11.3: Concurrent Edits

- [ ] Open same incident in two browser tabs
- [ ] Edit in tab 1, save
- [ ] Edit in tab 2, save
- [ ] Verify: No data corruption (last save wins)

---

## 🎯 TESTING COMPLETION CHECKLIST

### Core Functionality
- [ ] All 7 modules load without errors
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] All filters work correctly
- [ ] All charts render correctly
- [ ] All forms validate correctly

### Circle Check System
- [ ] Admin can configure templates
- [ ] Admin can toggle items on/off
- [ ] Admin can add custom items
- [ ] Operators see only enabled items
- [ ] Photos upload successfully
- [ ] Completed checks display correctly

### Security & Access
- [ ] Users can only see own facility data
- [ ] RLS prevents cross-facility access
- [ ] Logout works correctly
- [ ] Session persists on refresh

### Performance
- [ ] Pages load in < 3 seconds
- [ ] No console errors in browser
- [ ] Charts render smoothly
- [ ] Forms submit quickly

### Mobile
- [ ] Navigation works on mobile
- [ ] Forms usable on mobile
- [ ] No horizontal scroll
- [ ] Buttons are tappable

---

## 🐛 ISSUE TRACKING

If you find issues, document them here:

### Issue 1: [Description]
- **Module**:
- **Steps to Reproduce**:
- **Expected**:
- **Actual**:
- **Screenshot**:

---

## ✅ NEXT STEPS AFTER TESTING

Once all tests pass:

1. **Document any issues found**
2. **Continue to Week 3: Mobile Optimization**
3. **Start on Week 4: Threshold Configuration UIs**
4. **Plan for production deployment**

---

## 📞 SUPPORT

If you encounter issues:

1. Check Supabase logs: Dashboard → Logs → Database
2. Check browser console: F12 → Console
3. Verify RLS policies: Authentication → Policies
4. Check storage policies: Storage → Policies
5. Review migration status: SQL Editor → check table existence

---

**Last Updated**: January 2026
**Testing Status**: Ready to Begin
**Estimated Time**: 2-3 hours for complete testing
