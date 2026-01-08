import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface RefrigerationFormProps {
  log?: any;
  rinks: any[];
  fieldConfigs: any[];
  facilityId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function RefrigerationForm({
  log,
  rinks,
  fieldConfigs,
  facilityId,
  onSave,
  onCancel,
}: RefrigerationFormProps) {
  const [formData, setFormData] = useState({
    log_date: log?.log_date || format(new Date(), 'yyyy-MM-dd'),
    log_time: log?.log_time || format(new Date(), 'HH:mm'),
    rink_id: log?.rink_id || '',

    // Standard refrigeration fields
    refrigerant_type: log?.refrigerant_type || '',
    supply_temp: log?.supply_temp?.toString() || '',
    return_temp: log?.return_temp?.toString() || '',
    ambient_temp: log?.ambient_temp?.toString() || '',
    high_pressure: log?.high_pressure?.toString() || '',
    low_pressure: log?.low_pressure?.toString() || '',
    compressor_status: log?.compressor_status || 'running',

    // Custom fields
    custom_fields: log?.custom_fields || {},

    // Notes
    notes: log?.notes || '',

    // Alerts
    has_alerts: log?.has_alerts || false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (log) {
      setFormData({
        log_date: log.log_date,
        log_time: log.log_time || '',
        rink_id: log.rink_id || '',
        refrigerant_type: log.refrigerant_type || '',
        supply_temp: log.supply_temp?.toString() || '',
        return_temp: log.return_temp?.toString() || '',
        ambient_temp: log.ambient_temp?.toString() || '',
        high_pressure: log.high_pressure?.toString() || '',
        low_pressure: log.low_pressure?.toString() || '',
        compressor_status: log.compressor_status || 'running',
        custom_fields: log.custom_fields || {},
        notes: log.notes || '',
        has_alerts: log.has_alerts || false,
      });
    }
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Check for alerts based on threshold values
      const hasAlerts = checkForAlerts();

      const submitData: any = {
        facility_id: facilityId,
        log_date: formData.log_date,
        log_time: formData.log_time || null,
        rink_id: formData.rink_id || null,
        refrigerant_type: formData.refrigerant_type || null,
        supply_temp: formData.supply_temp ? parseFloat(formData.supply_temp) : null,
        return_temp: formData.return_temp ? parseFloat(formData.return_temp) : null,
        ambient_temp: formData.ambient_temp ? parseFloat(formData.ambient_temp) : null,
        high_pressure: formData.high_pressure ? parseFloat(formData.high_pressure) : null,
        low_pressure: formData.low_pressure ? parseFloat(formData.low_pressure) : null,
        compressor_status: formData.compressor_status,
        custom_fields: formData.custom_fields,
        notes: formData.notes || null,
        has_alerts: hasAlerts,
      };

      if (log) {
        submitData.id = log.id;
      }

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving refrigeration log:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkForAlerts = (): boolean => {
    // Check if any values are outside normal ranges
    const supplyTemp = parseFloat(formData.supply_temp);
    const returnTemp = parseFloat(formData.return_temp);
    const highPressure = parseFloat(formData.high_pressure);
    const lowPressure = parseFloat(formData.low_pressure);

    // Example threshold checks (adjust based on facility requirements)
    if (supplyTemp && (supplyTemp < 10 || supplyTemp > 25)) return true;
    if (returnTemp && (returnTemp < 15 || returnTemp > 30)) return true;
    if (highPressure && (highPressure < 150 || highPressure > 300)) return true;
    if (lowPressure && (lowPressure < 20 || lowPressure > 60)) return true;

    // Check custom field thresholds
    for (const config of fieldConfigs) {
      const value = parseFloat(formData.custom_fields[config.field_name]);
      if (value && config.min_threshold && value < config.min_threshold) return true;
      if (value && config.max_threshold && value > config.max_threshold) return true;
    }

    return false;
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      custom_fields: {
        ...prev.custom_fields,
        [fieldName]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

      {/* Temperature Readings */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature Readings (°F)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="supply_temp">Supply Temperature</Label>
              <Input
                id="supply_temp"
                type="number"
                step="0.1"
                value={formData.supply_temp}
                onChange={(e) => handleChange('supply_temp', e.target.value)}
                placeholder="e.g., 18.5"
              />
              <p className="text-xs text-muted-foreground">Normal range: 10-25°F</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="return_temp">Return Temperature</Label>
              <Input
                id="return_temp"
                type="number"
                step="0.1"
                value={formData.return_temp}
                onChange={(e) => handleChange('return_temp', e.target.value)}
                placeholder="e.g., 22.3"
              />
              <p className="text-xs text-muted-foreground">Normal range: 15-30°F</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ambient_temp">Ambient Temperature</Label>
              <Input
                id="ambient_temp"
                type="number"
                step="0.1"
                value={formData.ambient_temp}
                onChange={(e) => handleChange('ambient_temp', e.target.value)}
                placeholder="e.g., 70.0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pressure Readings */}
      <Card>
        <CardHeader>
          <CardTitle>Pressure Readings (PSI)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="high_pressure">High Side Pressure</Label>
              <Input
                id="high_pressure"
                type="number"
                step="0.1"
                value={formData.high_pressure}
                onChange={(e) => handleChange('high_pressure', e.target.value)}
                placeholder="e.g., 225.0"
              />
              <p className="text-xs text-muted-foreground">Normal range: 150-300 PSI</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="low_pressure">Low Side Pressure</Label>
              <Input
                id="low_pressure"
                type="number"
                step="0.1"
                value={formData.low_pressure}
                onChange={(e) => handleChange('low_pressure', e.target.value)}
                placeholder="e.g., 35.0"
              />
              <p className="text-xs text-muted-foreground">Normal range: 20-60 PSI</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="refrigerant_type">Refrigerant Type</Label>
              <select
                id="refrigerant_type"
                value={formData.refrigerant_type}
                onChange={(e) => handleChange('refrigerant_type', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select type...</option>
                <option value="R-404A">R-404A</option>
                <option value="R-507">R-507</option>
                <option value="R-134a">R-134a</option>
                <option value="R-22">R-22</option>
                <option value="R-717">R-717 (Ammonia)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="compressor_status">Compressor Status</Label>
              <select
                id="compressor_status"
                value={formData.compressor_status}
                onChange={(e) => handleChange('compressor_status', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="running">Running</option>
                <option value="idle">Idle</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields */}
      {fieldConfigs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {fieldConfigs.map((config) => (
                <div key={config.id} className="space-y-2">
                  <Label htmlFor={`custom_${config.field_name}`}>
                    {config.label}
                    {config.is_required && <span className="text-destructive"> *</span>}
                  </Label>

                  {config.field_type === 'number' && (
                    <>
                      <Input
                        id={`custom_${config.field_name}`}
                        type="number"
                        step="0.1"
                        value={formData.custom_fields[config.field_name] || ''}
                        onChange={(e) => handleCustomFieldChange(config.field_name, e.target.value)}
                        placeholder={config.placeholder || ''}
                        required={config.is_required}
                      />
                      {(config.min_threshold || config.max_threshold) && (
                        <p className="text-xs text-muted-foreground">
                          Normal range: {config.min_threshold || '—'} - {config.max_threshold || '—'} {config.unit}
                        </p>
                      )}
                    </>
                  )}

                  {config.field_type === 'text' && (
                    <Input
                      id={`custom_${config.field_name}`}
                      type="text"
                      value={formData.custom_fields[config.field_name] || ''}
                      onChange={(e) => handleCustomFieldChange(config.field_name, e.target.value)}
                      placeholder={config.placeholder || ''}
                      required={config.is_required}
                    />
                  )}

                  {config.field_type === 'select' && config.options && (
                    <select
                      id={`custom_${config.field_name}`}
                      value={formData.custom_fields[config.field_name] || ''}
                      onChange={(e) => handleCustomFieldChange(config.field_name, e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      required={config.is_required}
                    >
                      <option value="">Select...</option>
                      {config.options.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Any observations, maintenance notes, or issues..."
            rows={4}
          />
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
