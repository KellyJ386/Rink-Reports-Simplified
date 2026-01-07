-- Update ice_depth_measurements to add statistics field
ALTER TABLE ice_depth_measurements
ADD COLUMN statistics JSONB,
ADD COLUMN template_type TEXT;

-- Add comment
COMMENT ON COLUMN ice_depth_measurements.statistics IS 'Calculated statistics: { min, max, avg, stdDev }';
COMMENT ON COLUMN ice_depth_measurements.template_type IS 'Template type: 24-point, 35-point, 47-point, custom';
