-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Facilities
CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  email TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  temperature_unit TEXT DEFAULT 'fahrenheit' CHECK (temperature_unit IN ('fahrenheit', 'celsius')),
  logo_url TEXT,
  logo_uploaded_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Rinks
CREATE TABLE rinks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_name TEXT NOT NULL,
  dimensions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'staff')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Permissions
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('none', 'view', 'submit', 'full')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, module_name)
);

-- Ice Machines
CREATE TABLE ice_machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  machine_name TEXT NOT NULL,
  machine_type TEXT,
  model TEXT,
  serial_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MODULE 4.1: ICE DEPTH LOG
-- =====================================================

-- Ice depth templates
CREATE TABLE ice_depth_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  point_count INTEGER NOT NULL,
  template_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ice depth measurements
CREATE TABLE ice_depth_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID NOT NULL REFERENCES rinks(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES ice_depth_templates(id),
  operator_id UUID NOT NULL REFERENCES profiles(id),
  measurement_date DATE NOT NULL,
  measurement_time TIME NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('in', 'mm')),
  measurements JSONB NOT NULL,
  min_depth DECIMAL(5,2),
  min_depth_point_id INTEGER,
  max_depth DECIMAL(5,2),
  max_depth_point_id INTEGER,
  avg_depth DECIMAL(5,2),
  status TEXT CHECK (status IN ('good', 'warning', 'critical')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MODULE 4.2: EMPLOYEE SCHEDULING
-- =====================================================

-- Schedule staff
CREATE TABLE schedule_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('manager', 'supervisor', 'attendant', 'instructor', 'maintenance')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Schedule shifts
CREATE TABLE schedule_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('opening', 'closing', 'mid', 'event')),
  role TEXT NOT NULL,
  assigned_staff_id UUID REFERENCES schedule_staff(id),
  special_instructions TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Time-off requests
CREATE TABLE schedule_time_off (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES schedule_staff(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MODULE 4.3: ICE MAINTENANCE LOG
-- =====================================================

-- Circle check templates
CREATE TABLE circle_check_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  checklist_items JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ice maintenance logs
CREATE TABLE ice_maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('resurfacing', 'blade_change', 'edging', 'circle_check')),
  log_date DATE NOT NULL,
  log_time TIME,
  operator_id UUID NOT NULL REFERENCES profiles(id),
  machine_id UUID REFERENCES ice_machines(id),
  rink_id UUID REFERENCES rinks(id),
  start_time TIME,
  end_time TIME,
  machine_hours DECIMAL(10,2),
  make_type TEXT CHECK (make_type IN ('wet', 'dry')),
  water_used DECIMAL(10,2),
  water_unit TEXT CHECK (water_unit IN ('gallons', 'liters')),
  snow_removed_percent INTEGER,
  old_blade_condition TEXT CHECK (old_blade_condition IN ('worn', 'damaged', 'scheduled')),
  checklist_results JSONB,
  overall_status TEXT CHECK (overall_status IN ('pass', 'fail')),
  failed_items_count INTEGER,
  manager_notified BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MODULE 4.4: INCIDENT REPORTS
-- =====================================================

-- Incidents
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_number TEXT NOT NULL UNIQUE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID REFERENCES rinks(id),
  incident_date DATE NOT NULL,
  incident_time TIME NOT NULL,
  location TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'serious', 'critical')),
  injured_name TEXT NOT NULL,
  injured_age INTEGER,
  injured_phone TEXT,
  injured_email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  injuries JSONB NOT NULL,
  description TEXT NOT NULL,
  contributing_factors TEXT[],
  first_aid_given BOOLEAN DEFAULT FALSE,
  ice_pack_given BOOLEAN DEFAULT FALSE,
  ambulance_called BOOLEAN DEFAULT FALSE,
  parent_notified BOOLEAN DEFAULT FALSE,
  scene_secured BOOLEAN DEFAULT FALSE,
  medical_facility TEXT,
  staff_involved_ids UUID[],
  witnesses JSONB,
  reported_by UUID NOT NULL REFERENCES profiles(id),
  manager_notified BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Core indexes
CREATE INDEX idx_profiles_facility ON profiles(facility_id);
CREATE INDEX idx_rinks_facility ON rinks(facility_id);
CREATE INDEX idx_machines_facility ON ice_machines(facility_id);
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);

-- Ice Depth indexes
CREATE INDEX idx_ice_depth_facility ON ice_depth_measurements(facility_id);
CREATE INDEX idx_ice_depth_rink ON ice_depth_measurements(rink_id);
CREATE INDEX idx_ice_depth_template ON ice_depth_measurements(template_id);
CREATE INDEX idx_ice_depth_date ON ice_depth_measurements(measurement_date DESC);
CREATE INDEX idx_templates_facility ON ice_depth_templates(facility_id);

-- Scheduling indexes
CREATE INDEX idx_schedule_staff_facility ON schedule_staff(facility_id);
CREATE INDEX idx_schedule_shifts_facility ON schedule_shifts(facility_id);
CREATE INDEX idx_schedule_shifts_date ON schedule_shifts(shift_date);
CREATE INDEX idx_time_off_facility ON schedule_time_off(facility_id);
CREATE INDEX idx_time_off_staff ON schedule_time_off(staff_id);

-- Maintenance indexes
CREATE INDEX idx_maintenance_logs_facility ON ice_maintenance_logs(facility_id);
CREATE INDEX idx_maintenance_logs_type ON ice_maintenance_logs(maintenance_type);
CREATE INDEX idx_maintenance_logs_date ON ice_maintenance_logs(log_date DESC);
CREATE INDEX idx_circle_check_templates_facility ON circle_check_templates(facility_id);

-- Incident indexes
CREATE INDEX idx_incidents_facility ON incidents(facility_id);
CREATE INDEX idx_incidents_date ON incidents(incident_date DESC);
CREATE INDEX idx_incidents_number ON incidents(incident_number);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Auto-generate incident numbers
CREATE OR REPLACE FUNCTION generate_incident_number(facility_uuid UUID, inc_date DATE)
RETURNS TEXT AS $$
DECLARE
  date_str TEXT;
  sequence_num INTEGER;
BEGIN
  date_str := TO_CHAR(inc_date, 'YYYYMMDD');
  SELECT COALESCE(MAX(CAST(SUBSTRING(incident_number FROM 17) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM incidents
  WHERE facility_id = facility_uuid AND incident_date = inc_date;
  RETURN 'INC-' || date_str || '-' || LPAD(sequence_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ice_depth_templates_updated_at BEFORE UPDATE ON ice_depth_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ice_depth_measurements_updated_at BEFORE UPDATE ON ice_depth_measurements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE rinks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ice_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE ice_depth_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ice_depth_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_check_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ice_maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for facilities
CREATE POLICY "Users can view their own facility"
  ON facilities FOR SELECT
  USING (
    id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their facility"
  ON profiles FOR SELECT
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for facility-scoped data (generic pattern)
CREATE POLICY "Facility members can access ice depth templates"
  ON ice_depth_templates FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Facility members can access ice depth measurements"
  ON ice_depth_measurements FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Facility members can access schedule staff"
  ON schedule_staff FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Facility members can access schedule shifts"
  ON schedule_shifts FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Facility members can access time off requests"
  ON schedule_time_off FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Facility members can access maintenance logs"
  ON ice_maintenance_logs FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Facility members can access incidents"
  ON incidents FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- INITIAL DATA
-- =====================================================

COMMENT ON DATABASE postgres IS 'MFO - Max Facility Operations Database';
