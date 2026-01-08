-- =====================================================
-- MODULE 7: AIR QUALITY LOG
-- Migration: 006_air_quality_schema.sql
-- Date: January 2026
-- Description: CO and NO2 monitoring with threshold alerts
-- =====================================================

-- Air quality logs table
CREATE TABLE air_quality_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  rink_id UUID REFERENCES rinks(id) ON DELETE SET NULL,
  log_date DATE NOT NULL,
  log_time TIME,

  -- Gas level readings
  co_level NUMERIC(6,2), -- Carbon Monoxide (ppm)
  co_status TEXT DEFAULT 'normal' CHECK (co_status IN ('normal', 'warning', 'danger')),
  no2_level NUMERIC(6,3), -- Nitrogen Dioxide (ppm)
  no2_status TEXT DEFAULT 'normal' CHECK (no2_status IN ('normal', 'warning', 'danger')),

  -- Environmental conditions
  temperature NUMERIC(5,2),
  humidity NUMERIC(5,2),
  ventilation_status TEXT DEFAULT 'normal' CHECK (ventilation_status IN ('normal', 'reduced', 'maintenance', 'offline')),

  -- Metadata
  notes TEXT,
  corrective_actions TEXT,
  has_alerts BOOLEAN DEFAULT false,
  recorded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Air quality thresholds table (facility-specific)
CREATE TABLE air_quality_thresholds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,

  -- CO thresholds (ppm)
  co_warning_threshold NUMERIC(6,2) DEFAULT 9,
  co_danger_threshold NUMERIC(6,2) DEFAULT 35,

  -- NO2 thresholds (ppm)
  no2_warning_threshold NUMERIC(6,3) DEFAULT 0.05,
  no2_danger_threshold NUMERIC(6,3) DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(facility_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_air_quality_logs_facility_date
  ON air_quality_logs(facility_id, log_date DESC);

CREATE INDEX idx_air_quality_logs_rink
  ON air_quality_logs(rink_id) WHERE rink_id IS NOT NULL;

CREATE INDEX idx_air_quality_logs_alerts
  ON air_quality_logs(facility_id, has_alerts) WHERE has_alerts = true;

CREATE INDEX idx_air_quality_logs_danger
  ON air_quality_logs(facility_id, co_status, no2_status)
  WHERE co_status = 'danger' OR no2_status = 'danger';

CREATE INDEX idx_air_quality_logs_recorded_by
  ON air_quality_logs(recorded_by);

CREATE INDEX idx_air_quality_thresholds_facility
  ON air_quality_thresholds(facility_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_air_quality_logs_updated_at
  BEFORE UPDATE ON air_quality_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_air_quality_thresholds_updated_at
  BEFORE UPDATE ON air_quality_thresholds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE air_quality_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE air_quality_thresholds ENABLE ROW LEVEL SECURITY;

-- Users can access air quality logs from their facility
CREATE POLICY "Facility members can access air quality logs"
  ON air_quality_logs FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can access threshold configs from their facility
CREATE POLICY "Facility members can access air quality thresholds"
  ON air_quality_thresholds FOR ALL
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

-- =====================================================
-- DEFAULT THRESHOLDS FUNCTION
-- =====================================================

-- Function to insert default thresholds when a new facility is created
CREATE OR REPLACE FUNCTION insert_default_air_quality_thresholds()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO air_quality_thresholds (facility_id)
  VALUES (NEW.id)
  ON CONFLICT (facility_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create default thresholds
CREATE TRIGGER create_default_air_quality_thresholds
  AFTER INSERT ON facilities
  FOR EACH ROW
  EXECUTE FUNCTION insert_default_air_quality_thresholds();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE air_quality_logs IS 'Air quality monitoring logs with CO and NO2 level tracking';
COMMENT ON TABLE air_quality_thresholds IS 'Facility-specific threshold configurations for air quality alerts';
COMMENT ON COLUMN air_quality_logs.co_level IS 'Carbon Monoxide level in parts per million (ppm)';
COMMENT ON COLUMN air_quality_logs.no2_level IS 'Nitrogen Dioxide level in parts per million (ppm)';
COMMENT ON COLUMN air_quality_logs.co_status IS 'CO status: normal (<9 ppm), warning (9-35 ppm), danger (>35 ppm) based on facility thresholds';
COMMENT ON COLUMN air_quality_logs.no2_status IS 'NO2 status: normal (<0.05 ppm), warning (0.05-1 ppm), danger (>1 ppm) based on facility thresholds';
COMMENT ON COLUMN air_quality_thresholds.co_warning_threshold IS 'Default: 9 ppm (OSHA 8-hour TWA: 50 ppm, but we use stricter defaults)';
COMMENT ON COLUMN air_quality_thresholds.co_danger_threshold IS 'Default: 35 ppm (OSHA 8-hour TWA: 50 ppm)';
COMMENT ON COLUMN air_quality_thresholds.no2_warning_threshold IS 'Default: 0.05 ppm';
COMMENT ON COLUMN air_quality_thresholds.no2_danger_threshold IS 'Default: 1 ppm (OSHA ceiling limit: 5 ppm, but we use stricter defaults)';
