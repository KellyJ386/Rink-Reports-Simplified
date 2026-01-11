# Login & Authentication Security Recommendations

## Current State Analysis

Your Max Facility Rink Reports app currently has:

✅ **Implemented:**
- Supabase Authentication (email/password)
- Basic login page
- Route protection (authenticated/unauthenticated)
- Session management via Supabase Auth
- Secure password storage (handled by Supabase)

❌ **Missing Security Features:**
- Password strength requirements
- Rate limiting on login attempts
- Account lockout after failed attempts
- Email verification
- Password reset flow
- "Remember Me" functionality
- Session timeout warnings
- Two-factor authentication (2FA)
- Login attempt monitoring/logging
- CAPTCHA for bot prevention
- Password visibility toggle
- Security audit trail

---

## Recommended Security Enhancements

### 🔒 **TIER 1: Essential (Implement First)**

#### 1. Password Strength Requirements
**What:** Enforce minimum password complexity
**Why:** Prevents weak passwords that are easily guessed
**Implementation:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Real-time password strength indicator

**Effort:** Low (2-3 hours)

#### 2. Email Verification
**What:** Require users to verify email before login
**Why:** Prevents fake accounts, ensures valid contact
**Implementation:**
- Send verification email on signup
- Block login until email confirmed
- Resend verification option
- Supabase has built-in support

**Effort:** Low (2-3 hours)

#### 3. Password Reset Flow
**What:** Secure password recovery mechanism
**Why:** Users need safe way to regain access
**Implementation:**
- "Forgot Password" link on login
- Email with secure reset token
- Token expiration (1 hour)
- Force logout all sessions on reset
- Supabase provides this functionality

**Effort:** Low (3-4 hours)

#### 4. Rate Limiting
**What:** Limit login attempts from same IP/email
**Why:** Prevents brute force attacks
**Implementation:**
- Max 5 failed attempts per email in 15 minutes
- Temporary lockout (15-30 minutes)
- CAPTCHA after 3 failed attempts
- Can be done with Supabase Edge Functions or client-side tracking

**Effort:** Medium (4-6 hours)

---

### 🔐 **TIER 2: Important (Implement Soon)**

#### 5. Account Lockout
**What:** Temporarily lock account after repeated failures
**Why:** Protects against persistent attacks
**Implementation:**
- Lock after 10 failed attempts in 1 hour
- Admin unlock or time-based unlock (24 hours)
- Email notification to user
- Track in database (login_attempts table)

**Effort:** Medium (4-6 hours)

#### 6. Session Management
**What:** Automatic logout after inactivity
**Why:** Prevents unauthorized access on shared devices
**Implementation:**
- 30-minute idle timeout (configurable)
- Warning modal at 25 minutes
- "Stay logged in" option extends to 7 days
- Clear session on browser close (optional)

**Effort:** Medium (4-6 hours)

#### 7. Login Activity Logging
**What:** Track all login attempts and sessions
**Why:** Security auditing, suspicious activity detection
**Implementation:**
- Log successful/failed logins
- Track IP address, device, browser
- User dashboard to view recent activity
- Admin dashboard for monitoring
- Table: login_history

**Effort:** Medium (5-7 hours)

#### 8. Password Visibility Toggle
**What:** Show/hide password button
**Why:** Better UX, reduces typos
**Implementation:**
- Eye icon to toggle password visibility
- Accessibility improvements

**Effort:** Low (1 hour)

---

### 🛡️ **TIER 3: Advanced (Nice to Have)**

#### 9. Two-Factor Authentication (2FA)
**What:** Second verification step (SMS/Authenticator app)
**Why:** Adds extra layer of security
**Implementation:**
- Optional for users, mandatory for admins
- TOTP (Time-based One-Time Password)
- Backup codes for recovery
- Supabase supports TOTP

**Effort:** High (10-15 hours)

#### 10. CAPTCHA Integration
**What:** Prevent automated bot attacks
**Why:** Stops mass account creation, brute force
**Implementation:**
- reCAPTCHA v3 (invisible) or v2 (checkbox)
- Trigger after 3 failed login attempts
- Also on signup form

**Effort:** Medium (3-5 hours)

#### 11. Magic Link Login
**What:** Passwordless authentication via email
**Why:** More secure, better UX
**Implementation:**
- "Email me a login link" option
- Temporary token sent to email
- One-time use, expires in 10 minutes
- Supabase has built-in support

**Effort:** Low (2-3 hours)

#### 12. Device Trust / Remember This Device
**What:** Mark trusted devices, skip 2FA
**Why:** Balance security and convenience
**Implementation:**
- Store device fingerprint in browser
- Require 2FA only on new devices
- User can revoke trusted devices

**Effort:** High (8-12 hours)

---

## Implementation Priority

### Phase 1: Core Security (Week 1)
1. ✅ Password strength requirements
2. ✅ Email verification
3. ✅ Password reset flow
4. ✅ Password visibility toggle

**Total Effort:** 8-11 hours

### Phase 2: Attack Prevention (Week 2)
5. ✅ Rate limiting
6. ✅ Account lockout
7. ✅ Login activity logging

**Total Effort:** 13-19 hours

