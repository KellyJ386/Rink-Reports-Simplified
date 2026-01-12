import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function usePermissions() {
  const { data: profile } = useQuery({
    queryKey: ['current-user-permissions'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_permissions (*)
        `)
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    },
  })

  // Check if user has a specific role
  const hasRole = (roles: string | string[]): boolean => {
    if (!profile?.role) return false

    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(profile.role)
  }

  // Check if user is admin or super_admin
  const isAdmin = (): boolean => {
    return hasRole(['admin', 'super_admin'])
  }

  // Check if user can access a module with specific permission level
  const can = (moduleName: string, level: 'view' | 'submit' | 'full'): boolean => {
    // Super admins and admins have full access to everything
    if (isAdmin()) return true

    const permission = profile?.user_permissions?.find(
      (p: any) => p.module_name === moduleName
    )

    if (!permission) return false

    const permissionLevels = ['none', 'view', 'submit', 'full']
    const userLevel = permissionLevels.indexOf(permission.permission_level)
    const requiredLevel = permissionLevels.indexOf(level)

    return userLevel >= requiredLevel
  }

  // Check if user can view a module
  const canView = (moduleName: string): boolean => {
    return can(moduleName, 'view')
  }

  // Check if user can submit/create in a module
  const canSubmit = (moduleName: string): boolean => {
    return can(moduleName, 'submit')
  }

  // Check if user has full access to a module
  const canFull = (moduleName: string): boolean => {
    return can(moduleName, 'full')
  }

  return {
    profile,
    role: profile?.role,
    hasRole,
    isAdmin,
    can,
    canView,
    canSubmit,
    canFull,
  }
}
