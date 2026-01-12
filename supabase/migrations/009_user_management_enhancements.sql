-- =====================================================
-- Migration 009: User Management Enhancements
-- =====================================================
-- Description: Adds user invitation system and improves admin capabilities
-- Author: Claude
-- Date: 2026-01-11

-- =====================================================
-- TABLE: user_invitations
-- Purpose: Track user invitation emails
-- =====================================================

CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'staff')),
  invited_by UUID REFERENCES profiles(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for looking up by email and token
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_token ON user_invitations(token);
CREATE INDEX idx_user_invitations_facility ON user_invitations(facility_id);

-- Enable RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only facility admins can view and create invitations
CREATE POLICY "Facility admins can view invitations"
  ON user_invitations FOR SELECT
  USING (
    facility_id IN (
      SELECT facility_id FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Facility admins can create invitations"
  ON user_invitations FOR INSERT
  WITH CHECK (
    facility_id IN (
      SELECT facility_id FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- TABLE: role_history
-- Purpose: Track role changes for audit trail
-- =====================================================

CREATE TABLE IF NOT EXISTS role_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  old_role TEXT,
  new_role TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for looking up user's role history
CREATE INDEX idx_role_history_user ON role_history(user_id, created_at DESC);
CREATE INDEX idx_role_history_changed_by ON role_history(changed_by);

-- Enable RLS
ALTER TABLE role_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Admins can view, only system can insert (via trigger)
CREATE POLICY "Admins can view role history"
  ON role_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- TRIGGER: Log role changes
-- =====================================================

CREATE OR REPLACE FUNCTION log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if role actually changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO role_history (user_id, old_role, new_role, changed_by)
    VALUES (NEW.id, OLD.role, NEW.role, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_role_changes
  AFTER UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_role_change();

-- =====================================================
-- FUNCTION: Clean up expired invitations
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  DELETE FROM user_invitations
  WHERE expires_at < NOW()
    AND accepted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADD EMAIL TO PROFILES (if not exists)
-- =====================================================

-- Add email column to profiles for easier queries
-- Note: Email is stored in auth.users, but duplicating helps with queries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email TEXT;
    CREATE INDEX idx_profiles_email ON profiles(email);
  END IF;
END $$;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE user_invitations IS 'Tracks email invitations for new users to join facility';
COMMENT ON TABLE role_history IS 'Audit trail for role changes';
COMMENT ON FUNCTION cleanup_expired_invitations() IS 'Removes expired unaccepted invitations (run periodically)';
COMMENT ON FUNCTION log_role_change() IS 'Automatically logs all role changes to role_history table';
