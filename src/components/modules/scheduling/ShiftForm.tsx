import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface ShiftFormProps {
  shift?: any;
  staff: any[];
  facilityId: string;
  defaultDate?: string;
  onSave: (data: any) => void;
  onDelete?: (id: string) => void;
  onCancel: () => void;
}

export const ShiftForm: React.FC<ShiftFormProps> = ({
  shift,
  staff,
  facilityId,
  defaultDate,
  onSave,
  onDelete,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    shift_date: defaultDate || format(new Date(), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '17:00',
    shift_type: 'mid' as 'opening' | 'closing' | 'mid' | 'event',
    role: 'attendant',
    assigned_staff_id: '',
    special_instructions: '',
  });

  const activeStaff = staff.filter((s) => s.status === 'active');

  useEffect(() => {
    if (shift) {
      setFormData({
        shift_date: shift.shift_date,
        start_time: shift.start_time.substring(0, 5), // HH:mm
        end_time: shift.end_time.substring(0, 5),
        shift_type: shift.shift_type,
        role: shift.role,
        assigned_staff_id: shift.assigned_staff_id || '',
        special_instructions: shift.special_instructions || '',
      });
    }
  }, [shift]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      start_time: formData.start_time + ':00', // Add seconds
      end_time: formData.end_time + ':00',
      assigned_staff_id: formData.assigned_staff_id || null,
      facility_id: facilityId,
    };

    if (shift) {
      onSave({ id: shift.id, ...data });
    } else {
      onSave(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{shift ? 'Edit Shift' : 'Create Shift'}</CardTitle>
        <CardDescription>
          {shift ? 'Update shift details' : 'Add a new shift to the schedule'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="shift_date" className="text-sm font-medium">
                Date *
              </label>
              <Input
                id="shift_date"
                type="date"
                value={formData.shift_date}
                onChange={(e) => setFormData({ ...formData, shift_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="shift_type" className="text-sm font-medium">
                Shift Type *
              </label>
              <select
                id="shift_type"
                value={formData.shift_type}
                onChange={(e) => setFormData({ ...formData, shift_type: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="opening">Opening</option>
                <option value="mid">Mid Shift</option>
                <option value="closing">Closing</option>
                <option value="event">Event</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="start_time" className="text-sm font-medium">
                Start Time *
              </label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="end_time" className="text-sm font-medium">
                End Time *
              </label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
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
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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

          <div className="space-y-2">
            <label htmlFor="assigned_staff_id" className="text-sm font-medium">
              Assign to Staff
            </label>
            <select
              id="assigned_staff_id"
              value={formData.assigned_staff_id}
              onChange={(e) => setFormData({ ...formData, assigned_staff_id: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Unassigned</option>
              {activeStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} - {s.role}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="special_instructions" className="text-sm font-medium">
              Special Instructions
            </label>
            <textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) =>
                setFormData({ ...formData, special_instructions: e.target.value })
              }
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Any special notes or instructions for this shift..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {shift && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(shift.id)}
              >
                Delete Shift
              </Button>
            )}
            <Button type="submit" className="ml-auto">
              {shift ? 'Update' : 'Create'} Shift
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
