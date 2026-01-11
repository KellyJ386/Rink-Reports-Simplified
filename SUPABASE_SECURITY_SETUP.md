# Supabase Security Configuration Guide

Quick guide to configure Supabase for the new security features.

---

## Step 1: Run Security Migration

1. Open Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click **SQL Editor** in sidebar
4. Click **New Query**
5. Copy entire contents of `supabase/migrations/008_authentication_security.sql`
6. Paste into SQL Editor
7. Click **Run**
8. Verify success message

**What this creates:**
- `login_attempts` table - Tracks all login attempts
- `login_history` table - Tracks successful logins
- `is_account_locked()` function - Checks account lockout
- `get_recent_failed_attempts()` function - Returns attempt count
- `cleanup_old_login_attempts()` function - Cleanup utility
- RLS policies for security

---

## Step 2: Configure Email Provider

### Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled (should be by default)
3. Click **Email** provider

### Configure Password Reset

4. Under **Reset Password Email**:
   - Redirect URL: `http://localhost:5173/reset-password`
   - For production: `https://yourdomain.com/reset-password`
5. Click **Save**

### Optional: Enable Email Confirmation

6. Toggle **Enable Email Confirmations** (if you want)
7. Set Confirm Email Redirect URL: `http://localhost:5173/login`
8. Click **Save**

---

## Step 3: Customize Email Templates (Optional)

### Password Reset Email

1. Go to **Authentication** → **Email Templates**
2. Click **Reset Password** template
3. Customize subject and body (optional)
4. Keep variables: `{{ .ConfirmationURL }}`
5. Click **Save**

### Example Custom Template:
```html
<h2>Reset Your Password</h2>
<p>You requested a password reset for your Max Facility Rink Reports account.</p>
<p>Click the link below to set a new password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset My Password</a></p>
<p>This link expires in 1 hour.</p>
<p>If you didn't request this, you can ignore this email.</p>
```

---

## Step 4: Configure JWT Settings (Optional)

### Adjust Session Duration

1. Go to **Authentication** → **Settings**
2. Find **JWT Settings**
3. Configure:
   - **JWT Expiry**: 3600 (1 hour) - How long access token lasts
   - **Refresh Token Rotation**: Enable - More secure
   - **Refresh Token Reuse Interval**: 10 seconds
4. Click **Save**

**Note:** Session Timeout (30 min inactivity) is separate from JWT expiry and handled client-side.

---

## Step 5: Set Up SMTP (For Production)

For reliable email delivery in production:

### Option A: Use Supabase's Built-in Email (Default)
- Good for development/testing
- Limited to 3 emails per hour per user
- No configuration needed

### Option B: Custom SMTP (Recommended for Production)

1. Go to **Authentication** → **Settings**
2. Scroll to **SMTP Settings**
3. Click **Enable Custom SMTP**
4. Enter your SMTP details:
   - Host: (e.g., smtp.sendgrid.net)
   - Port: 587
   - Username: (SMTP username)
   - Password: (SMTP password)
   - Sender Email: noreply@yourdomain.com
   - Sender Name: Max Facility Rink Reports
5. Click **Save**

**Popular SMTP Providers:**
- SendGrid (free tier: 100 emails/day)
- Mailgun (free tier: 5,000 emails/month)
- Amazon SES (very cheap)
- Postmark

---

## Step 6: Configure Security Policies

### Password Policy

1. Go to **Authentication** → **Policies**
2. Configure password requirements:
   - **Minimum Password Length**: 8
   - (Client-side validation handles complexity)

### Rate Limiting (Optional)

Supabase has built-in rate limiting, but you can adjust:

1. Go to **Settings** → **API**
2. Review rate limits
3. Adjust if needed (default is usually fine)

---

## Step 7: Test Security Features

### Test Password Reset Flow

1. Go to your app login page
2. Click "Forgot Password?"
3. Enter your email
4. Check inbox for reset email
5. Click link in email
6. Set new password
7. Verify redirect to login

### Test Login Security

1. Try logging in with wrong password 3 times
2. Verify error message shows remaining attempts
3. Try 5 failed logins
4. Verify rate limiting kicks in

### Test Session Timeout

1. Login to your app
2. Wait 25 minutes (or reduce timeout in code for testing)
3. Verify warning dialog appears
4. Click "Stay Logged In"
5. Verify timer resets

