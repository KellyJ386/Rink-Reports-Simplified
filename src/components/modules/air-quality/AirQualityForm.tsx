import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface AirQualityFormProps {
  log?: any;
  rinks: any[];
  thresholds: any;
  facilityId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function AirQualityForm({
  log,
  rinks,
  thresholds,
  facilityId,
  onSave,
  onCancel,
}: AirQualityFormProps) {
  const [formData, setFormData] = useState({
    log_date: log?.log_date || format(new Date(), 'yyyy-MM-dd'),
    log_time: log?.log_time || format(new Date(), 'HH:mm'),
    rink_id: log?.rink_id || '',

    // CO readings
    co_level: log?.co_level?.toString() || '',
    co_status: log?.co_status || 'normal',

    // NO2 readings
    no2_level: log?.no2_level?.toString() || '',
    no2_status: log?.no2_status || 'normal',

    // Environmental data
    temperature: log?.temperature?.toString() || '',
    humidity: log?.humidity?.toString() || '',
    ventilation_status: log?.ventilation_status || 'normal',

    // Notes
    notes: log?.notes || '',
    corrective_actions: log?.corrective_actions || '',

    // Alerts
    has_alerts: log?.has_alerts || false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (log) {
      setFormData({
        log_date: log.log_date,
        log_time: log.log_time || '',
        rink_id: log.rink_id || '',
        co_level: log.co_level?.toString() || '',
        co_status: log.co_status || 'normal',
        no2_level: log.no2_level?.toString() || '',
        no2_status: log.no2_status || 'normal',
        temperature: log.temperature?.toString() || '',
        humidity: log.humidity?.toString() || '',
        ventilation_status: log.ventilation_status || 'normal',
        notes: log.notes || '',
        corrective_actions: log.corrective_actions || '',
        has_alerts: log.has_alerts || false,
      });
    }
  }, [log]);

  // Check for alerts and warnings whenever levels change
  useEffect(() => {
    const newWarnings: string[] = [];
    const coLevel = parseFloat(formData.co_level);
    const no2Level = parseFloat(formData.no2_level);

    if (coLevel && coLevel >= thresholds.co_danger_threshold) {
      newWarnings.push(`🚨 DANGER: CO level (${coLevel} ppm) exceeds danger threshold (${thresholds.co_danger_threshold} ppm)`);
    } else if (coLevel && coLevel >= thresholds.co_warning_threshold) {
      newWarnings.push(`⚠️ WARNING: CO level (${coLevel} ppm) exceeds warning threshold (${thresholds.co_warning_threshold} ppm)`);
    }

    if (no2Level && no2Level >= thresholds.no2_danger_threshold) {
      newWarnings.push(`🚨 DANGER: NO2 level (${no2Level} ppm) exceeds danger threshold (${thresholds.no2_danger_threshold} ppm)`);
    } else if (no2Level && no2Level >= thresholds.no2_warning_threshold) {
      newWarnings.push(`⚠️ WARNING: NO2 level (${no2Level} ppm) exceeds warning threshold (${thresholds.no2_warning_threshold} ppm)`);
    }

    setWarnings(newWarnings);
  }, [formData.co_level, formData.no2_level, thresholds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const coLevel = formData.co_level ? parseFloat(formData.co_level) : null;
      const no2Level = formData.no2_level ? parseFloat(formData.no2_level) : null;

      // Determine statuses
      let coStatus = 'normal';
      if (coLevel !== null) {
        if (coLevel >= thresholds.co_danger_threshold) coStatus = 'danger';
        else if (coLevel >= thresholds.co_warning_threshold) coStatus = 'warning';
      }

      let no2Status = 'normal';
      if (no2Level !== null) {
        if (no2Level >= thresholds.no2_danger_threshold) no2Status = 'danger';
        else if (no2Level >= thresholds.no2_warning_threshold) no2Status = 'warning';
      }

      const hasAlerts = coStatus !== 'normal' || no2Status !== 'normal';

      const submitData: any = {
        facility_id: facilityId,
        log_date: formData.log_date,
        log_time: formData.log_time || null,
        rink_id: formData.rink_id || null,
        co_level: coLevel,
        co_status: coStatus,
        no2_level: no2Level,
        no2_status: no2Status,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        humidity: formData.humidity ? parseFloat(formData.humidity) : null,
        ventilation_status: formData.ventilation_status,
        notes: formData.notes || null,
        corrective_actions: formData.corrective_actions || null,
        has_alerts: hasAlerts,
      };

      if (log) {
        submitData.id = log.id;
      }

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving air quality log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-orange-500 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Air Quality Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm font-medium text-orange-900">
                  {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Log Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
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

            <div className="space-y-2">
              <Label htmlFor="log_time">
                Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="log_time"
                type="time"
                value={formData.log_time}
                onChange={(e) => handleChange('log_time', e.target.value)}
                required
              />
            </div>

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
        </CardContent>
      </Card>

      {/* CO Readings */}
      <Card>
        <CardHeader>
          <CardTitle>Carbon Monoxide (CO) Readings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="co_level">CO Level (ppm)</Label>
            <Input
              id="co_level"
              type="number"
              step="0.1"
              value={formData.co_level}
              onChange={(e) => handleChange('co_level', e.target.value)}
              placeholder="e.g., 5.2"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Normal: Below {thresholds.co_warning_threshold} ppm</p>
              <p>• Warning: {thresholds.co_warning_threshold} - {thresholds.co_danger_threshold} ppm</p>
              <p>• Danger: Above {thresholds.co_danger_threshold} ppm</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NO2 Readings */}
      <Card>
        <CardHeader>
          <CardTitle>Nitrogen Dioxide (NO2) Readings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="no2_level">NO2 Level (ppm)</Label>
            <Input
              id="no2_level"
              type="number"
              step="0.01"
              value={formData.no2_level}
              onChange={(e) => handleChange('no2_level', e.target.value)}
              placeholder="e.g., 0.03"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Normal: Below {thresholds.no2_warning_threshold} ppm</p>
              <p>• Warning: {thresholds.no2_warning_threshold} - {thresholds.no2_danger_threshold} ppm</p>
              <p>• Danger: Above {thresholds.no2_danger_threshold} ppm</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Conditions */}
      <Card>
        <CardHeader>
          <CardTitle>Environmental Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°F)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                placeholder="e.g., 55.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="humidity">Humidity (%)</Label>
              <Input
                id="humidity"
                type="number"
                step="0.1"
                value={formData.humidity}
                onChange={(e) => handleChange('humidity', e.target.value)}
                placeholder="e.g., 45.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ventilation_status">Ventilation Status</Label>
              <select
                id="ventilation_status"
                value={formData.ventilation_status}
                onChange={(e) => handleChange('ventilation_status', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="normal">Normal</option>
                <option value="reduced">Reduced</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Notes and Corrective Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Observations</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any observations about air quality, odors, or conditions..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="corrective_actions">Corrective Actions Taken</Label>
            <Textarea
              id="corrective_actions"
              value={formData.corrective_actions}
              onChange={(e) => handleChange('corrective_actions', e.target.value)}
              placeholder="If readings were out of range, what actions were taken..."
              rows={3}
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
          {isSubmitting ? 'Saving...' : log ? 'Update Log' : 'Save Log'}
        </Button>
      </div>
    </form>
  );
}
