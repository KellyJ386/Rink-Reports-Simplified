import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface CircleCheckFormProps {
  log: any;
  machines: any[];
  facilityId: string;
  onSave: (data: any) => void;
  onCancel: () => void;
}

type ChecklistItem = {
  id: string;
  label: string;
  category?: string;
};

const GAS_CHECKLIST: ChecklistItem[] = [
  { id: 'tank_snow_tank_safety', label: '1. Tank Up and Snow Tank Safety Stand in Place', category: 'general' },
  { id: 'ignition_secure', label: '2. Key out of Ignition and Secure in your Possession', category: 'general' },
  { id: 'exhaust_system', label: '3. Exhaust System Condition', category: 'general' },
  { id: 'fuel_line', label: '4. Fuel Line Condition', category: 'general' },
  { id: 'fuel_levels_connections', label: '5. Fuel levels and Connections/Hoses/Tanks Secure', category: 'general' },
  { id: 'belts', label: '6. Belts', category: 'general' },
  { id: 'snow_tank_seal', label: '7. Snow Tank Seal', category: 'general' },
  { id: 'hydraulic_hoses', label: '8. Hydraulic Hoses and Couplers', category: 'general' },
  { id: 'battery_cables', label: '9. Battery and Cables', category: 'general' },
  { id: 'spark_plugs', label: '10. Spark Plugs', category: 'general' },
  { id: 'radiator_hoses', label: '11. Radiator and Radiator Hoses', category: 'general' },
  { id: 'air_filter', label: '12. Air Filter', category: 'general' },
  { id: 'leaf_springs', label: '13. Leaf Springs', category: 'general' },
  { id: 'brake_lines', label: '14. Brake Lines', category: 'general' },
  { id: 'fluid_levels', label: '15. Fluid Levels', category: 'general' },
  { id: 'hydraulic_bypass', label: '16. Hydraulic Bypass Open or Closed', category: 'general' },
  { id: 'u_joints', label: '17. U joints', category: 'general' },
  { id: 'tires_pressure', label: '18. Tires (Condition and Pressure)/Hubs/Studs/Nuts', category: 'general' },
  { id: 'board_brush_condition', label: '19. Board Brush Condition/Arm Bushing', category: 'general' },
  { id: 'guide_wheel', label: '20. Guide Wheel Condition', category: 'general' },
  { id: 'head_tail_lights', label: '21. Head Lights/Tail Light', category: 'general' },
  { id: 'vertical_auger_movement', label: '22. Vertical Auger Movement and Check Guard', category: 'general' },
  { id: 'lift_conditioner_blade', label: '23. Lift Conditioner to Observe Blade and Runner Condition', category: 'general' },
  { id: 'conditioner_bushings', label: '24. Conditioner/Lift Arm/Bushings', category: 'general' },
  { id: 'snow_breaker', label: '25. Snow Breaker Condition', category: 'general' },
  { id: 'blade_adjustment_wheel', label: '26. Blade Adjustment Wheel', category: 'general' },
  { id: 'towel_squeegee', label: '27. Towel and Squeegee Condition', category: 'general' },
  { id: 'flood_pipe', label: '28. Flood Pipe Condition', category: 'general' },
  { id: 'horizontal_auger_bearings', label: '29. Horizontal Auger Movement and Condition of Bearings', category: 'general' },
  { id: 'gauges_steering', label: '30. Gauges/Steering Wheel/Horn', category: 'general' },
  { id: 'blade_bar', label: '31. Blade Bar', category: 'general' },
  { id: 'conditioner_leaf_springs', label: '32. Conditioner Leaf Springs', category: 'general' },
  { id: 'auger_flighting', label: '33. Auger Flighting', category: 'general' },
  { id: 'hour_meter', label: '34. Hour Meter Reading', category: 'general' },
  { id: 'voltmeter', label: '35. Voltmeter', category: 'general' },
  { id: 'temperature', label: '36. Temperature', category: 'general' },
  { id: 'tachometer', label: '37. Tachometer', category: 'general' },
  { id: 'water_fill', label: '38. Water Fill', category: 'general' },
  { id: 'seat_armrest', label: '39. Seat/Armrest', category: 'general' },
  { id: 'poly_water_tank', label: '40. Poly Water Tank Inspection', category: 'general' },
  { id: 'snow_tank_inspection', label: '41. Snow Tank Inspection', category: 'general' },
  { id: 'brake_pedal', label: '42. Brake and Brake Pedal', category: 'general' },
  { id: 'ice_making_water_valves', label: '43. Ice Making Water and Wash Water Valves', category: 'general' },
  { id: 'step_areas_clean', label: '44. Step Areas Clean and Clear', category: 'general' },
  { id: 'control_levers', label: '45. Control Levers', category: 'general' },
  { id: 'wash_water_pump', label: '46. Wash Water Pump', category: 'general' },
  { id: 'conveyor_belt_chain', label: '47. Conveyor Drive Belt and Chain', category: 'general' },
  { id: 'body_condition_labels', label: '48. Inspect Body Condition and Safety Labels', category: 'general' },
  { id: 'hydraulic_oil_level', label: '49. Hydraulic Oil Level', category: 'general' },
  { id: 'hydraulic_oil_filter', label: '50. Hydraulic Oil Filter', category: 'general' },
  { id: 'hydraulic_oil_filter_51', label: '51. Hydraulic Oil Filter', category: 'general' },
  { id: 'exhaust_shield', label: 'Exhaust Shield (Canadian Models)', category: 'optional' },
  { id: 'fire_extinguisher', label: 'Fire Extinguisher', category: 'optional' },
  { id: 'beacon_light', label: 'Beacon Light', category: 'optional' },
  { id: 'backup_alarm', label: 'Backup Alarm', category: 'optional' },
  { id: 'tire_wash_water', label: 'Tire Wash Water', category: 'optional' },
  { id: 'seatbelt', label: 'Seatbelt', category: 'optional' },
];

