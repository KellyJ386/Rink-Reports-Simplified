import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { USAHockeyRink } from './USAHockeyRink';
import { calculateStatistics, formatDepth } from '@/lib/iceDepthUtils';
import { AlertCircle, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Point {
  id: number;
  x: number;
  y: number;
  name?: string;
}

interface Template {
  id: string;
  template_name: string;
  point_count: number;
  template_data: {
    points: Point[];
  };
}

interface MeasurementFormProps {
  template: Template;
  rinkId: string;
  facilityLogo?: string;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  template,
  rinkId,
  facilityLogo,
  onSave,
  onCancel,
}) => {
  const [unit, setUnit] = useState<'in' | 'mm'>('in');
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [notes, setNotes] = useState('');
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [saving, setSaving] = useState(false);

  const points = template.template_data.points;
  const currentPoint = points[currentPointIndex];
  const stats = calculateStatistics(measurements, unit);
  const completedPoints = Object.keys(measurements).length;
  const totalPoints = points.length;

  // Handle manual input
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  const handleNextPoint = () => {
    if (!inputValue || parseFloat(inputValue) <= 0) {
      toast.error('Please enter a valid measurement');
      return;
    }

    const measurementKey = `Point ${currentPoint.id}`;
    setMeasurements({
      ...measurements,
      [measurementKey]: parseFloat(inputValue),
    });

    setInputValue('');

    // Move to next point
    if (currentPointIndex < points.length - 1) {
      setCurrentPointIndex(currentPointIndex + 1);
    } else {
      toast.success('All points measured!');
    }
  };

  // Handle point click on diagram
  const handlePointClick = (pointId: number) => {
    const index = points.findIndex(p => p.id === pointId);
    if (index !== -1) {
      setCurrentPointIndex(index);
    }
  };

  // Bluetooth caliper connection (placeholder)
  const connectBluetooth = async () => {
    try {
      // Check if Web Bluetooth API is available
      if (!navigator.bluetooth) {
        toast.error('Bluetooth not supported in this browser');
        return;
      }

      toast.info('Bluetooth connection coming soon');
      // Actual implementation would request device and connect
      // const device = await navigator.bluetooth.requestDevice({...});
    } catch (error) {
      toast.error('Failed to connect to Bluetooth device');
    }
  };

  // Handle save
  const handleSave = async (exportPdf = false) => {
    if (completedPoints < totalPoints) {
      toast.error(`Please measure all ${totalPoints} points (${completedPoints} completed)`);
      return;
    }

    setSaving(true);

    try {
      await onSave({
        template_id: template.id,
        rink_id: rinkId,
        measurements,
        unit,
        statistics: stats,
        notes,
        measurement_date: new Date().toISOString().split('T')[0],
        measurement_time: new Date().toTimeString().split(' ')[0],
        template_type: template.template_name,
        min_depth: stats.min,
        max_depth: stats.max,
        avg_depth: stats.avg,
        status: stats.status,
        min_depth_point_id: stats.minPoint,
        max_depth_point_id: stats.maxPoint,
      });

      toast.success('Measurement saved successfully');

      if (exportPdf) {
        toast.info('PDF export coming soon');
      }
    } catch (error) {
      toast.error('Failed to save measurement');
    } finally {
      setSaving(false);
    }
  };

  // Status icon
  const StatusIcon = () => {
    if (stats.status === 'critical') return <AlertCircle className="h-5 w-5 text-red-600" />;
    if (stats.status === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ice Depth Measurement</h2>
          <p className="text-muted-foreground">Template: {template.template_name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={completedPoints < totalPoints || saving}
          >
            Save Measurement
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={completedPoints < totalPoints || saving}
          >
            <Download className="mr-2 h-4 w-4" />
            Save & Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Rink diagram */}
        <Card>
          <CardHeader>
            <CardTitle>Rink Diagram</CardTitle>
            <CardDescription>
              Progress: {completedPoints} of {totalPoints} points measured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <USAHockeyRink
              showPoints
              points={points}
              measurements={measurements}
              currentPointId={currentPoint?.id}
              onPointClick={handlePointClick}
              unit={unit}
              facilityLogo={facilityLogo}
              className="border rounded-lg"
            />
            <div className="mt-4 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>1-1.75" (optimal)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span>&gt;1.75" (thick)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>&lt;1" (thin)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Measurement input */}
        <div className="space-y-6">
          {/* Unit selection */}
          <Card>
            <CardHeader>
              <CardTitle>Unit Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={unit === 'in' ? 'default' : 'outline'}
                  onClick={() => setUnit('in')}
                  className="flex-1"
                >
                  Inches
                </Button>
                <Button
                  variant={unit === 'mm' ? 'default' : 'outline'}
                  onClick={() => setUnit('mm')}
                  className="flex-1"
                >
                  Millimeters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bluetooth connection */}
          <Card>
            <CardHeader>
              <CardTitle>Bluetooth Caliper</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={connectBluetooth}
                className="w-full"
                disabled={bluetoothConnected}
              >
                {bluetoothConnected ? '✓ Connected' : 'Connect Bluetooth Caliper'}
              </Button>
            </CardContent>
          </Card>

          {/* Current point input */}
          <Card>
            <CardHeader>
              <CardTitle>Current Point: {currentPoint?.id}</CardTitle>
              <CardDescription>
                {currentPoint?.name || `Point ${currentPoint?.id}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNextPoint()}
                  placeholder={`Enter depth in ${unit}`}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button onClick={handleNextPoint}>
                  {currentPointIndex < points.length - 1 ? 'Next' : 'Finish'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Live statistics */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Statistics</CardTitle>
                <StatusIcon />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Points Measured:</span>
                  <span className="font-semibold">{completedPoints}/{totalPoints}</span>
                </div>
                {completedPoints > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Minimum:</span>
                      <span className="font-semibold text-red-600">
                        {formatDepth(stats.min, unit)}
                        {stats.minPoint && ` at Point ${stats.minPoint}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Maximum:</span>
                      <span className="font-semibold text-yellow-600">
                        {formatDepth(stats.max, unit)}
                        {stats.maxPoint && ` at Point ${stats.maxPoint}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average:</span>
                      <span className="font-semibold text-green-600">
                        {formatDepth(stats.avg, unit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Std Dev:</span>
                      <span className="font-semibold">
                        {formatDepth(stats.stdDev, unit)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-semibold ${
                        stats.status === 'critical' ? 'text-red-600' :
                        stats.status === 'warning' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {stats.status.toUpperCase()}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any observations or notes..."
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
