import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface BladeChangeFormProps {
  log: any;
  machines: any[];
  facilityId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function BladeChangeForm({ log, machines, facilityId, onSave, onCancel }: BladeChangeFormProps) {
  const [formData, setFormData] = useState({
    log_date: format(new Date(), 'yyyy-MM-dd'),
    log_time: '',
    machine_id: '',
    blade_type: '',
    old_blade_hours: '',
    reason: 'scheduled' as 'scheduled' | 'damaged' | 'worn' | 'other',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (log) {
      setFormData({
        log_date: log.log_date,
        log_time: log.log_time || '',
        machine_id: log.machine_id,
        blade_type: log.blade_type || '',
        old_blade_hours: log.old_blade_hours?.toString() || '',
        reason: log.reason || 'scheduled',
        notes: log.notes || '',
      });
    }
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData: any = {
        facility_id: facilityId,
        maintenance_type: 'blade_change',
        log_date: formData.log_date,
        log_time: formData.log_time || null,
        machine_id: formData.machine_id,
        blade_type: formData.blade_type || null,
        old_blade_hours: formData.old_blade_hours ? parseFloat(formData.old_blade_hours) : null,
        reason: formData.reason,
        notes: formData.notes || null,
      };

      if (log) {
        submitData.id = log.id;
      }

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving blade change:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{log ? 'Edit Blade Change' : 'New Blade Change'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="log_date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="log_date"
                type="date"
                value={formData.log_date}
                onChange={(e) => handleChange('log_date', e.target.value)}
                required
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="log_time">Time</Label>
              <Input
                id="log_time"
                type="time"
                value={formData.log_time}
                onChange={(e) => handleChange('log_time', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Machine */}
            <div className="space-y-2">
              <Label htmlFor="machine_id">
                Machine <span className="text-destructive">*</span>
              </Label>
              <select
                id="machine_id"
                value={formData.machine_id}
                onChange={(e) => handleChange('machine_id', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Select machine...</option>
                {machines.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.machine_name} - {machine.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Blade Type */}
            <div className="space-y-2">
              <Label htmlFor="blade_type">Blade Type/Model</Label>
              <Input
                id="blade_type"
                type="text"
                placeholder="e.g., Standard 10-inch"
                value={formData.blade_type}
                onChange={(e) => handleChange('blade_type', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Old Blade Hours */}
            <div className="space-y-2">
              <Label htmlFor="old_blade_hours">Old Blade Hours</Label>
              <Input
                id="old_blade_hours"
                type="number"
                step="0.1"
                placeholder="Hours of use"
                value={formData.old_blade_hours}
                onChange={(e) => handleChange('old_blade_hours', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Total hours the old blade was used
              </p>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason for Change <span className="text-destructive">*</span>
              </Label>
              <select
                id="reason"
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="scheduled">Scheduled Maintenance</option>
                <option value="worn">Worn/Dull</option>
                <option value="damaged">Damaged</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional observations, issues, or details..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : log ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
