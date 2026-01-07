import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, UserX, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  role: 'manager' | 'supervisor' | 'attendant' | 'instructor' | 'maintenance';
  status: 'active' | 'inactive';
  created_at: string;
}

interface StaffListProps {
  staff: StaffMember[];
  onAdd: () => void;
  onEdit: (staff: StaffMember) => void;
  onDeactivate: (staff: StaffMember) => void;
}

const ROLE_COLORS = {
  manager: 'bg-purple-100 text-purple-800',
  supervisor: 'bg-blue-100 text-blue-800',
  attendant: 'bg-green-100 text-green-800',
  instructor: 'bg-orange-100 text-orange-800',
  maintenance: 'bg-gray-100 text-gray-800',
};

const ROLE_LABELS = {
  manager: 'Manager',
  supervisor: 'Supervisor',
  attendant: 'Attendant',
  instructor: 'Instructor',
  maintenance: 'Maintenance',
};

export const StaffList: React.FC<StaffListProps> = ({
  staff,
  onAdd,
  onEdit,
  onDeactivate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');

  // Filter staff
  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Group by role
  const activeStaff = filteredStaff.filter((s) => s.status === 'active');
  const inactiveStaff = filteredStaff.filter((s) => s.status === 'inactive');

  return (
    <div className="space-y-6">
      {/* Header and filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1 w-full md:max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All Status</option>
          </select>

          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStaff.length}</div>
          </CardContent>
        </Card>

        {Object.entries(ROLE_LABELS).map(([role, label]) => {
          const count = activeStaff.filter((s) => s.role === role).length;
          return (
            <Card key={role}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}s
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
              </CardContent>
            </Card>
          );
        }).slice(0, 3)}
      </div>

      {/* Staff list */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>
            {filteredStaff.length} {filteredStaff.length === 1 ? 'member' : 'members'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No staff members found</p>
              {searchTerm && (
                <p className="text-sm mt-2">Try adjusting your search or filters</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    member.status === 'inactive' ? 'opacity-60' : 'hover:bg-accent'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-semibold">
                          {member.first_name} {member.last_name}
                          {member.status === 'inactive' && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              (Inactive)
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.email || 'No email'}
                          {member.phone && ` • ${member.phone}`}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ROLE_COLORS[member.role]
                        }`}
                      >
                        {ROLE_LABELS[member.role]}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(member)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {member.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeactivate(member)}
                        className="text-destructive hover:text-destructive"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
