# MFO Database Migrations

This directory contains all database schema migrations for MFO (Max Facility Operations).

## Migration Files

| File | Description | Status |
|------|-------------|--------|
| `001_initial_schema.sql` | Core tables + Ice Depth, Scheduling, Maintenance, Incidents | ✅ Existing |
| `002_add_ice_depth_statistics.sql` | Ice depth statistics enhancements | ✅ Existing |
| `003_add_fuel_type_and_circle_check_fields.sql` | Maintenance module enhancements | ✅ Existing |
| `004_daily_reports_schema.sql` | Daily Reports module tables | ✅ Existing |
| `005_refrigeration_schema.sql` | Refrigeration Log module | 🆕 New |
| `006_air_quality_schema.sql` | Air Quality Log module | 🆕 New |

## How to Run Migrations

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open each migration file in order (001 → 006)
4. Copy the SQL content
5. Paste into the SQL Editor
6. Click **Run** to execute

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run all pending migrations
supabase db push
```

### Option 3: Manual psql

```bash
# Connect to your database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Run each migration
\i 001_initial_schema.sql
\i 002_add_ice_depth_statistics.sql
\i 003_add_fuel_type_and_circle_check_fields.sql
\i 004_daily_reports_schema.sql
\i 005_refrigeration_schema.sql
\i 006_air_quality_schema.sql
```

## Database Schema Overview

### Core Tables
- `facilities` - Facility information
- `profiles` - User profiles (extends auth.users)
- `rinks` - Ice rinks within facilities
- `ice_machines` - Ice resurfacing machines
- `user_permissions` - Module-level permissions

### Module 1: Ice Depth Log
- `ice_depth_templates` - Custom measurement templates
- `ice_depth_measurements` - Ice depth readings

### Module 2: Employee Scheduling
- `schedule_staff` - Staff members
- `schedule_shifts` - Shift assignments
- `schedule_time_off` - Time-off requests

### Module 3: Ice Maintenance Log
- `circle_check_templates` - Circle check checklists
- `ice_maintenance_logs` - Unified log for 4 types:
  - Resurfacing (ice make)
  - Blade changes
  - Edging
  - Circle checks

### Module 4: Daily Reports
- `daily_report_tabs` - Custom report templates (up to 15)
- `daily_report_submissions` - Report submissions

### Module 5: Incidents
- `incidents` - Safety incident reports with auto-numbering

### Module 6: Refrigeration Log (NEW)
- `refrigeration_logs` - Temperature, pressure, and system monitoring
- `refrigeration_field_configs` - Custom field definitions

### Module 7: Air Quality Log (NEW)
- `air_quality_logs` - CO and NO2 level tracking
- `air_quality_thresholds` - Facility-specific alert thresholds

## Row Level Security (RLS)

All tables have RLS enabled to ensure multi-tenant data isolation:

```sql
-- Pattern used across all tables
CREATE POLICY "Facility members can access [table]"
  ON [table] FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );
```

**Important**: Users can ONLY access data from their assigned facility.

## Indexes

Performance indexes are created on:
- `facility_id` (all tables) - Multi-tenant filtering
- `log_date DESC` (all log tables) - Recent data queries
- `has_alerts` - Alert filtering
- Foreign key relationships

## Triggers

All tables with `updated_at` columns have automatic update triggers:

```sql
CREATE TRIGGER update_[table]_updated_at
  BEFORE UPDATE ON [table]
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Testing Migrations

After running migrations, verify with these queries:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true;

-- Check indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public';

-- Verify triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

## Seed Data

After running migrations, you may want to seed test data. See `seed_data.sql` for examples.

## Rollback (if needed)

⚠️ **Warning**: Rollback will DELETE ALL DATA

```sql
-- Drop all tables in reverse order
DROP TABLE IF EXISTS air_quality_thresholds CASCADE;
DROP TABLE IF EXISTS air_quality_logs CASCADE;
DROP TABLE IF EXISTS refrigeration_field_configs CASCADE;
DROP TABLE IF EXISTS refrigeration_logs CASCADE;
DROP TABLE IF EXISTS daily_report_submissions CASCADE;
DROP TABLE IF EXISTS daily_report_tabs CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS ice_maintenance_logs CASCADE;
DROP TABLE IF EXISTS circle_check_templates CASCADE;
DROP TABLE IF EXISTS schedule_time_off CASCADE;
DROP TABLE IF EXISTS schedule_shifts CASCADE;
DROP TABLE IF EXISTS schedule_staff CASCADE;
DROP TABLE IF EXISTS ice_depth_measurements CASCADE;
DROP TABLE IF EXISTS ice_depth_templates CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS ice_machines CASCADE;
DROP TABLE IF EXISTS rinks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
```

## Common Issues

### Issue: RLS prevents data access
**Solution**: Ensure user has a profile with `facility_id` set:
```sql
SELECT id, facility_id FROM profiles WHERE id = auth.uid();
```

### Issue: Foreign key constraint violation
**Solution**: Ensure parent records exist before inserting child records:
1. Create facility first
2. Create profiles
3. Create rinks
4. Create logs

### Issue: Migration already applied
**Solution**: Check if tables exist before running:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'refrigeration_logs'
);
```

## Next Steps

After migrations:
1. ✅ Create test facility: See `seed_data.sql`
2. ✅ Create test users with profiles
3. ✅ Test RLS policies
4. ✅ Configure auth triggers
5. ✅ Test application connectivity

## Support

For issues or questions:
- Check Supabase logs: **Logs > Database** in dashboard
- Review RLS policies: **Authentication > Policies**
- Check connection string: **Settings > Database**

---

**Last Updated**: January 2026
**Schema Version**: 006
**Total Tables**: 21
