import { useAllPermissions, useCurrentUserProfile, useUpdatePermission } from '@/hooks/useAdmin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const MODULES = [
  { id: 'ice_depth', name: 'Ice Depth' },
  { id: 'scheduling', name: 'Scheduling' },
  { id: 'maintenance', name: 'Maintenance' },
  { id: 'incidents', name: 'Incidents' },
  { id: 'daily_reports', name: 'Daily Reports' },
  { id: 'refrigeration', name: 'Refrigeration' },
  { id: 'air_quality', name: 'Air Quality' },
]

const PERMISSION_LEVELS = [
  { value: 'none', label: 'None', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { value: 'view', label: 'View', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'submit', label: 'Submit', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'full', label: 'Full', color: 'bg-purple-100 text-purple-700 border-purple-200' },
]

export function PermissionsPage() {
  const { data: currentProfile } = useCurrentUserProfile()
  const { data: users = [], isLoading } = useAllPermissions(currentProfile?.facility_id)
  const updatePermission = useUpdatePermission()

  const getPermissionForUser = (user: any, moduleId: string) => {
    const perm = user.user_permissions?.find((p: any) => p.module_name === moduleId)
    return perm?.permission_level || 'none'
  }

  const getPermissionColor = (level: string) => {
    return PERMISSION_LEVELS.find((p) => p.value === level)?.color || 'bg-gray-100'
  }

  const handlePermissionClick = async (userId: string, moduleId: string, currentLevel: string) => {
    // Cycle through permission levels
    const levels = ['none', 'view', 'submit', 'full']
    const currentIndex = levels.indexOf(currentLevel)
    const nextLevel = levels[(currentIndex + 1) % levels.length]

    await updatePermission.mutateAsync({
      user_id: userId,
      module_name: moduleId,
      permission_level: nextLevel as any,
    })
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading permissions...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Permission Matrix</h1>
        <p className="text-muted-foreground mt-1">
          View and manage module permissions for all users
        </p>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">How it works:</p>
          <p>
            Click on any permission badge to cycle through levels: None → View → Submit → Full
          </p>
        </div>
      </div>

      {/* Permission Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permission Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {PERMISSION_LEVELS.map((level) => (
              <div key={level.value} className="space-y-1">
                <Badge variant="outline" className={level.color}>
                  {level.label}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {level.value === 'none' && 'No access'}
                  {level.value === 'view' && 'View only'}
                  {level.value === 'submit' && 'View & create'}
                  {level.value === 'full' && 'Full access'}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>User Permissions</CardTitle>
          </div>
          <CardDescription>
            Click any badge to change permission level (cycles: None → View → Submit → Full)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                    User
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  {MODULES.map((module) => (
                    <th
                      key={module.id}
                      className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {module.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={MODULES.length + 2} className="px-6 py-8 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white z-10">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </td>
                      {MODULES.map((module) => {
                        const permission = getPermissionForUser(user, module.id)
                        return (
                          <td key={module.id} className="px-4 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handlePermissionClick(user.id, module.id, permission)}
                              className="inline-block transition-transform hover:scale-110"
                            >
                              <Badge
                                variant="outline"
                                className={`${getPermissionColor(permission)} cursor-pointer text-xs`}
                              >
                                {permission}
                              </Badge>
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
