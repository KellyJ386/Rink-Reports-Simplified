# Max Facility Rink Reports Deployment Checklist

Complete checklist to get Max Facility Rink Reports running from scratch. Follow in order.

---

## 📋 PRE-DEPLOYMENT

### Prerequisites
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git installed and repository cloned
- [ ] Supabase account created (https://app.supabase.com)
- [ ] Text editor ready (VS Code, etc.)

---

## 🗄️ PART 1: SUPABASE SETUP (30 minutes)

### 1.1 Create Project
- [ ] Login to https://app.supabase.com
- [ ] Click "New Project"
- [ ] Name: `rink-reports-dev` (or your choice)
- [ ] Generate strong database password
- [ ] Save password securely
- [ ] Choose region closest to you
- [ ] Wait for project initialization (~2 minutes)

### 1.2 Get API Credentials
- [ ] Click Settings (gear icon) → API
- [ ] Copy **Project URL**
- [ ] Copy **anon public** key
- [ ] Keep this tab open (you'll need these values)

### 1.3 Configure Local Environment
- [ ] In project root: `cp .env.local.example .env.local`
- [ ] Edit `.env.local`
- [ ] Paste `VITE_SUPABASE_URL=your-url-here`
- [ ] Paste `VITE_SUPABASE_ANON_KEY=your-key-here`
- [ ] Save file

### 1.4 Run Database Migrations
- [ ] In Supabase, click **SQL Editor** → **New Query**
- [ ] Open `supabase/migrations/001_base_schema.sql`
- [ ] Copy entire file contents
- [ ] Paste in SQL Editor and click **Run**
- [ ] Verify "Success. No rows returned"
- [ ] Repeat for migrations 002-007:
  - [ ] `002_ice_depth_schema.sql`
  - [ ] `003_scheduling_schema.sql`
  - [ ] `004_daily_reports_schema.sql`
  - [ ] `005_refrigeration_schema.sql`
  - [ ] `006_air_quality_schema.sql`
  - [ ] `007_enhanced_circle_check.sql`

### 1.5 Verify Migrations
- [ ] Run verification query:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```
- [ ] Confirm 21 tables exist (see MIGRATION_QUICK_START.md for list)

### 1.6 Create Storage Bucket
- [ ] In Supabase, click **Storage**
- [ ] Click **Create bucket**
- [ ] Name: `circle-check-photos`
- [ ] Public: **OFF** (keep private)
- [ ] Click **Create bucket**

### 1.7 Configure Storage Policies
- [ ] Click on `circle-check-photos` bucket
- [ ] Click **Policies** tab
- [ ] Click **New Policy** → **For full customization**
- [ ] Add SELECT policy (see MIGRATION_QUICK_START.md)
- [ ] Add INSERT policy (see MIGRATION_QUICK_START.md)
- [ ] Verify both policies show as enabled

---

## 🧪 PART 2: TEST DATA SETUP (15 minutes)

### 2.1 Load Seed Data
- [ ] In SQL Editor, open new query
- [ ] Open `supabase/migrations/seed_data.sql`
- [ ] Copy entire file contents
- [ ] Paste and click **Run**
- [ ] Verify success messages

### 2.2 Initialize Circle Check Templates
- [ ] In SQL Editor, run:
```sql
SELECT id, name FROM facilities;
```
- [ ] Copy the facility ID from result
- [ ] Run template initialization:
```sql
SELECT create_default_circle_check_templates('PASTE-FACILITY-ID-HERE');
```
- [ ] Verify "Success" message

### 2.3 Create Admin User
- [ ] In Supabase, go to **Authentication** → **Users**
- [ ] Click **Add User** → **Create new user**
- [ ] Email: `admin@test.com`
- [ ] Password: `Test1234!`
- [ ] Auto Confirm User: **ON**
- [ ] Click **Create user**
- [ ] Copy the user ID (UUID)

### 2.4 Create Admin Profile
- [ ] In SQL Editor, get facility ID:
```sql
SELECT id FROM facilities LIMIT 1;
```
- [ ] Create profile (replace USER_ID and FACILITY_ID):
```sql
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
- [ ] Verify "Success. 1 rows affected"

### 2.5 Create Regular User (Optional)
- [ ] Repeat 2.3 for `user@test.com` / `Test1234!`
- [ ] Create profile with `role = 'staff'` (not 'admin')

---

## 💻 PART 3: LOCAL DEVELOPMENT (10 minutes)

### 3.1 Install Dependencies
- [ ] Open terminal in project root
- [ ] Run: `npm install`
- [ ] Wait for installation to complete
- [ ] Verify no errors

### 3.2 Start Development Server
- [ ] Run: `npm run dev`
- [ ] Wait for "Local: http://localhost:5173"
- [ ] Server should be running

### 3.3 First Login
- [ ] Open browser to http://localhost:5173
- [ ] You should see MFO login page
- [ ] Enter:
  - Email: `admin@test.com`
  - Password: `Test1234!`
- [ ] Click **Sign In**
- [ ] You should be redirected to Dashboard
- [ ] Verify all 7 module cards show

---

## ✅ PART 4: VERIFICATION (5 minutes)

### 4.1 Quick Smoke Test
- [ ] Dashboard loads without errors
- [ ] All 7 modules visible:
  - [ ] Ice Depth Log
  - [ ] Employee Scheduling
  - [ ] Ice Operations
  - [ ] Daily Reports
  - [ ] Incidents
  - [ ] Refrigeration Log
  - [ ] Air Quality Log
- [ ] Click one module (e.g., Ice Depth Log)
- [ ] Page loads without errors
- [ ] Click "New Entry"
- [ ] Form loads
- [ ] Cancel and return to dashboard

### 4.2 Check Browser Console
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab
- [ ] Verify no red errors
- [ ] Small warnings are OK

### 4.3 Test Logout/Login
- [ ] Click user menu (top right)
- [ ] Click "Logout"
- [ ] Verify redirect to login page
- [ ] Login again with same credentials
- [ ] Verify successful login to dashboard

---

## 🧪 PART 5: COMPREHENSIVE TESTING (2-3 hours)

- [ ] Follow [TESTING_GUIDE.md](TESTING_GUIDE.md) for detailed module testing
- [ ] Test all 7 core modules
- [ ] Test Enhanced Circle Check system
- [ ] Test multi-tenant isolation
- [ ] Test mobile responsiveness

---

## 🚨 TROUBLESHOOTING

### Application won't start
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Login fails with "Invalid credentials"
- [ ] Verify user created in Supabase Auth
- [ ] Verify profile created in profiles table
- [ ] Check .env.local has correct credentials
- [ ] Restart dev server

### "Table does not exist" errors
- [ ] Verify all 7 migrations ran successfully
- [ ] Check SQL Editor for error messages
- [ ] Run migrations in order (001-007)
- [ ] Check Supabase dashboard for RLS policies

### Data doesn't show in app
- [ ] Verify seed_data.sql ran successfully
- [ ] Check user profile has facility_id set
- [ ] Run query:
```sql
SELECT * FROM profiles WHERE email = 'admin@test.com';
```
- [ ] Verify facility_id matches facility ID from facilities table

### Photos won't upload
- [ ] Verify storage bucket `circle-check-photos` exists
- [ ] Verify storage policies are enabled
- [ ] Check browser console for specific error
- [ ] Test bucket permissions in Supabase Storage UI

### Module shows "No data"
- [ ] Check browser console for errors
- [ ] Verify RLS policies on table
- [ ] Check that user's facility_id matches data
- [ ] Try creating new entry manually

---

## 📊 SUCCESS CRITERIA

You've successfully deployed Max Facility Rink Reports when:

✅ All 7 migrations ran without errors
✅ Admin user can login
✅ Dashboard shows all 7 modules
✅ Can create/edit/delete records in at least one module
✅ No red errors in browser console
✅ Circle Check templates initialized
✅ Storage bucket created and accessible

---

## 📚 NEXT STEPS AFTER DEPLOYMENT

1. **Complete Testing** - Follow TESTING_GUIDE.md
2. **Create Production Environment** - Repeat setup with production Supabase project
3. **Configure CI/CD** - Set up automated deployments
4. **Add More Test Data** - Create realistic sample data
5. **Invite Team Members** - Create additional user accounts
6. **Phase 3 Features** - Start building notifications, exports, offline mode

---

## 📞 HELP & RESOURCES

- **Setup Guide**: [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- **Migration Guide**: [MIGRATION_QUICK_START.md](MIGRATION_QUICK_START.md)
- **Testing Guide**: [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Implementation Plan**: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- **Database Docs**: [supabase/migrations/README.md](supabase/migrations/README.md)

---

## ⏱️ TIME ESTIMATES

- **Supabase Setup**: 30 minutes
- **Test Data Setup**: 15 minutes
- **Local Development**: 10 minutes
- **Verification**: 5 minutes
- **Comprehensive Testing**: 2-3 hours

**Total**: ~4 hours for complete setup and basic testing

---

**Last Updated**: January 2026
**Version**: 2.0 (Phase 2 Complete)
