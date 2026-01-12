import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useInviteUser, useCurrentUserProfile } from '@/hooks/useAdmin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail } from 'lucide-react'

export function UserInvitePage() {
  const navigate = useNavigate()
  const { data: currentProfile } = useCurrentUserProfile()
  const inviteUser = useInviteUser()

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'staff',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentProfile?.facility_id) {
      alert('Facility not found')
      return
    }

    await inviteUser.mutateAsync({
      email: formData.email,
      facility_id: currentProfile.facility_id,
      role: formData.role,
      first_name: formData.first_name,
      last_name: formData.last_name,
    })

    navigate('/admin/users')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Invite New User</h1>
          <p className="text-muted-foreground mt-1">
            Send an invitation to join your facility
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <div>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Enter the user's email and basic information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="user@example.com"
                required
              />
              <p className="text-xs text-muted-foreground">
                An invitation email will be sent to this address
              </p>
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-medium">
                First Name
              </label>
              <input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="John"
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
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Doe"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role *
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="staff">Staff - Limited access</option>
                <option value="manager">Manager - Department access</option>
                <option value="admin">Admin - Full facility access</option>
              </select>
              <p className="text-xs text-muted-foreground">
                You can adjust permissions later from the user's profile
              </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> The user will receive an email invitation with
                instructions to set up their account. The invitation link expires in 7 days.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/admin/users')}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={inviteUser.isPending}>
                <Mail className="h-4 w-4 mr-2" />
                {inviteUser.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
