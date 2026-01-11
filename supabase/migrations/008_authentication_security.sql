-- =====================================================
-- Migration 008: Authentication Security & Login Tracking
-- =====================================================
-- Description: Adds security tables for login attempt tracking,
--              login history, and account lockout functionality
-- Created: 2026-01-11

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: login_attempts
-- Purpose: Track all login attempts for rate limiting and security monitoring
-- =====================================================

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_login_attempts_email_created ON login_attempts(email, created_at DESC);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, created_at DESC);
CREATE INDEX idx_login_attempts_success ON login_attempts(email, success, created_at);

-- Add comment
COMMENT ON TABLE login_attempts IS 'Tracks all login attempts for security monitoring and rate limiting';

---

## 🗄️ **login_history** Table

Tracks successful login sessions for security auditing.

```sql
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id),
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  session_id TEXT,
  logout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_history_user ON login_history(user_id, created_at DESC);
CREATE INDEX idx_login_history_facility ON login_history(facility_id, created_at DESC);

-- RLS Policies: Users can only view their own login history
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own login history"
ON login_history FOR SELECT
USING (auth.uid() = user_id);
```

**Purpose:**
- Track successful logins
- Store session info (IP, device, user agent)
- View login history in security settings
- Track logout events

---

## Migration 008: Authentication Security Tables

**File:** `supabase/migrations/008_auth_security.sql`

### Tables Created

#### 1. `login_attempts`
Tracks all login attempts (success and failure) for rate limiting and security monitoring.

**Columns:**
- `id` - UUID primary key
- `email` - Email address attempting to login
- `ip_address` - IP address of attempt
- `user_agent` - Browser/device information
- `success` - Boolean (true/false)
- `failure_reason` - Error message if failed
- `created_at` - Timestamp

**Indexes:**
- `idx_login_attempts_email` - Fast lookup by email and time
- `idx_login_attempts_ip` - Track attempts by IP address

**RLS Policies:**
- Admin-only access for security monitoring

**Purpose:**
- Track all login attempts (success and failure)
- Enable rate limiting (check recent attempts)
- Detect brute force attacks
- Provide audit trail

---

### 2. `login_history` Table

**Purpose:** Track successful login sessions for security auditing

**Schema:**
```sql
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id),
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  session_id TEXT,
  logout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:**
- Track successful logins
- Display login history to users
- Detect suspicious activity
- Compliance/auditing

**Usage:**
- Create record on successful login
- Update logout_at when user signs out
- Display in user's security settings page

### Table: `password_reset_tokens`
```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Track password reset tokens
**Columns:**
- `token` - Secure random token (UUID)
- `expires_at` - 1 hour expiration
- `used_at` - Prevent token reuse

---

## Implementation Plan

### Phase 1: Database & Backend (Days 1-2)
- [ ] Run migration 008
- [ ] Configure Supabase email templates
- [ ] Enable email confirmation in Supabase dashboard
- [ ] Test database tables and RLS policies

### Phase 2: Password Components (Day 3)
- [ ] Create PasswordInput component (show/hide toggle)
- [ ] Create PasswordStrengthIndicator component
- [ ] Create password validation utilities

### Phase 3: Enhanced Login (Days 4-5)
- [ ] Update LoginPage with password visibility toggle
- [ ] Add rate limiting logic
- [ ] Add "Forgot Password" link
- [ ] Implement login attempt tracking
- [ ] Add helpful error messages

### Phase 4: Password Reset Flow (Day 6)
- [ ] Create ForgotPasswordPage
- [ ] Create ResetPasswordPage
- [ ] Update routing

### Phase 5: Session Management (Day 7-8)
- [ ] Implement session timeout modal
- [ ] Add activity tracking
- [ ] Create timeout warning dialog

### Phase 6: Testing & Documentation (Day 9-10)
- [ ] Test all security features
- [ ] Update documentation
- [ ] Create security configuration guide

---

Let me start building! 🚀

**Starting with Migration 008: Authentication Security Tables**

<function_calls>
<invoke name="Write">
<parameter name="content">-- Migration 008: Authentication Security Tables
-- Description: Add tables for login tracking, rate limiting, and security auditing
-- Author: Claude
-- Date: 2026-01-11

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: login_attempts
-- Purpose: Track all login attempts for rate limiting and security monitoring
-- =====================================================

CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  failure_reason TEXT,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_login_attempts_email_created ON login_attempts(email, created_at DESC);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, created_at);
CREATE INDEX idx_login_attempts_created ON login_attempts(created_at);

-- Enable RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (admins can view all, users can view their own)
CREATE POLICY "Users can view their own login attempts"
  ON login_attempts FOR SELECT
  USING (
    email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "System can insert login attempts"
ON login_attempts FOR INSERT
WITH CHECK (true);

-- Login History Table
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facilities(id),
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  session_id TEXT,
  logout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_history_user ON login_history(user_id, created_at DESC);
CREATE INDEX idx_login_history_session ON login_history(session_id);

-- RLS Policies for login_history
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own login history"
  ON login_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow insert for authenticated users"
  ON login_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to clean old login attempts (7 days)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(p_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_failed_attempts INTEGER;
  v_lockout_time TIMESTAMPTZ;
BEGIN
  -- Count failed attempts in last hour
  SELECT COUNT(*)
  INTO v_failed_attempts
  FROM login_attempts
  WHERE email = p_email
    AND success = false
    AND created_at > NOW() - INTERVAL '1 hour';

  -- Check if locked (10+ failed attempts)
  IF v_failed_attempts >= 10 THEN
    -- Get time of 10th failed attempt
    SELECT created_at INTO v_lockout_time
    FROM login_attempts
    WHERE email = p_email
      AND success = false
      AND created_at > NOW() - INTERVAL '1 hour'
    ORDER BY created_at DESC
    OFFSET 9
    LIMIT 1;

    -- Check if still in lockout period (24 hours)
    IF v_lockout_time > NOW() - INTERVAL '24 hours' THEN
      RETURN true;
    END IF;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check recent failed attempts for rate limiting
CREATE OR REPLACE FUNCTION get_recent_failed_attempts(p_email TEXT, p_minutes INTEGER DEFAULT 15)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM login_attempts
  WHERE email = p_email
    AND success = false
    AND created_at > NOW() - (p_minutes || ' minutes')::INTERVAL;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
