import { validatePasswordStrength } from '@/lib/password'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordStrengthIndicatorProps {
  password: string
  showRequirements?: boolean
}

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const strength = validatePasswordStrength(password)

  if (!password) return null

  const getColorClass = () => {
    if (strength.score === 0) return 'bg-red-500'
    if (strength.score === 1) return 'bg-red-400'
    if (strength.score === 2) return 'bg-orange-400'
    if (strength.score === 3) return 'bg-yellow-400'
    if (strength.score === 4) return 'bg-lime-400'
    return 'bg-green-500'
  }

  const getTextColor = () => {
    if (strength.score <= 1) return 'text-red-600'
    if (strength.score === 2) return 'text-orange-600'
    if (strength.score === 3) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                level <= strength.score ? getColorClass() : 'bg-gray-200'
              )}
            />
          ))}
        </div>
        <p className={cn('text-xs font-medium', getTextColor())}>
          {strength.feedback}
        </p>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="space-y-1 text-xs">
          <RequirementItem
            met={strength.checks.length}
            text="At least 8 characters"
          />
          <RequirementItem
            met={strength.checks.uppercase}
            text="One uppercase letter"
          />
          <RequirementItem
            met={strength.checks.lowercase}
            text="One lowercase letter"
          />
          <RequirementItem met={strength.checks.number} text="One number" />
          <RequirementItem
            met={strength.checks.special}
            text="One special character (!@#$%^&*)"
          />
        </div>
      )}
    </div>
  )
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <X className="h-3 w-3 text-gray-400" />
      )}
      <span className={cn(met ? 'text-green-600' : 'text-gray-500')}>
        {text}
      </span>
    </div>
  )
}
