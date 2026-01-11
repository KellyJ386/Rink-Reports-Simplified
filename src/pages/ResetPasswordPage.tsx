import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PasswordInput } from '@/components/auth/PasswordInput'
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator'
import { validatePasswordStrength, getPasswordErrorMessage } from '@/lib/password'
import { toast } from 'sonner'

export function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate password strength
    const strength = validatePasswordStrength(password)
    if (!strength.isValid) {
      const errorMsg = getPasswordErrorMessage(password)
      setError(errorMsg || 'Password does not meet requirements')
      return
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await updatePassword(password)

      if (updateError) {
        toast.error('Failed to reset password', {
          description: updateError.message,
        })
      } else {
        toast.success('Password reset successfully!', {
          description: 'You can now sign in with your new password.',
        })
        navigate('/login')
      }
    } catch (err) {
      console.error('Password reset error:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Set New Password</CardTitle>
        <CardDescription>
          Choose a strong password that you haven't used before
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-3 text-sm bg-red-50 border border-red-200 rounded-md text-red-800">
              {error}
            </div>
          )}

          {/* New Password */}
          <div className="space-y-2">
            <PasswordInput
              id="password"
              label="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
              disabled={loading}
              autoComplete="new-password"
              autoFocus
            />
            {password && <PasswordStrengthIndicator password={password} />}
          </div>

          {/* Confirm Password */}
          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
            disabled={loading}
            autoComplete="new-password"
            error={
              confirmPassword && password !== confirmPassword
                ? 'Passwords do not match'
                : undefined
            }
          />

          <Button
            type="submit"
            className="w-full"
            disabled={
              loading ||
              !password ||
              !confirmPassword ||
              password !== confirmPassword ||
              !validatePasswordStrength(password).isValid
            }
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
