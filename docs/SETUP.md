# MFO Setup Guide

Complete setup instructions for the Max Facility Operations platform.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)
- Resend account (for emails)

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Environment
VITE_ENVIRONMENT=development
```

### 3. Set Up Supabase Database

#### Option A: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Option B: Manual Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Execute the migration

### 4. Create Test Data (Optional)

Create a test facility and user:

```sql
-- Create a test facility
INSERT INTO facilities (facility_name, city, state)
VALUES ('Test Ice Rink', 'Boston', 'MA')
RETURNING id;

-- Create a test user (requires auth.users entry first)
-- Sign up through the application, then run:
INSERT INTO profiles (id, facility_id, first_name, last_name, role)
VALUES (
  'auth-user-id-here',
  'facility-id-here',
  'Test',
  'Admin',
  'admin'
);

-- Create test rinks
INSERT INTO rinks (facility_id, rink_name)
VALUES
  ('facility-id-here', 'Rink 1'),
  ('facility-id-here', 'Rink 2');
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Database Schema Overview

### Core Tables
- `facilities` - Facility information and settings
- `rinks` - Individual ice rinks within facilities
- `profiles` - User profiles and roles
- `user_permissions` - Module-level permissions
- `ice_machines` - Zamboni and ice maintenance machines

### Module Tables

#### Ice Depth (Module 4.1)
- `ice_depth_templates` - Custom measurement templates
- `ice_depth_measurements` - Ice thickness measurements

#### Employee Scheduling (Module 4.2)
- `schedule_staff` - Staff members
- `schedule_shifts` - Shift assignments
- `schedule_time_off` - Time-off requests

#### Ice Maintenance (Module 4.3)
- `circle_check_templates` - Pre-shift inspection checklists
- `ice_maintenance_logs` - Maintenance activities

#### Incident Reports (Module 4.4)
- `incidents` - Safety incident reports

## Security Configuration

### Row Level Security (RLS)

All tables have RLS enabled with facility-based data isolation:

```sql
-- Example: Users can only access their facility's data
CREATE POLICY "Facility members can access ice depth measurements"
  ON ice_depth_measurements FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );
```

### User Roles

1. **Super Admin** - Platform owner, all facilities access
2. **Admin** - Facility owner, full facility control
3. **Manager** - Facility manager, operational access
4. **Staff** - Front-line users, data entry only

## Module Implementation Status

### ✅ Completed
- [x] Project infrastructure
- [x] Database migrations
- [x] Authentication system
- [x] Layout and navigation
- [x] Dashboard page
- [x] Module page shells

### 🚧 In Progress
- [ ] Ice Depth Log module (4.1)
  - [ ] Template management
  - [ ] Measurement entry
  - [ ] Bluetooth caliper integration
  - [ ] PDF export

- [ ] Employee Scheduling module (4.2)
  - [ ] Staff management
  - [ ] Shift creation
  - [ ] Time-off requests

- [ ] Ice Maintenance Log module (4.3)
  - [ ] Maintenance logging
  - [ ] Circle check checklists

- [ ] Incident Reports module (4.4)
  - [ ] Incident form
  - [ ] Body diagram
  - [ ] Auto-notifications

## Deployment

### Vercel Deployment

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Deploy
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel project settings
   - Add all environment variables from `.env`
   - Enable automatic deployments from GitHub

3. **Production Environment**
   - Set `VITE_ENVIRONMENT=production`
   - Use production Supabase project
   - Use live Stripe keys

### Supabase Production Setup

1. Create production Supabase project
2. Run migrations on production database
3. Configure authentication providers
4. Set up storage buckets for facility logos
5. Enable realtime for required tables

## Development Workflow

### Creating a New Module

1. Create database tables in new migration file
2. Add types to `src/types/database.ts`
3. Create module page in `src/pages/modules/`
4. Add route in `src/App.tsx`
5. Create module components in `src/components/modules/`
6. Add navigation link in `src/components/layout/MainLayout.tsx`

### Database Migrations

```bash
# Create new migration
supabase migration new migration_name

# Test migration
supabase db reset

# Apply to production
supabase db push --db-url "postgresql://..."
```

## Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database Connection Issues**
- Verify Supabase URL and anon key
- Check if RLS policies are correct
- Ensure user has proper facility_id in profiles table

**Authentication Not Working**
- Verify Supabase auth is enabled
- Check email templates in Supabase
- Ensure auth.users → profiles trigger exists

## Support

- Documentation: `/docs/MFO-PRD.md`
- GitHub Issues: Report bugs and feature requests
- Email: support@maxfacility.com

## License

Proprietary - Max Facility Operations © 2026