### Phase 3: Advanced Features (Week 3-4)
8. ✅ Session management & timeout
9. ✅ CAPTCHA integration
10. ✅ Two-factor authentication (2FA)

**Total Effort:** 20-30 hours

---

## Supabase Built-in Features

Supabase already provides many security features out-of-the-box:

✅ **Email Confirmation** - Enable in Supabase Dashboard → Authentication → Providers
✅ **Password Reset** - Built-in, just need UI
✅ **Magic Link** - Passwordless login
✅ **TOTP 2FA** - Built-in support
✅ **Session Management** - Configurable JWT expiry
✅ **Row Level Security (RLS)** - Already implemented for multi-tenant
✅ **Rate Limiting** - Can configure in Supabase Edge Functions

**What needs custom implementation:**
- UI components (login, signup, reset forms)
- Client-side validation
- Login attempt tracking
- Activity logging
- CAPTCHA integration

---

## Database Schema Additions

### New Tables Needed

#### `login_attempts`
```sql
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_login_attempts_email ON login_attempts(email, created_at);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, created_at);
```

#### `login_history`
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

CREATE INDEX idx_login_history_user ON login_history(user_id, created_at DESC);
```

#### `trusted_devices` (for 2FA skip)
```sql
CREATE TABLE trusted_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  UNIQUE(user_id, device_fingerprint)
);
```

---

## UI/UX Improvements

### Enhanced Login Page
- Password strength indicator (visual progress bar)
- "Show/Hide Password" toggle
- "Forgot Password?" link
- "Resend verification email" for unverified users
- Error messages with helpful guidance
- Loading states and animations
- Accessibility (ARIA labels, keyboard navigation)

### New Pages Needed
1. **Signup Page** - For new user registration
2. **Forgot Password Page** - Request reset link
3. **Reset Password Page** - Set new password with token
4. **Verify Email Page** - Confirm email address
5. **2FA Setup Page** - Configure authenticator app
6. **Security Settings Page** - Manage 2FA, trusted devices, view login history

---

## Configuration Options

### Environment Variables
```bash
# .env.local additions
VITE_ENABLE_EMAIL_VERIFICATION=true
VITE_ENABLE_2FA=true
VITE_SESSION_TIMEOUT_MINUTES=30
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_LOCKOUT_DURATION_MINUTES=15
VITE_PASSWORD_MIN_LENGTH=8
VITE_RECAPTCHA_SITE_KEY=your_key_here
```

### Supabase Dashboard Settings
1. **Authentication → Providers → Email**
   - Enable Email Confirmations: ✅
   - Email Confirmation Redirect URL: `http://localhost:5173/auth/callback`

2. **Authentication → Policies**
   - Minimum Password Length: 8

3. **Authentication → JWT Settings**
   - JWT Expiry: 3600 seconds (1 hour)
   - Refresh Token Rotation: ✅

---

## Security Best Practices

### Do's ✅
- Use HTTPS in production (always)
- Store sensitive data encrypted
- Validate all inputs (client AND server)
- Use prepared statements (Supabase does this)
- Implement CSRF protection
- Set secure HTTP headers
- Log security events
- Regular security audits
- Keep dependencies updated

### Don'ts ❌
- Never store passwords in plain text (Supabase handles this)
- Never expose API keys in client code
- Never trust client-side validation alone
- Never use predictable session IDs
- Never log sensitive data (passwords, tokens)
- Never ignore failed login attempts

---

## Testing Checklist

### Manual Tests
- [ ] Login with valid credentials
- [ ] Login with invalid email
- [ ] Login with wrong password
- [ ] Login with unverified email
- [ ] Request password reset
- [ ] Complete password reset flow
- [ ] Test rate limiting (5+ failed attempts)
- [ ] Test account lockout (10+ failed attempts)
- [ ] Test session timeout
- [ ] Test "Remember Me" functionality
- [ ] Test 2FA setup and login
- [ ] Test password strength validation
- [ ] Test on different browsers
- [ ] Test on mobile devices

### Security Tests
- [ ] SQL injection attempts
- [ ] XSS (Cross-Site Scripting) attempts
- [ ] CSRF token validation
- [ ] Session hijacking prevention
- [ ] Brute force protection
- [ ] Password reset token expiry

---

## Recommended Implementation Order

### Option A: Minimal Viable Security (MVP)
1. Password strength validation
2. Email verification
3. Password reset flow

**Time:** 1 week
**Best for:** Quick launch, low-risk environments

### Option B: Standard Security (Recommended)
1. All from Option A
2. Rate limiting
3. Account lockout
4. Login activity logging
5. Session timeout

**Time:** 2-3 weeks
**Best for:** Most production applications

### Option C: Enterprise Security (Maximum)
1. All from Option B
2. Two-factor authentication
3. CAPTCHA
4. Magic link login
5. Device trust
6. Security audit dashboard

**Time:** 4-6 weeks
**Best for:** High-security requirements, compliance needs

---

## Next Steps

Would you like me to:

1. **Implement Option A (MVP)** - Core security features (1 week)
2. **Implement Option B (Standard)** - Recommended for production (2-3 weeks)
3. **Implement Option C (Enterprise)** - Maximum security (4-6 weeks)
4. **Custom Selection** - Pick specific features you want

Or would you prefer I create a detailed implementation plan first to review?

---

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)
