import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

interface SessionTimeoutProps {
  timeoutMinutes?: number // Timeout duration in minutes (default: 30)
  warningMinutes?: number // Show warning before timeout (default: 5)
}

export function SessionTimeout({
  timeoutMinutes = 30,
  warningMinutes = 5,
}: SessionTimeoutProps) {
  const { user, signOut } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const warningRef = useRef<NodeJS.Timeout>()
  const countdownRef = useRef<NodeJS.Timeout>()

  const resetTimers = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    // Close warning dialog if open
    setShowWarning(false)

    // Don't set timers if user is not logged in
    if (!user) return

    // Set warning timer
    const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000
    warningRef.current = setTimeout(() => {
      setShowWarning(true)
      setSecondsRemaining(warningMinutes * 60)

      // Start countdown
      countdownRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleTimeout()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, warningMs)

    // Set timeout timer
    const timeoutMs = timeoutMinutes * 60 * 1000
    timeoutRef.current = setTimeout(() => {
      handleTimeout()
    }, timeoutMs)
  }, [user, timeoutMinutes, warningMinutes])

  const handleTimeout = async () => {
    setShowWarning(false)
    await signOut()
  }

  const handleStayLoggedIn = () => {
    resetTimers()
  }

  // Track user activity
  useEffect(() => {
    if (!user) return

    const events = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'mousemove',
    ]

    const handleActivity = () => {
      resetTimers()
    }

    // Set initial timers
    resetTimers()

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [user, resetTimers])

  if (!user) return null

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <DialogTitle className="text-center">Session Timeout Warning</DialogTitle>
          <DialogDescription className="text-center">
            You will be logged out due to inactivity in
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center py-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-orange-600 tabular-nums">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
            <p className="text-sm text-muted-foreground mt-2">minutes:seconds</p>
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-2">
          <Button variant="outline" onClick={handleTimeout}>
            Log Out Now
          </Button>
          <Button onClick={handleStayLoggedIn}>Stay Logged In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
