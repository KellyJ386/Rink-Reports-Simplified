-- =====================================================
-- MFO Seed Data
-- File: seed_data.sql
-- Date: January 2026
-- Description: Sample data for testing all 7 modules
-- =====================================================

-- ⚠️ WARNING: This will DELETE existing data!
-- Only run this on development/testing databases

-- =====================================================
-- CLEAN UP EXISTING DATA (optional)
-- =====================================================

-- Uncomment to clear existing data:
-- TRUNCATE TABLE air_quality_logs, air_quality_thresholds CASCADE;
-- TRUNCATE TABLE refrigeration_logs, refrigeration_field_configs CASCADE;
-- TRUNCATE TABLE daily_report_submissions, daily_report_tabs CASCADE;
-- TRUNCATE TABLE incidents CASCADE;
-- TRUNCATE TABLE ice_maintenance_logs CASCADE;
-- TRUNCATE TABLE schedule_time_off, schedule_shifts, schedule_staff CASCADE;
-- TRUNCATE TABLE ice_depth_measurements, ice_depth_templates CASCADE;
-- TRUNCATE TABLE rinks, ice_machines CASCADE;
-- TRUNCATE TABLE profiles CASCADE;
-- TRUNCATE TABLE facilities CASCADE;

-- =====================================================
-- 1. CREATE TEST FACILITY
-- =====================================================

INSERT INTO facilities (id, facility_name, address, city, state, zip, phone, email)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Demo Ice Arena', '123 Hockey Way', 'Anytown', 'CA', '12345', '555-0100', 'demo@icearena.com')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 2. CREATE TEST USERS (Manual step required)
-- =====================================================

-- NOTE: You must create auth users in Supabase Auth first, then update this section
-- with actual user IDs. For now, using placeholder IDs.

-- Example: After creating user in Supabase Auth UI:
-- INSERT INTO profiles (id, facility_id, first_name, last_name, phone, role)
-- VALUES
--   ('USER-UUID-FROM-AUTH', '00000000-0000-0000-0000-000000000001', 'John', 'Doe', '555-0101', 'admin');

-- =====================================================
-- 3. CREATE RINKS
-- =====================================================

INSERT INTO rinks (id, facility_id, rink_name, dimensions)
VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Rink 1', '200ft x 85ft'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Rink 2', '200ft x 85ft')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 4. CREATE ICE MACHINES
-- =====================================================

INSERT INTO ice_machines (id, facility_id, machine_name, machine_type, model, serial_number)
VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Zamboni 1', 'Zamboni', '552AC', 'Z-2021-001'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Zamboni 2', 'Zamboni', '552AC', 'Z-2021-002')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. MODULE 1: ICE DEPTH TEMPLATES & LOGS
-- =====================================================

-- Create a sample ice depth template
INSERT INTO ice_depth_templates (id, facility_id, template_name, point_count, template_data)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Standard 9-Point Grid',
    9,
    '[
      {"id": 1, "x": 25, "y": 25, "label": "A1"},
      {"id": 2, "x": 50, "y": 25, "label": "A2"},
      {"id": 3, "x": 75, "y": 25, "label": "A3"},
      {"id": 4, "x": 25, "y": 50, "label": "B1"},
      {"id": 5, "x": 50, "y": 50, "label": "Center"},
      {"id": 6, "x": 75, "y": 50, "label": "B3"},
      {"id": 7, "x": 25, "y": 75, "label": "C1"},
      {"id": 8, "x": 50, "y": 75, "label": "C2"},
      {"id": 9, "x": 75, "y": 75, "label": "C3"}
    ]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- NOTE: Ice depth measurements require valid operator_id (user UUID)
-- Add measurements after creating user profiles

-- =====================================================
-- 6. MODULE 2: EMPLOYEE SCHEDULING
-- =====================================================

-- Create sample staff members
INSERT INTO schedule_staff (id, facility_id, first_name, last_name, email, phone, role, status)
VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Mike', 'Johnson', 'mike@demo.com', '555-0201', 'manager', 'active'),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Sarah', 'Williams', 'sarah@demo.com', '555-0202', 'attendant', 'active'),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Tom', 'Davis', 'tom@demo.com', '555-0203', 'maintenance', 'active')
ON CONFLICT (id) DO NOTHING;

-- Create sample shifts for next week
INSERT INTO schedule_shifts (facility_id, shift_date, start_time, end_time, shift_type, role, assigned_staff_id, is_published)
VALUES
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE + 1, '08:00', '16:00', 'opening', 'manager', '40000000-0000-0000-0000-000000000001', true),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE + 1, '16:00', '22:00', 'closing', 'attendant', '40000000-0000-0000-0000-000000000002', true),
  ('00000000-0000-0000-0000-000000000001', CURRENT_DATE + 2, '08:00', '16:00', 'opening', 'maintenance', '40000000-0000-0000-0000-000000000003', true);

-- =====================================================
-- 7. MODULE 3: ICE MAINTENANCE LOGS
-- =====================================================

-- Sample maintenance logs (requires operator_id - user UUID)
-- Add after creating user profiles

-- =====================================================
-- 8. MODULE 4: DAILY REPORTS
-- =====================================================