const ELECTRIC_CHECKLIST: ChecklistItem[] = [
  { id: 'head_tail_lights', label: '1. Head Lights/Tail Light', category: 'general' },
  { id: 'hour_meter', label: '2. Hour Meter Reading', category: 'general' },
  { id: 'battery_gauge', label: '3. Battery Gauge', category: 'general' },
  { id: 'wash_water_fill', label: '4. Wash Water Fill', category: 'general' },
  { id: 'blade_adjustment_wheel', label: '5. Blade Adjustment Wheel', category: 'general' },
  { id: 'ice_making_water', label: '6. Ice Making Water', category: 'general' },
  { id: 'lift_conditioner_blade', label: '7. Lift Conditioner to Observe Blade and Runner Condition', category: 'general' },
  { id: 'flood_pipe', label: '8. Flood Pipe Condition', category: 'general' },
  { id: 'towel_squeegee', label: '9. Towel and Squeegee Condition', category: 'general' },
  { id: 'snow_breaker', label: '10. Snow Breaker Condition', category: 'general' },
  { id: 'snow_tank_inspection', label: '11. Snow Tank Inspection', category: 'general' },
  { id: 'body_condition_labels', label: '12. Inspect Body Condition and Safety Labels', category: 'general' },
  { id: 'poly_water_tank', label: '13. Poly Water Tank Inspection', category: 'general' },
  { id: 'vertical_auger_movement', label: '14. Vertical Auger Movement and Check Guard', category: 'general' },
  { id: 'tank_snow_tank_safety', label: '15. Tank Up and Snow Tank Safety Stand in Place', category: 'general' },
  { id: 'steering_wheel', label: '16. Steering Wheel/Horn', category: 'general' },
  { id: 'control_levers', label: '17. Control Levers', category: 'general' },
  { id: 'ignition_secure', label: '18. Key out of Ignition and Secure in your Possession', category: 'general' },
  { id: 'wash_water_valves', label: '19. Wash Water Valves', category: 'general' },
  { id: 'seat_armrest', label: '20. Seat/Armrest', category: 'general' },
  { id: 'foot_brake_pedal', label: '21. Foot and Brake Pedal', category: 'general' },
  { id: 'conditioner_bushings', label: '22. Conditioner/Lift Arm/Bushings', category: 'general' },
  { id: 'safety_guards', label: '23. Safety Guards including Conditioner Guards', category: 'general' },
  { id: 'horizontal_auger_bearings', label: '24. Horizontal Auger Movement and Condition of Bearings', category: 'general' },
  { id: 'step_areas_clean', label: '25. Step Areas Clean and Clear', category: 'general' },
  { id: 'tires_pressure', label: '26. Tires (Condition and Pressure)/Hubs Studs/Nuts', category: 'general' },
  { id: 'board_brush_condition', label: '27. Board Brush Condition/Arm Bushing', category: 'general' },
  { id: 'guide_wheel', label: '28. Guide Wheel Condition', category: 'general' },
  { id: 'snow_tank_seal', label: '29. Snow Tank Seal', category: 'general' },
  { id: 'u_joints', label: '30. U-Joints', category: 'general' },
  { id: 'hydraulic_hoses', label: '31. Hydraulic Hoses + Couplers (Multiple Locations)', category: 'general' },
  { id: 'leaf_springs', label: '32. Leaf Springs', category: 'general' },
  { id: 'conveyor_belt_chain', label: '33. Conveyor Drive Belt and Chain', category: 'general' },
  { id: 'wash_water_pump', label: '34. Wash Water Pump', category: 'general' },
  { id: 'brake_lines', label: '35. Brake Lines', category: 'general' },
  { id: 'hydraulic_oil_level', label: '36. Hydraulic Oil Level', category: 'general' },
  { id: 'brake_fluid', label: '37. Brake Fluid', category: 'general' },
  { id: 'blade_bar', label: '38. Blade Bar', category: 'general' },
  { id: 'conditioner_leaf_springs', label: '39. Conditioner Leaf Springs', category: 'general' },
  { id: 'auger_flighting', label: '40. Auger Flighting', category: 'general' },
  { id: 'battery_cables', label: '41. Battery + Cables', category: 'general' },
  { id: 'fire_extinguisher', label: 'Fire Extinguisher', category: 'optional' },
  { id: 'beacon_light', label: 'Beacon Light', category: 'optional' },
  { id: 'backup_alarm', label: 'Backup Alarm', category: 'optional' },
  { id: 'tire_wash_water', label: 'Tire Wash Water', category: 'optional' },
  { id: 'seatbelt', label: 'Seatbelt', category: 'optional' },
  { id: 'other_equipment', label: 'Other Optional Equipment and Systems', category: 'optional' },
];

