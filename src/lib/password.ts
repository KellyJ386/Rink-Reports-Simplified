// Password validation utilities

export interface PasswordStrength {
  score: number // 0-4
  feedback: string
  isValid: boolean
  checks: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    number: boolean
    special: boolean
  }
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }

  const passedChecks = Object.values(checks).filter(Boolean).length
  const score = passedChecks
  const isValid = passedChecks === 5

  let feedback = ''
  if (score === 0) {
    feedback = 'Very weak password'
  } else if (score === 1) {
    feedback = 'Weak password'
  } else if (score === 2) {
    feedback = 'Fair password'
  } else if (score === 3) {
    feedback = 'Good password'
  } else if (score === 4) {
    feedback = 'Strong password'
  } else {
    feedback = 'Excellent password!'
  }

  return {
    score,
    feedback,
    isValid,
    checks,
  }
}

export function getPasswordRequirements() {
  return [
    'At least 8 characters long',
    'Contains at least one uppercase letter (A-Z)',
    'Contains at least one lowercase letter (a-z)',
    'Contains at least one number (0-9)',
    'Contains at least one special character (!@#$%^&*)',
  ]
}

export function getPasswordErrorMessage(password: string): string | null {
  if (!password) return null

  const strength = validatePasswordStrength(password)
  if (strength.isValid) return null

  const missing: string[] = []
  if (!strength.checks.length) missing.push('at least 8 characters')
  if (!strength.checks.uppercase) missing.push('an uppercase letter')
  if (!strength.checks.lowercase) missing.push('a lowercase letter')
  if (!strength.checks.number) missing.push('a number')
  if (!strength.checks.special) missing.push('a special character')

  if (missing.length === 0) return null
  if (missing.length === 1) return `Password must include ${missing[0]}`
  if (missing.length === 2) return `Password must include ${missing[0]} and ${missing[1]}`

  const last = missing.pop()
  return `Password must include ${missing.join(', ')}, and ${last}`
}
