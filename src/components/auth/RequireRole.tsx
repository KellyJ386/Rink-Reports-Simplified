import { Navigate } from 'react-router-dom'
import { usePermissions } from '@/hooks/usePermissions'

interface RequireRoleProps {
  roles: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequireRole({ roles, children, fallback }: RequireRoleProps) {
  const { hasRole, profile } = usePermissions()

  if (!profile) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!hasRole(roles)) {
    if (fallback) {
      return <>{fallback}</>
    }
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