-- Create sample daily report tabs
INSERT INTO daily_report_tabs (id, facility_id, tab_name, tab_order, form_schema)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Opening Checklist',
    1,
    '[
      {"id": "field1", "type": "text", "label": "Manager on Duty", "required": true},
      {"id": "field2", "type": "time", "label": "Doors Opened", "required": true},
      {"id": "field3", "type": "checkbox", "label": "Lights On", "required": false},
      {"id": "field4", "type": "checkbox", "label": "Ice Inspected", "required": false},
      {"id": "field5", "type": "textarea", "label": "Notes", "required": false}
    ]'::jsonb
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Closing Checklist',
    2,
    '[
      {"id": "field1", "type": "text", "label": "Manager on Duty", "required": true},
      {"id": "field2", "type": "time", "label": "Doors Locked", "required": true},
      {"id": "field3", "type": "checkbox", "label": "Lights Off", "required": false},
      {"id": "field4", "type": "checkbox", "label": "Security System Armed", "required": false},
      {"id": "field5", "type": "number", "label": "Cash Deposit", "required": false}
    ]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 9. MODULE 5: INCIDENTS
-- =====================================================

-- Sample incident (NOTE: incident_number should be generated by function)
-- Add after setting up user authentication

-- =====================================================
-- 10. MODULE 6: REFRIGERATION LOGS
-- =====================================================

-- Create sample custom field configurations
INSERT INTO refrigeration_field_configs (facility_id, field_name, label, field_type, unit, min_threshold, max_threshold, display_order)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'condenser_temp', 'Condenser Temperature', 'number', '°F', 70, 110, 1),
  ('00000000-0000-0000-0000-000000000001', 'evaporator_temp', 'Evaporator Temperature', 'number', '°F', -10, 10, 2),
  ('00000000-0000-0000-0000-000000000001', 'oil_pressure', 'Oil Pressure', 'number', 'PSI', 30, 60, 3)
ON CONFLICT (facility_id, field_name) DO NOTHING;

-- Sample refrigeration logs (requires recorded_by - user UUID)
-- Add after creating user profiles

-- =====================================================
-- 11. MODULE 7: AIR QUALITY LOGS
-- =====================================================

-- Create default thresholds (auto-created by trigger, but can override)
INSERT INTO air_quality_thresholds (facility_id, co_warning_threshold, co_danger_threshold, no2_warning_threshold, no2_danger_threshold)
VALUES
  ('00000000-0000-0000-0000-000000000001', 9, 35, 0.05, 1)
ON CONFLICT (facility_id) DO UPDATE SET
  co_warning_threshold = EXCLUDED.co_warning_threshold,
  co_danger_threshold = EXCLUDED.co_danger_threshold,
  no2_warning_threshold = EXCLUDED.no2_warning_threshold,
  no2_danger_threshold = EXCLUDED.no2_danger_threshold;

-- Sample air quality logs (requires recorded_by - user UUID)
-- Add after creating user profiles

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check what was created
SELECT 'Facilities' as table_name, COUNT(*) as count FROM facilities
UNION ALL
SELECT 'Rinks', COUNT(*) FROM rinks
UNION ALL
SELECT 'Ice Machines', COUNT(*) FROM ice_machines
UNION ALL
SELECT 'Ice Depth Templates', COUNT(*) FROM ice_depth_templates
UNION ALL
SELECT 'Schedule Staff', COUNT(*) FROM schedule_staff
UNION ALL
SELECT 'Schedule Shifts', COUNT(*) FROM schedule_shifts
UNION ALL
SELECT 'Daily Report Tabs', COUNT(*) FROM daily_report_tabs
UNION ALL
SELECT 'Refrigeration Field Configs', COUNT(*) FROM refrigeration_field_configs
UNION ALL
SELECT 'Air Quality Thresholds', COUNT(*) FROM air_quality_thresholds;

-- =====================================================
-- NEXT STEPS
-- =====================================================

/*

1. Create Auth Users in Supabase Dashboard:
   - Go to Authentication > Users
   - Click "Add User"
   - Enter email and password
   - Note the User ID

2. Create Profile for User:
   INSERT INTO profiles (id, facility_id, first_name, last_name, role)
   VALUES ('USER-UUID-HERE', '00000000-0000-0000-0000-000000000001', 'John', 'Doe', 'admin');

3. Create Sample Logs with User ID:

   -- Ice Depth Log
   INSERT INTO ice_depth_measurements (facility_id, rink_id, template_id, operator_id, measurement_date, measurement_time, unit, measurements)
   VALUES (
     '00000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000001',
     '30000000-0000-0000-0000-000000000001',
     'USER-UUID-HERE',
     CURRENT_DATE,
     CURRENT_TIME,
     'in',
     '{"1": 0.75, "2": 0.73, "3": 0.78, "4": 0.74, "5": 0.76, "6": 0.75, "7": 0.77, "8": 0.74, "9": 0.76}'::jsonb
   );

   -- Air Quality Log
   INSERT INTO air_quality_logs (facility_id, rink_id, log_date, log_time, co_level, co_status, no2_level, no2_status, temperature, humidity, recorded_by)
   VALUES (
     '00000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000001',
     CURRENT_DATE,
     CURRENT_TIME,
     5.2,
     'normal',
     0.03,
     'normal',
     55.0,
     45.0,
     'USER-UUID-HERE'
   );

   -- Refrigeration Log
   INSERT INTO refrigeration_logs (facility_id, rink_id, log_date, log_time, refrigerant_type, supply_temp, return_temp, ambient_temp, high_pressure, low_pressure, compressor_status, recorded_by)
   VALUES (
     '00000000-0000-0000-0000-000000000001',
     '10000000-0000-0000-0000-000000000001',
     CURRENT_DATE,
     CURRENT_TIME,
     'R-404A',
     18.5,
     22.3,
     70.0,
     225.0,
     35.0,
     'running',
     'USER-UUID-HERE'
   );

4. Test Application:
   - npm run dev
   - Login with test user
   - Navigate to each module
   - Verify data appears correctly

*/