---

## Step 8: Monitor Security

### View Authentication Logs

1. Go to **Logs** → **Auth Logs**
2. Filter by:
   - Failed logins
   - Password resets
   - Time range
3. Monitor for suspicious activity

### Query Login Attempts

Run this in SQL Editor to view recent login attempts:

```sql
-- Recent failed login attempts
SELECT
  email,
  failure_reason,
  ip_address,
  created_at
FROM login_attempts
WHERE success = false
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 50;
```

```sql
-- Accounts with multiple failed attempts
SELECT
  email,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt
FROM login_attempts
WHERE success = false
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY email
HAVING COUNT(*) >= 5
ORDER BY failed_attempts DESC;
```

```sql
-- Check if specific account is locked
SELECT is_account_locked('user@example.com');
```

---

## Step 9: Production Checklist

Before deploying to production:

### Security
- [ ] Run migration 008 in production database
- [ ] Configure custom SMTP provider
- [ ] Update redirect URLs to production domain
- [ ] Enable HTTPS (required for security)
- [ ] Test password reset flow in production
- [ ] Test rate limiting
- [ ] Set up monitoring/alerting

### Email Templates
- [ ] Customize password reset email
- [ ] Add company branding
- [ ] Test email delivery
- [ ] Check spam folder
- [ ] Verify all links work

### Configuration
- [ ] Update `.env` with production Supabase URL
- [ ] Update `.env` with production anon key
- [ ] Set proper CORS origins in Supabase
- [ ] Configure RLS policies
- [ ] Test authentication flow end-to-end

---

## Troubleshooting

### Emails not sending

**Check:**
1. SMTP settings are correct
2. Sender email is verified (some providers require this)
3. Check Supabase logs for email errors
4. Verify email isn't in spam folder
5. Check rate limits (3 emails/hour for built-in)

**Solution:**
- Use custom SMTP provider for production
- Verify sender domain
- Check SPF/DKIM records

### Password reset link not working

**Check:**
1. Redirect URL is correct in Supabase settings
2. Link hasn't expired (1 hour)
3. User clicked correct link (not forwarded email)
4. Check browser console for errors

**Solution:**
- Update redirect URL in Supabase
- Re-request password reset
- Clear browser cache

### Rate limiting not working

**Check:**
1. Migration 008 ran successfully
2. `get_recent_failed_attempts` function exists
3. Login attempts are being tracked in database
4. Check browser console for errors

**Solution:**
```sql
-- Verify function exists
SELECT * FROM pg_proc WHERE proname = 'get_recent_failed_attempts';

-- Test function directly
SELECT get_recent_failed_attempts('test@example.com', 15);

-- Check login attempts table
SELECT * FROM login_attempts
ORDER BY created_at DESC
LIMIT 10;
```

### Account locked and can't unlock

**Manual unlock (run in SQL Editor):**
```sql
-- Delete failed attempts for user
DELETE FROM login_attempts
WHERE email = 'user@example.com'
  AND success = false;

-- Verify unlock
SELECT is_account_locked('user@example.com');
```

---

## Maintenance Scripts

### Clean up old login attempts (run monthly)

```sql
SELECT cleanup_old_login_attempts();
```

### View security summary

```sql
-- Login attempts in last 24 hours
SELECT
  COUNT(*) FILTER (WHERE success = true) as successful_logins,
  COUNT(*) FILTER (WHERE success = false) as failed_logins,
  COUNT(DISTINCT email) as unique_users
FROM login_attempts
WHERE created_at > NOW() - INTERVAL '24 hours';
```

### Find suspicious activity

```sql
-- Multiple failed attempts from same IP
SELECT
  ip_address,
  COUNT(*) as attempts,
  array_agg(DISTINCT email) as emails_tried
FROM login_attempts
WHERE success = false
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY ip_address
HAVING COUNT(*) >= 10
ORDER BY attempts DESC;
```

---

## Support

If you encounter issues:

1. Check this guide first
2. Check Supabase logs
3. Review SECURITY_IMPLEMENTATION.md
4. Check browser console
5. Contact: support@maxfacility.com

---

**Last Updated:** 2026-01-11
**Version:** 1.0
