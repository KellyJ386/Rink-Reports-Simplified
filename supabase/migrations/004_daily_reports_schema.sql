-- =====================================================
-- MODULE: DAILY REPORTS
-- =====================================================

-- Daily report tabs configuration
-- Each facility can configure up to 15 custom tabs
CREATE TABLE daily_report_tabs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  tab_name TEXT NOT NULL,
  tab_order INTEGER NOT NULL DEFAULT 0,
  form_schema JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_tab_name_per_facility UNIQUE (facility_id, tab_name)
);

-- Daily report submissions
-- Stores submitted reports from each tab
CREATE TABLE daily_report_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  tab_id UUID NOT NULL REFERENCES daily_report_tabs(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  submitted_by UUID NOT NULL REFERENCES profiles(id),
  form_data JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_daily_report_tabs_facility ON daily_report_tabs(facility_id, is_active);
CREATE INDEX idx_daily_report_tabs_order ON daily_report_tabs(facility_id, tab_order);
CREATE INDEX idx_daily_report_submissions_facility_date ON daily_report_submissions(facility_id, report_date DESC);
CREATE INDEX idx_daily_report_submissions_tab ON daily_report_submissions(tab_id, report_date DESC);

-- RLS Policies for daily_report_tabs
ALTER TABLE daily_report_tabs ENABLE ROW LEVEL SECURITY;

CREATE POLICY daily_report_tabs_select ON daily_report_tabs
  FOR SELECT USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY daily_report_tabs_insert ON daily_report_tabs
  FOR INSERT WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY daily_report_tabs_update ON daily_report_tabs
  FOR UPDATE USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY daily_report_tabs_delete ON daily_report_tabs
  FOR DELETE USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for daily_report_submissions
ALTER TABLE daily_report_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY daily_report_submissions_select ON daily_report_submissions
  FOR SELECT USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY daily_report_submissions_insert ON daily_report_submissions
  FOR INSERT WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY daily_report_submissions_update ON daily_report_submissions
  FOR UPDATE USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY daily_report_submissions_delete ON daily_report_submissions
  FOR DELETE USING (
    facility_id IN (
      SELECT facility_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Comments
COMMENT ON TABLE daily_report_tabs IS 'Configuration for custom daily report tabs - up to 15 per facility';
COMMENT ON TABLE daily_report_submissions IS 'Submitted daily reports with form data';
COMMENT ON COLUMN daily_report_tabs.form_schema IS 'JSON schema defining form fields (type, label, required, options, etc.)';
COMMENT ON COLUMN daily_report_submissions.form_data IS 'User-submitted form data matching the tab form schema';
