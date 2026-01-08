import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface IncidentFormProps {
  incident?: any;
  rinks: any[];
  facilityId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const INCIDENT_TYPES = [
  'Slip/Trip/Fall',
  'Collision',
  'Equipment Related',
  'Cut/Laceration',
  'Broken Bone',
  'Head Injury',
  'Other',
];

const SEVERITY_LEVELS = [
  { value: 'minor', label: 'Minor', color: 'text-green-600' },
  { value: 'moderate', label: 'Moderate', color: 'text-yellow-600' },
  { value: 'serious', label: 'Serious', color: 'text-orange-600' },
  { value: 'critical', label: 'Critical', color: 'text-red-600' },
];

export function IncidentForm({ incident, rinks, facilityId, onSave, onCancel }: IncidentFormProps) {
  const [formData, setFormData] = useState({
    incident_date: incident?.incident_date || format(new Date(), 'yyyy-MM-dd'),
    incident_time: incident?.incident_time || '',
    rink_id: incident?.rink_id || '',
    location: incident?.location || '',
    incident_type: incident?.incident_type || '',
    severity: incident?.severity || 'minor',
    injured_name: incident?.injured_name || '',
    injured_age: incident?.injured_age?.toString() || '',
    injured_phone: incident?.injured_phone || '',
    injured_email: incident?.injured_email || '',
    emergency_contact_name: incident?.emergency_contact_name || '',
    emergency_contact_phone: incident?.emergency_contact_phone || '',
    description: incident?.description || '',
    contributing_factors: incident?.contributing_factors?.join(', ') || '',
    injuries: incident?.injuries || { locations: [], description: '' },
    first_aid_given: incident?.first_aid_given || false,
    ice_pack_given: incident?.ice_pack_given || false,
    ambulance_called: incident?.ambulance_called || false,
    parent_notified: incident?.parent_notified || false,
    scene_secured: incident?.scene_secured || false,
    medical_facility: incident?.medical_facility || '',
    manager_notified: incident?.manager_notified || false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (incident) {
      setFormData({
        incident_date: incident.incident_date,
        incident_time: incident.incident_time || '',
        rink_id: incident.rink_id || '',
        location: incident.location,
        incident_type: incident.incident_type,
        severity: incident.severity,
        injured_name: incident.injured_name,
        injured_age: incident.injured_age?.toString() || '',
        injured_phone: incident.injured_phone || '',
        injured_email: incident.injured_email || '',
        emergency_contact_name: incident.emergency_contact_name || '',
        emergency_contact_phone: incident.emergency_contact_phone || '',
        description: incident.description,
        contributing_factors: incident.contributing_factors?.join(', ') || '',
        injuries: incident.injuries || { locations: [], description: '' },
        first_aid_given: incident.first_aid_given || false,
        ice_pack_given: incident.ice_pack_given || false,
        ambulance_called: incident.ambulance_called || false,
        parent_notified: incident.parent_notified || false,
        scene_secured: incident.scene_secured || false,
        medical_facility: incident.medical_facility || '',
        manager_notified: incident.manager_notified || false,
      });
    }
  }, [incident]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData: any = {
        facility_id: facilityId,
        incident_date: formData.incident_date,
        incident_time: formData.incident_time || null,
        rink_id: formData.rink_id || null,
        location: formData.location,
        incident_type: formData.incident_type,
        severity: formData.severity,
        injured_name: formData.injured_name,
        injured_age: formData.injured_age ? parseInt(formData.injured_age) : null,
        injured_phone: formData.injured_phone || null,
        injured_email: formData.injured_email || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        description: formData.description,
        contributing_factors: formData.contributing_factors
          ? formData.contributing_factors.split(',').map((f) => f.trim()).filter(Boolean)
          : null,
        injuries: formData.injuries,
        first_aid_given: formData.first_aid_given,
        ice_pack_given: formData.ice_pack_given,
        ambulance_called: formData.ambulance_called,
        parent_notified: formData.parent_notified,
        scene_secured: formData.scene_secured,
        medical_facility: formData.medical_facility || null,
        manager_notified: formData.manager_notified,
      };

      if (incident) {
        submitData.id = incident.id;
      }

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving incident:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="incident_date">
                Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="incident_date"
                type="date"
                value={formData.incident_date}
                onChange={(e) => handleChange('incident_date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident_time">
                Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="incident_time"
                type="time"
                value={formData.incident_time}
                onChange={(e) => handleChange('incident_time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g., Ice surface, Lobby, Locker room"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="incident_type">
                Incident Type <span className="text-destructive">*</span>
              </Label>
              <select
                id="incident_type"
                value={formData.incident_type}
                onChange={(e) => handleChange('incident_type', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Select type...</option>
                {INCIDENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">
                Severity <span className="text-destructive">*</span>
              </Label>
              <select
                id="severity"
                value={formData.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                {SEVERITY_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Injured Person */}
      <Card>
        <CardHeader>
          <CardTitle>Injured Person Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="injured_name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="injured_name"
                value={formData.injured_name}
                onChange={(e) => handleChange('injured_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="injured_age">Age</Label>
              <Input
                id="injured_age"
                type="number"
                value={formData.injured_age}
                onChange={(e) => handleChange('injured_age', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="injured_phone">Phone</Label>
              <Input
                id="injured_phone"
                type="tel"
                value={formData.injured_phone}
                onChange={(e) => handleChange('injured_phone', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="injured_email">Email</Label>
              <Input
                id="injured_email"
                type="email"
                value={formData.injured_email}
                onChange={(e) => handleChange('injured_email', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description & Injuries */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">
              What Happened? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the incident in detail..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contributing_factors">Contributing Factors (comma-separated)</Label>
            <Input
              id="contributing_factors"
              value={formData.contributing_factors}
              onChange={(e) => handleChange('contributing_factors', e.target.value)}
              placeholder="e.g., Wet ice, Equipment failure, Poor lighting"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="injuries_description">Injuries/Symptoms Description</Label>
            <Textarea
              id="injuries_description"
              value={formData.injuries.description || ''}
              onChange={(e) =>
                handleChange('injuries', {
                  ...formData.injuries,
                  description: e.target.value,
                })
              }
              placeholder="Describe visible injuries, symptoms, or pain reported..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Response Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Response & Actions Taken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.first_aid_given}
                onChange={(e) => handleChange('first_aid_given', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">First Aid Given</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.ice_pack_given}
                onChange={(e) => handleChange('ice_pack_given', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Ice Pack Given</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.ambulance_called}
                onChange={(e) => handleChange('ambulance_called', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Ambulance Called</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.parent_notified}
                onChange={(e) => handleChange('parent_notified', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Parent/Guardian Notified</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.scene_secured}
                onChange={(e) => handleChange('scene_secured', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Scene Secured</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.manager_notified}
                onChange={(e) => handleChange('manager_notified', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <span className="text-sm">Manager Notified</span>
            </label>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="medical_facility">Medical Facility (if transported)</Label>
            <Input
              id="medical_facility"
              value={formData.medical_facility}
              onChange={(e) => handleChange('medical_facility', e.target.value)}
              placeholder="Hospital or medical facility name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : incident ? 'Update Report' : 'Submit Report'}
        </Button>
      </div>
    </form>
  );
}
