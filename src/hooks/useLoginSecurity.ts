import { supabase } from '@/lib/supabase'

export interface LoginAttempt {
  email: string
  ipAddress?: string
  userAgent?: string
  success: boolean
  failureReason?: string
}

export function useLoginSecurity() {
  // Track login attempt in database
  const trackLoginAttempt = async (attempt: LoginAttempt) => {
    try {
      const { error } = await supabase.from('login_attempts').insert({
        email: attempt.email,
        ip_address: attempt.ipAddress,
        user_agent: attempt.userAgent,
        success: attempt.success,
        failure_reason: attempt.failureReason,
      })

      if (error) {
        console.error('Failed to track login attempt:', error)
      }
    } catch (err) {
      console.error('Error tracking login attempt:', err)
    }
  }

  // Check if account is locked (10+ failed attempts in last hour)
  const checkAccountLocked = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_account_locked', {
        p_email: email,
      })

      if (error) {
        console.error('Error checking account lock:', error)
        return false
      }

      return data === true
    } catch (err) {
      console.error('Error checking account lock:', err)
      return false
    }
  }

  // Get recent failed attempts count (for rate limiting)
  const getRecentFailedAttempts = async (
    email: string,
    minutes: number = 15
  ): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('get_recent_failed_attempts', {
        p_email: email,
        p_minutes: minutes,
      })

      if (error) {
        console.error('Error getting failed attempts:', error)
        return 0
      }

      return data || 0
    } catch (err) {
      console.error('Error getting failed attempts:', err)
      return 0
    }
  }

  // Create login history record for successful login
  const createLoginHistory = async (userId: string, facilityId?: string) => {
    try {
      const { error } = await supabase.from('login_history').insert({
        user_id: userId,
        facility_id: facilityId,
        ip_address: await getUserIP(),
        user_agent: navigator.userAgent,
        session_id: crypto.randomUUID(),
      })

      if (error) {
        console.error('Failed to create login history:', error)
      }
    } catch (err) {
      console.error('Error creating login history:', err)
    }
  }

  // Get user's login history
  const getLoginHistory = async (userId: string, limit: number = 10) => {
    try {
      const { data, error } = await supabase
        .from('login_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching login history:', error)
        return []
      }

      return data || []
    } catch (err) {
      console.error('Error fetching login history:', err)
      return []
    }
  }

  return {
    trackLoginAttempt,
    checkAccountLocked,
    getRecentFailedAttempts,
    createLoginHistory,
    getLoginHistory,
  }
}

// Helper to get user's IP address (best effort)
async function getUserIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch {
    return null
  }
}
