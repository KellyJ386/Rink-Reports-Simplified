-- =====================================================
-- MODULE 6: REFRIGERATION LOG
-- Migration: 005_refrigeration_schema.sql
-- Date: January 2026
-- Description: Refrigeration system monitoring with custom fields
-- =====================================================

-- Refrigeration logs table
CREATE TABLE refrigeration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID REFERENCES rinks(id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  log_time TIME,

  -- Standard refrigeration fields
  refrigerant_type TEXT,
  supply_temp NUMERIC(5,2),
  return_temp NUMERIC(5,2),
  ambient_temp NUMERIC(5,2),
  high_pressure NUMERIC(6,2),
  low_pressure NUMERIC(6,2),
  compressor_status TEXT DEFAULT 'running' CHECK (compressor_status IN ('running', 'idle', 'maintenance', 'offline')),

  -- Custom fields (facility-specific measurements)
  custom_fields JSONB,

  -- Metadata
  notes TEXT,
  has_alerts BOOLEAN DEFAULT false,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refrigeration field configurations (for custom fields)
CREATE TABLE refrigeration_field_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('number', 'text', 'select')),
  unit TEXT,
  min_threshold NUMERIC,
  max_threshold NUMERIC,
  options JSONB, -- Array of options for select type: ["Option 1", "Option 2"]
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(facility_id, field_name)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_refrigeration_logs_facility_date
  ON refrigeration_logs(facility_id, log_date DESC);

CREATE INDEX idx_refrigeration_logs_rink
  ON refrigeration_logs(rink_id) WHERE rink_id IS NOT NULL;

CREATE INDEX idx_refrigeration_logs_alerts
  ON refrigeration_logs(facility_id, has_alerts) WHERE has_alerts = true;

CREATE INDEX idx_refrigeration_logs_recorded_by
  ON refrigeration_logs(recorded_by);

CREATE INDEX idx_refrigeration_field_configs_facility
  ON refrigeration_field_configs(facility_id, display_order);

CREATE INDEX idx_refrigeration_field_configs_active
  ON refrigeration_field_configs(facility_id, is_active) WHERE is_active = true;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_refrigeration_logs_updated_at
  BEFORE UPDATE ON refrigeration_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refrigeration_field_configs_updated_at
  BEFORE UPDATE ON refrigeration_field_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE refrigeration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE refrigeration_field_configs ENABLE ROW LEVEL SECURITY;

-- Users can access refrigeration logs from their facility
CREATE POLICY "Facility members can access refrigeration logs"
  ON refrigeration_logs FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can access field configs from their facility
CREATE POLICY "Facility members can access refrigeration field configs"
  ON refrigeration_field_configs FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE refrigeration_logs IS 'Refrigeration system monitoring logs with temperature, pressure, and custom field tracking';
COMMENT ON TABLE refrigeration_field_configs IS 'Facility-specific custom field definitions for refrigeration monitoring';
COMMENT ON COLUMN refrigeration_logs.custom_fields IS 'JSONB object storing custom field values: {field_name: value}';
COMMENT ON COLUMN refrigeration_field_configs.options IS 'JSONB array of options for select fields: ["Option 1", "Option 2"]';
