-- =====================================================
-- ENHANCED CIRCLE CHECK SYSTEM
-- Migration: 007_enhanced_circle_check.sql
-- Date: January 2026
-- Description: Machine-specific circle check with admin configuration
-- =====================================================

-- Drop existing basic circle_check_templates if it exists
DROP TABLE IF EXISTS circle_check_templates CASCADE;

-- Circle check templates (machine-type specific)
CREATE TABLE circle_check_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  machine_type TEXT NOT NULL CHECK (machine_type IN ('electric', 'gas', 'custom')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(facility_id, template_name)
);

-- Circle check items (individual checklist items)
CREATE TABLE circle_check_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES circle_check_templates(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  item_order INTEGER NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  is_mandatory BOOLEAN DEFAULT false,
  category TEXT, -- 'electrical', 'mechanical', 'hydraulic', 'safety', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circle check logs (completed inspections)
CREATE TABLE circle_check_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  machine_id UUID NOT NULL REFERENCES ice_machines(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES circle_check_templates(id),
  log_date DATE NOT NULL,
  log_time TIME NOT NULL,
  operator_id UUID NOT NULL REFERENCES auth.users(id),

  -- Overall results
  total_items INTEGER NOT NULL,
  passed_items INTEGER NOT NULL,
  failed_items INTEGER NOT NULL,
  overall_status TEXT NOT NULL CHECK (overall_status IN ('pass', 'fail')) DEFAULT 'pass',

  -- Notes
  general_notes TEXT,
  manager_notified BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circle check results (per-item results)
CREATE TABLE circle_check_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id UUID NOT NULL REFERENCES circle_check_logs(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES circle_check_items(id),
  item_text TEXT NOT NULL, -- Denormalized for historical record
  status TEXT NOT NULL CHECK (status IN ('pass', 'fail', 'n/a')) DEFAULT 'pass',
  notes TEXT,
  photo_url TEXT, -- Supabase Storage URL
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_circle_check_templates_facility
  ON circle_check_templates(facility_id, is_active) WHERE is_active = true;

CREATE INDEX idx_circle_check_items_template
  ON circle_check_items(template_id, item_order) WHERE is_enabled = true;

CREATE INDEX idx_circle_check_logs_facility_date
  ON circle_check_logs(facility_id, log_date DESC);

CREATE INDEX idx_circle_check_logs_machine
  ON circle_check_logs(machine_id, log_date DESC);

CREATE INDEX idx_circle_check_logs_failed
  ON circle_check_logs(facility_id, overall_status) WHERE overall_status = 'fail';

CREATE INDEX idx_circle_check_results_log
  ON circle_check_results(log_id);

CREATE INDEX idx_circle_check_results_failed
  ON circle_check_results(log_id, status) WHERE status = 'fail';

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_circle_check_templates_updated_at
  BEFORE UPDATE ON circle_check_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_circle_check_items_updated_at
  BEFORE UPDATE ON circle_check_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_circle_check_logs_updated_at
  BEFORE UPDATE ON circle_check_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE circle_check_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_check_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_check_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_check_results ENABLE ROW LEVEL SECURITY;

-- Templates
CREATE POLICY "Facility members can access circle check templates"
  ON circle_check_templates FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Items (access through template's facility)
CREATE POLICY "Facility members can access circle check items"
  ON circle_check_items FOR ALL
  USING (
    template_id IN (
      SELECT id FROM circle_check_templates
      WHERE facility_id IN (
        SELECT facility_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Logs
CREATE POLICY "Facility members can access circle check logs"
  ON circle_check_logs FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Results (access through log's facility)
CREATE POLICY "Facility members can access circle check results"
  ON circle_check_results FOR ALL
  USING (
    log_id IN (
      SELECT id FROM circle_check_logs
      WHERE facility_id IN (
        SELECT facility_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- DEFAULT TEMPLATES
-- =====================================================

-- Function to create default templates for a facility
CREATE OR REPLACE FUNCTION create_default_circle_check_templates(p_facility_id UUID)
RETURNS VOID AS $$
DECLARE
  v_electric_template_id UUID;
  v_gas_template_id UUID;
BEGIN
  -- Create Electric Zamboni template
  INSERT INTO circle_check_templates (facility_id, template_name, machine_type, description)
  VALUES (p_facility_id, 'Electric Zamboni Standard', 'electric', 'Standard 41-point circle check for electric Zamboni machines')
  RETURNING id INTO v_electric_template_id;

  -- Insert all 41 electric check items
  INSERT INTO circle_check_items (template_id, item_text, item_order, category) VALUES
    (v_electric_template_id, 'Head Lights/Tail Light', 1, 'electrical'),
    (v_electric_template_id, 'Hour Meter Reading', 2, 'mechanical'),
    (v_electric_template_id, 'Battery Gauge', 3, 'electrical'),
    (v_electric_template_id, 'Key out of Ignition and Secure in your Possession', 4, 'safety'),
    (v_electric_template_id, 'Steering Wheel/Horn', 5, 'mechanical'),
    (v_electric_template_id, 'Control Levers', 6, 'mechanical'),
    (v_electric_template_id, 'Seat/Armrest', 7, 'safety'),
    (v_electric_template_id, 'Foot and Brake Pedal', 8, 'mechanical'),
    (v_electric_template_id, 'Wash Water Fill', 9, 'mechanical'),
    (v_electric_template_id, 'Ice Making Water', 10, 'mechanical'),
    (v_electric_template_id, 'Wash Water Valves', 11, 'mechanical'),
    (v_electric_template_id, 'Poly Water Tank Inspection', 12, 'mechanical'),
    (v_electric_template_id, 'Blade Adjustment Wheel', 13, 'mechanical'),
    (v_electric_template_id, 'Lift Conditioner to Observe Blade and Runner Condition', 14, 'mechanical'),
    (v_electric_template_id, 'Flood Pipe Condition', 15, 'mechanical'),
    (v_electric_template_id, 'Towel and Squeegee Condition', 16, 'mechanical'),
    (v_electric_template_id, 'Conditioner/Lift Arm/Bushings', 17, 'mechanical'),
    (v_electric_template_id, 'Blade Bar', 18, 'mechanical'),
    (v_electric_template_id, 'Snow Breaker Condition', 19, 'mechanical'),
    (v_electric_template_id, 'Snow Tank Inspection', 20, 'mechanical'),
    (v_electric_template_id, 'Tank Up and Snow Tank Safety Stand in Place', 21, 'safety'),
    (v_electric_template_id, 'Snow Tank Seal', 22, 'mechanical'),
    (v_electric_template_id, 'Vertical Auger Movement and Check Guard', 23, 'mechanical'),
    (v_electric_template_id, 'Horizontal Auger Movement', 24, 'mechanical'),
    (v_electric_template_id, 'Tires (Condition and Pressure)/Hubs/Studs/Nuts', 25, 'mechanical'),
    (v_electric_template_id, 'Board Brush Condition/Arm Bushing', 26, 'mechanical'),
    (v_electric_template_id, 'Guide Wheel Condition', 27, 'mechanical'),
    (v_electric_template_id, 'U-Joints', 28, 'mechanical'),
    (v_electric_template_id, 'Hydraulic Hoses + Couplers (Multiple Locations)', 29, 'hydraulic'),
    (v_electric_template_id, 'Leaf Springs', 30, 'mechanical'),
    (v_electric_template_id, 'Conveyor Drive Belt and Chain', 31, 'mechanical'),
    (v_electric_template_id, 'Wash Water Pump', 32, 'mechanical'),
    (v_electric_template_id, 'Auger Flighting', 33, 'mechanical'),
    (v_electric_template_id, 'Conditioner Leaf Springs', 34, 'mechanical'),
    (v_electric_template_id, 'Brake Lines', 35, 'mechanical'),
    (v_electric_template_id, 'Hydraulic Oil Level', 36, 'hydraulic'),
    (v_electric_template_id, 'Brake Fluid', 37, 'mechanical'),
    (v_electric_template_id, 'Battery + Cables', 38, 'electrical'),
    (v_electric_template_id, 'Safety Guards including Conditioner Guards', 39, 'safety'),
    (v_electric_template_id, 'Step Areas Clean and Clear', 40, 'safety'),
    (v_electric_template_id, 'Inspect Body Condition and Safety Labels', 41, 'safety');

  -- Create Gas Zamboni template
  INSERT INTO circle_check_templates (facility_id, template_name, machine_type, description)
  VALUES (p_facility_id, 'Gas Zamboni Standard', 'gas', 'Standard 51-point circle check for gas Zamboni machines')
  RETURNING id INTO v_gas_template_id;

  -- Insert all 51 gas check items
  INSERT INTO circle_check_items (template_id, item_text, item_order, category) VALUES
    (v_gas_template_id, 'Tank Up and Snow Tank Safety Stand in Place', 1, 'safety'),
    (v_gas_template_id, 'Key out of Ignition and Secure in your Possession', 2, 'safety'),
    (v_gas_template_id, 'Exhaust System Condition', 3, 'mechanical'),
    (v_gas_template_id, 'Fuel Line Condition', 4, 'mechanical'),
    (v_gas_template_id, 'Fuel levels and Connections/Hoses/Tanks Secure', 5, 'mechanical'),
    (v_gas_template_id, 'Belts', 6, 'mechanical'),
    (v_gas_template_id, 'Air Filter', 7, 'mechanical'),
    (v_gas_template_id, 'Spark Plugs', 8, 'mechanical'),
    (v_gas_template_id, 'Radiator and Radiator Hoses', 9, 'mechanical'),
    (v_gas_template_id, 'Fluid Levels', 10, 'mechanical'),
    (v_gas_template_id, 'Hydraulic Oil Level', 11, 'hydraulic'),
    (v_gas_template_id, 'Hydraulic Oil Filter', 12, 'hydraulic'),
    (v_gas_template_id, 'Snow Tank Seal', 13, 'mechanical'),
    (v_gas_template_id, 'Vertical Auger Movement and Check Guard', 14, 'mechanical'),
    (v_gas_template_id, 'Snow Breaker Condition', 15, 'mechanical'),
    (v_gas_template_id, 'Snow Tank Inspection', 16, 'mechanical'),
    (v_gas_template_id, 'Hydraulic Hoses and Couplers', 17, 'hydraulic'),
    (v_gas_template_id, 'Hydraulic Bypass Open or Closed', 18, 'hydraulic'),
    (v_gas_template_id, 'Hydraulic Oil Filter', 19, 'hydraulic'),
    (v_gas_template_id, 'Leaf Springs', 20, 'mechanical'),
    (v_gas_template_id, 'Battery and Cables', 21, 'electrical'),
    (v_gas_template_id, 'Head Lights/Tail Light', 22, 'electrical'),
    (v_gas_template_id, 'Hour Meter Reading', 23, 'mechanical'),
    (v_gas_template_id, 'Voltmeter', 24, 'electrical'),
    (v_gas_template_id, 'Lift Conditioner to Observe Blade and Runner Condition', 25, 'mechanical'),
    (v_gas_template_id, 'Conditioner/Lift Arm/Bushings', 26, 'mechanical'),
    (v_gas_template_id, 'Blade Adjustment Wheel', 27, 'mechanical'),
    (v_gas_template_id, 'Towel and Squeegee Condition', 28, 'mechanical'),
    (v_gas_template_id, 'Flood Pipe Condition', 29, 'mechanical'),
    (v_gas_template_id, 'Blade Bar', 30, 'mechanical'),
    (v_gas_template_id, 'Conditioner Leaf Springs', 31, 'mechanical'),
    (v_gas_template_id, 'Water Fill', 32, 'mechanical'),
    (v_gas_template_id, 'Poly Water Tank Inspection', 33, 'mechanical'),
    (v_gas_template_id, 'Ice Making Water and Wash Water Valves', 34, 'mechanical'),
    (v_gas_template_id, 'Wash Water Pump', 35, 'mechanical'),
    (v_gas_template_id, 'Brake Lines', 36, 'mechanical'),
    (v_gas_template_id, 'U joints', 37, 'mechanical'),
    (v_gas_template_id, 'Tires (Condition and Pressure)/Hubs/Studs/Nuts', 38, 'mechanical'),
    (v_gas_template_id, 'Board Brush Condition/Arm Bushing', 39, 'mechanical'),
    (v_gas_template_id, 'Guide Wheel Condition', 40, 'mechanical'),
    (v_gas_template_id, 'Conveyor Drive Belt and Chain', 41, 'mechanical'),
    (v_gas_template_id, 'Auger Flighting', 42, 'mechanical'),
    (v_gas_template_id, 'Inspect Body Condition and Safety Labels', 43, 'safety'),
    (v_gas_template_id, 'Gauges/Steering Wheel/Horn', 44, 'mechanical'),
    (v_gas_template_id, 'Temperature', 45, 'mechanical'),
    (v_gas_template_id, 'Tachometer', 46, 'mechanical'),
    (v_gas_template_id, 'Seat/Armrest', 47, 'safety'),
    (v_gas_template_id, 'Brake and Brake Pedal', 48, 'mechanical'),
    (v_gas_template_id, 'Step Areas Clean and Clear', 49, 'safety'),
    (v_gas_template_id, 'Control Levers', 50, 'mechanical'),
    (v_gas_template_id, 'Horizontal Auger Movement and Condition of Bearings', 51, 'mechanical');

END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STORAGE BUCKET FOR PHOTOS
-- =====================================================

-- Note: Run this in Supabase Storage UI or via API:
-- Create a storage bucket called 'circle-check-photos'
-- Set it to private with RLS policies

-- Storage RLS policy (to be applied in Supabase Storage):
-- Users can upload photos for their facility's circle checks
-- Access pattern: circle-check-photos/{facility_id}/{log_id}/{photo_id}.jpg

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE circle_check_templates IS 'Machine-specific circle check templates (Electric, Gas, Custom)';
COMMENT ON TABLE circle_check_items IS 'Individual check items within a template (can be toggled on/off)';
COMMENT ON TABLE circle_check_logs IS 'Completed circle check inspections with overall pass/fail status';
COMMENT ON TABLE circle_check_results IS 'Per-item results for each circle check log with optional photos';

COMMENT ON COLUMN circle_check_items.is_enabled IS 'Admin can toggle items on/off - disabled items not shown to operators';
COMMENT ON COLUMN circle_check_items.is_mandatory IS 'If true, operators must complete this item';
COMMENT ON COLUMN circle_check_results.photo_url IS 'Supabase Storage URL: circle-check-photos/{facility_id}/{log_id}/{photo_id}.jpg';
