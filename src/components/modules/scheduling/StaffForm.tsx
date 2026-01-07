import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StaffFormProps {
  staff?: any;
  facilityId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const StaffForm: React.FC<StaffFormProps> = ({
  staff,
  facilityId,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'attendant' as 'manager' | 'supervisor' | 'attendant' | 'instructor' | 'maintenance',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    if (staff) {
      setFormData({
        first_name: staff.first_name || '',
        last_name: staff.last_name || '',
        email: staff.email || '',
        phone: staff.phone || '',
        role: staff.role || 'attendant',
        status: staff.status || 'active',
      });
    }
  }, [staff]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      facility_id: facilityId,
    };

    if (staff) {
      onSave({ id: staff.id, ...data });
    } else {
      onSave(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{staff ? 'Edit Staff Member' : 'Add Staff Member'}</CardTitle>
        <CardDescription>
          {staff ? 'Update staff member information' : 'Add a new staff member to your team'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="first_name" className="text-sm font-medium">
                First Name *
              </label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="last_name" className="text-sm font-medium">
                Last Name *
              </label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role *
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="manager">Manager</option>
              <option value="supervisor">Supervisor</option>
              <option value="attendant">Attendant</option>
              <option value="instructor">Instructor</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {staff && (
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {staff ? 'Update' : 'Add'} Staff Member
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
