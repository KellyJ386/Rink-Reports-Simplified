import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface EdgingFormProps {
  log: any;
  machines: any[];
  rinks: any[];
  facilityId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function EdgingForm({ log, machines, rinks, facilityId, onSave, onCancel }: EdgingFormProps) {
  const [formData, setFormData] = useState({
    log_date: format(new Date(), 'yyyy-MM-dd'),
    log_time: '',
    machine_id: '',
    rink_id: '',
    edge_condition: 'good' as 'good' | 'fair' | 'poor',
    sections_edged: [] as string[],
    passes: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const sectionOptions = [
    { id: 'north', label: 'North End' },
    { id: 'south', label: 'South End' },
    { id: 'east', label: 'East Side' },
    { id: 'west', label: 'West Side' },
    { id: 'corners', label: 'All Corners' },
    { id: 'full', label: 'Full Perimeter' },
  ];

  useEffect(() => {
    if (log) {
      setFormData({
        log_date: log.log_date,
        log_time: log.log_time || '',
        machine_id: log.machine_id,
        rink_id: log.rink_id || '',
        edge_condition: log.edge_condition || 'good',
        sections_edged: log.sections_edged || [],
        passes: log.passes?.toString() || '',
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
        maintenance_type: 'edging',
        log_date: formData.log_date,
        log_time: formData.log_time || null,
        machine_id: formData.machine_id,
        rink_id: formData.rink_id || null,
        edge_condition: formData.edge_condition,
        sections_edged: formData.sections_edged.length > 0 ? formData.sections_edged : null,
        passes: formData.passes ? parseInt(formData.passes) : null,
        notes: formData.notes || null,
      };

      if (log) {
        submitData.id = log.id;
      }

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving edging log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSectionToggle = (sectionId: string) => {
    setFormData((prev) => {
      const sections = prev.sections_edged.includes(sectionId)
        ? prev.sections_edged.filter((s) => s !== sectionId)
        : [...prev.sections_edged, sectionId];
      return { ...prev, sections_edged: sections };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{log ? 'Edit Edging Log' : 'New Edging Log'}</CardTitle>
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

            {/* Rink */}
            <div className="space-y-2">
              <Label htmlFor="rink_id">Rink</Label>
              <select
                id="rink_id"
                value={formData.rink_id}
                onChange={(e) => handleChange('rink_id', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select rink...</option>
                {rinks.map((rink) => (
                  <option key={rink.id} value={rink.id}>
                    {rink.rink_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Edge Condition */}
            <div className="space-y-2">
              <Label htmlFor="edge_condition">
                Edge Condition Before <span className="text-destructive">*</span>
              </Label>
              <select
                id="edge_condition"
                value={formData.edge_condition}
                onChange={(e) => handleChange('edge_condition', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Number of Passes */}
            <div className="space-y-2">
              <Label htmlFor="passes">Number of Passes</Label>
              <Input
                id="passes"
                type="number"
                min="1"
                placeholder="e.g., 2"
                value={formData.passes}
                onChange={(e) => handleChange('passes', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                How many times edges were cleaned
              </p>
            </div>
          </div>

          {/* Sections Edged */}
          <div className="space-y-2">
            <Label>Sections Edged</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {sectionOptions.map((section) => (
                <label
                  key={section.id}
                  className="flex items-center space-x-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-accent"
                >
                  <input
                    type="checkbox"
                    checked={formData.sections_edged.includes(section.id)}
                    onChange={() => handleSectionToggle(section.id)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span className="text-sm">{section.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional observations, problem areas, or details..."
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
