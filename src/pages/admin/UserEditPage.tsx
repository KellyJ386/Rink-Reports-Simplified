import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useUser, useUpdateUser, useUserPermissions, useUpdatePermission } from '@/hooks/useAdmin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const MODULES = [
  { id: 'ice_depth', name: 'Ice Depth Log' },
  { id: 'scheduling', name: 'Employee Scheduling' },
  { id: 'maintenance', name: 'Ice Maintenance' },
  { id: 'incidents', name: 'Incident Reports' },
  { id: 'daily_reports', name: 'Daily Reports' },
  { id: 'refrigeration', name: 'Refrigeration Log' },
  { id: 'air_quality', name: 'Air Quality Log' },
]

const PERMISSION_LEVELS = [
  { value: 'none', label: 'None', description: 'No access' },
  { value: 'view', label: 'View', description: 'View only' },
  { value: 'submit', label: 'Submit', description: 'View & create entries' },
  { value: 'full', label: 'Full', description: 'Full access (edit, delete)' },
]

export function UserEditPage() {
  const { userId } = useParams()
  const navigate = useNavigate()

  const { data: user, isLoading } = useUser(userId)
  const { data: permissions = [] } = useUserPermissions(userId)
  const updateUser = useUpdateUser()
  const updatePermission = useUpdatePermission()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    role: 'staff',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        role: user.role || 'staff',
      })
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    await updateUser.mutateAsync({
      id: userId,
      ...formData,
    })
  }

  const getPermissionForModule = (moduleId: string) => {
    const perm = permissions.find((p: any) => p.module_name === moduleId)
    return perm?.permission_level || 'none'
  }

  const handlePermissionChange = async (moduleId: string, level: string) => {
    if (!userId) return

    await updatePermission.mutateAsync({
      user_id: userId,
      module_name: moduleId,
      permission_level: level as any,
    })
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading user...</div>
  }

  if (!user) {
    return <div className="text-center py-8">User not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            Edit User: {user.first_name} {user.last_name}
          </h1>
          <p className="text-muted-foreground mt-1">{user.email}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Details */}
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Basic information and role assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              {/* First Name */}
              <div className="space-y-2">
                <label htmlFor="first_name" className="text-sm font-medium">
                  First Name
                </label>
                <input
                  id="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label htmlFor="last_name" className="text-sm font-medium">
                  Last Name
                </label>
                <input
                  id="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="staff">Staff - Limited access</option>
                  <option value="manager">Manager - Department access</option>
                  <option value="admin">Admin - Full facility access</option>
                  <option value="super_admin">Super Admin - System-wide access</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Roles define the user's level of access across the system
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={updateUser.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateUser.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Module Permissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <div>
                <CardTitle>Module Permissions</CardTitle>
                <CardDescription>
                  Control access to specific modules for this user
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {MODULES.map((module) => {
              const currentPermission = getPermissionForModule(module.id)
              return (
                <div key={module.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">{module.name}</label>
                    <Badge variant="outline">{currentPermission}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {PERMISSION_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => handlePermissionChange(module.id, level.value)}
                        className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                          currentPermission === level.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-gray-100 border-gray-200'
                        }`}
                        title={level.description}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                <strong>None:</strong> No access to module
                <br />
                <strong>View:</strong> Can view entries only
                <br />
                <strong>Submit:</strong> Can view and create new entries
                <br />
                <strong>Full:</strong> Can view, create, edit, and delete
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