export function CircleCheckForm({ log, machines, facilityId, onSave, onCancel }: CircleCheckFormProps) {
  const [formData, setFormData] = useState({
    log_date: format(new Date(), 'yyyy-MM-dd'),
    log_time: '',
    machine_id: '',
    machine_type: 'gas' as 'gas' | 'electric',
    checklist_items: {} as Record<string, boolean>,
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (log) {
      setFormData({
        log_date: log.log_date,
        log_time: log.log_time || '',
        machine_id: log.machine_id,
        machine_type: log.machine_type || 'gas',
        checklist_items: log.checklist_items || {},
        notes: log.notes || '',
      });
    }
  }, [log]);

  // Update machine type when machine is selected
  useEffect(() => {
    if (formData.machine_id && machines.length > 0) {
      const selectedMachine = machines.find((m) => m.id === formData.machine_id);
      if (selectedMachine && selectedMachine.fuel_type) {
        const type = selectedMachine.fuel_type === 'electric' ? 'electric' : 'gas';
        setFormData((prev) => ({ ...prev, machine_type: type }));
      }
    }
  }, [formData.machine_id, machines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData: any = {
        facility_id: facilityId,
        maintenance_type: 'circle_check',
        log_date: formData.log_date,
        log_time: formData.log_time || null,
        machine_id: formData.machine_id,
        machine_type: formData.machine_type,
        checklist_items: formData.checklist_items,
        notes: formData.notes || null,
      };

      if (log) {
        submitData.id = log.id;
      }

      await onSave(submitData);
    } catch (error) {
      console.error('Error saving circle check:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChecklistToggle = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      checklist_items: {
        ...prev.checklist_items,
        [itemId]: !prev.checklist_items[itemId],
      },
    }));
  };

  const checklist = formData.machine_type === 'gas' ? GAS_CHECKLIST : ELECTRIC_CHECKLIST;
  const generalItems = checklist.filter((item) => item.category !== 'optional');
  const optionalItems = checklist.filter((item) => item.category === 'optional');

  const checkedCount = Object.values(formData.checklist_items).filter(Boolean).length;
  const totalCount = checklist.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{log ? 'Edit Circle Check' : 'New Circle Check'}</CardTitle>
          <div className="text-sm text-muted-foreground">
            {checkedCount} of {totalCount} items checked
          </div>
        </div>
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
                  {machine.machine_name} - {machine.model} ({machine.fuel_type || 'gas'})
                </option>
              ))}
            </select>
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">
                Circle Check Inspection Points ({formData.machine_type.toUpperCase()})
              </Label>
              <div className="text-sm">
                <span className={checkedCount === totalCount ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                  {Math.round((checkedCount / totalCount) * 100)}% complete
                </span>
              </div>
            </div>

            {/* General Items */}
            <div className="border rounded-md p-4 space-y-2 max-h-96 overflow-y-auto">
              {generalItems.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start space-x-3 py-2 px-2 hover:bg-accent rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!!formData.checklist_items[item.id]}
                    onChange={() => handleChecklistToggle(item.id)}
                    className="h-4 w-4 mt-0.5 rounded border-gray-300"
                  />
                  <span className="text-sm flex-1">{item.label}</span>
                </label>
              ))}
            </div>

            {/* Optional Items */}
            {optionalItems.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Optional Equipment</Label>
                <div className="border rounded-md p-4 space-y-2">
                  {optionalItems.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start space-x-3 py-2 px-2 hover:bg-accent rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!formData.checklist_items[item.id]}
                        onChange={() => handleChecklistToggle(item.id)}
                        className="h-4 w-4 mt-0.5 rounded border-gray-300"
                      />
                      <span className="text-sm flex-1">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Document any issues found, repairs needed, or additional observations..."
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
