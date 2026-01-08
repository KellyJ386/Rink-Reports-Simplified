import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

interface IceMakeFormProps {
  log?: any;
  machines: any[];
  rinks: any[];
  facilityId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export const IceMakeForm: React.FC<IceMakeFormProps> = ({
  log,
  machines,
  rinks,
  facilityId,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    log_date: log?.log_date || format(new Date(), 'yyyy-MM-dd'),
    start_time: log?.start_time?.substring(0, 5) || '',
    end_time: log?.end_time?.substring(0, 5) || '',
    machine_id: log?.machine_id || '',
    rink_id: log?.rink_id || '',
    make_type: log?.make_type || 'wet' as 'wet' | 'dry',
    water_used: log?.water_used || '',
    water_unit: log?.water_unit || 'gallons' as 'gallons' | 'liters',
    snow_removed_percent: log?.snow_removed_percent || '',
    machine_hours: log?.machine_hours || '',
    notes: log?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      facility_id: facilityId,
      maintenance_type: 'resurfacing',
      log_time: formData.start_time ? formData.start_time + ':00' : null,
      start_time: formData.start_time ? formData.start_time + ':00' : null,
      end_time: formData.end_time ? formData.end_time + ':00' : null,
      water_used: formData.water_used ? parseFloat(formData.water_used) : null,
      snow_removed_percent: formData.snow_removed_percent ? parseInt(formData.snow_removed_percent) : null,
      machine_hours: formData.machine_hours ? parseFloat(formData.machine_hours) : null,
      machine_id: formData.machine_id || null,
      rink_id: formData.rink_id || null,
    };

    if (log) {
      onSave({ id: log.id, ...data });
    } else {
      onSave(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{log ? 'Edit Ice Make' : 'New Ice Make'}</CardTitle>
        <CardDescription>
          Log a Zamboni resurfacing session
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label htmlFor="log_date" className="text-sm font-medium">
                Date *
              </label>
              <Input
                id="log_date"
                type="date"
                value={formData.log_date}
                onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
                required
              />
            </div>

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
                End Time
              </label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="machine_id" className="text-sm font-medium">
                Machine *
              </label>
              <select
                id="machine_id"
                value={formData.machine_id}
                onChange={(e) => setFormData({ ...formData, machine_id: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Select machine</option>
                {machines.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.machine_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="rink_id" className="text-sm font-medium">
                Rink *
              </label>
              <select
                id="rink_id"
                value={formData.rink_id}
                onChange={(e) => setFormData({ ...formData, rink_id: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Select rink</option>
                {rinks.map((rink) => (
                  <option key={rink.id} value={rink.id}>
                    {rink.rink_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="make_type" className="text-sm font-medium">
                Make Type *
              </label>
              <select
                id="make_type"
                value={formData.make_type}
                onChange={(e) => setFormData({ ...formData, make_type: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="wet">Wet Make</option>
                <option value="dry">Dry Make</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="machine_hours" className="text-sm font-medium">
                Machine Hours
              </label>
              <Input
                id="machine_hours"
                type="number"
                step="0.1"
                value={formData.machine_hours}
                onChange={(e) => setFormData({ ...formData, machine_hours: e.target.value })}
                placeholder="e.g., 245.5"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="water_used" className="text-sm font-medium">
                Water Used
              </label>
              <div className="flex gap-2">
                <Input
                  id="water_used"
                  type="number"
                  step="0.1"
                  value={formData.water_used}
                  onChange={(e) => setFormData({ ...formData, water_used: e.target.value })}
                  placeholder="Amount"
                  className="flex-1"
                />
                <select
                  value={formData.water_unit}
                  onChange={(e) => setFormData({ ...formData, water_unit: e.target.value as any })}
                  className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="gallons">Gallons</option>
                  <option value="liters">Liters</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="snow_removed_percent" className="text-sm font-medium">
                Snow Removed (%)
              </label>
              <Input
                id="snow_removed_percent"
                type="number"
                min="0"
                max="100"
                value={formData.snow_removed_percent}
                onChange={(e) => setFormData({ ...formData, snow_removed_percent: e.target.value })}
                placeholder="0-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Any observations or issues..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {log ? 'Update' : 'Save'} Ice Make
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
