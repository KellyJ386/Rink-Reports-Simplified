-- Add fuel_type to ice_machines table for circle check differentiation
ALTER TABLE ice_machines
ADD COLUMN fuel_type TEXT CHECK (fuel_type IN ('gas', 'electric', 'propane', 'diesel'));

-- Add machine_type and checklist_items columns to ice_maintenance_logs for circle check support
ALTER TABLE ice_maintenance_logs
ADD COLUMN machine_type TEXT CHECK (machine_type IN ('gas', 'electric')),
ADD COLUMN checklist_items JSONB;

-- Add comment explaining the fields
COMMENT ON COLUMN ice_machines.fuel_type IS 'Type of fuel used by the machine (gas, electric, propane, diesel) - used for circle check checklists';
COMMENT ON COLUMN ice_maintenance_logs.machine_type IS 'Machine fuel type (gas/electric) - determines which circle check checklist to use';
COMMENT ON COLUMN ice_maintenance_logs.checklist_items IS 'Circle check inspection items as key-value pairs (item_id: boolean)';
