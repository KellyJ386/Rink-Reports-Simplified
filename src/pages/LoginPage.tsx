import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useLoginSecurity } from '@/hooks/useLoginSecurity'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { toast } from 'sonner'
import { AlertCircle } from 'lucide-react'

export function LoginPage() {
  const { signIn } = useAuth()
  const { trackLoginAttempt, checkAccountLocked, getRecentFailedAttempts, createLoginHistory } =
    useLoginSecurity()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Check if account is locked
      const isLocked = await checkAccountLocked(email)
      if (isLocked) {
        setError(
          'Account temporarily locked due to too many failed login attempts. Please try again in 24 hours or contact support.'
        )
        setLoading(false)
        return
      }

      // Check rate limiting (5 attempts in 15 minutes)
      const recentAttempts = await getRecentFailedAttempts(email, 15)
      if (recentAttempts >= 5) {
        const timeRemaining = 15 - Math.floor((Date.now() % (15 * 60 * 1000)) / 60000)
        setError(
          `Too many failed login attempts. Please wait ${timeRemaining} minutes before trying again.`
        )
        setLoading(false)
        return
      }

      // Attempt sign in
      const { data, error: signInError } = await signIn(email, password)

      if (signInError) {
        // Track failed attempt
        await trackLoginAttempt({
          email,
          success: false,
          failureReason: signInError.message,
          userAgent: navigator.userAgent,
        })

        // Show helpful error message
        if (signInError.message.includes('Invalid login credentials')) {
          const attemptsLeft = 5 - recentAttempts - 1
          if (attemptsLeft > 0) {
            setError(
              `Invalid email or password. ${attemptsLeft} ${
                attemptsLeft === 1 ? 'attempt' : 'attempts'
              } remaining before temporary lockout.`
            )
          } else {
            setError('Invalid email or password. Account will be locked after next failed attempt.')
          }
        } else if (signInError.message.includes('Email not confirmed')) {
          setError(
            'Please verify your email address before signing in. Check your inbox for the verification link.'
          )
        } else {
          setError(signInError.message)
        }
      } else if (data.user) {
        // Track successful login
        await trackLoginAttempt({
          email,
          success: true,
          userAgent: navigator.userAgent,
        })

        // Create login history
        await createLoginHistory(data.user.id)

        toast.success('Welcome back!')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your facility dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="flex gap-3 p-3 text-sm bg-red-50 border border-red-200 rounded-md text-red-800">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="you@example.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Password Input with Visibility Toggle */}
          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={loading}
            autoComplete="current-password"
          />

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
              tabIndex={-1}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a href="mailto:support@maxfacility.com" className="text-primary hover:underline">
            Contact Support
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
