import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { useState } from 'react';

interface AirQualityTrendsProps {
  logs: any[];
  rinks: any[];
  thresholds: any;
}

export function AirQualityTrends({ logs, rinks, thresholds }: AirQualityTrendsProps) {
  const [selectedRink, setSelectedRink] = useState<string>('');
  const [daysRange, setDaysRange] = useState<number>(7);

  // Filter logs by selected rink
  const filteredLogs = selectedRink
    ? logs.filter((log) => log.rink_id === selectedRink)
    : logs;

  // Prepare data for charts
  const chartData = filteredLogs.map((log) => ({
    date: format(new Date(log.log_date + (log.log_time ? `T${log.log_time}` : '')), 'MMM d'),
    fullDate: new Date(log.log_date + (log.log_time ? `T${log.log_time}` : '')),
    co: log.co_level,
    no2: log.no2_level,
    temperature: log.temperature,
    humidity: log.humidity,
  })).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

  // Calculate statistics
  const stats = {
    avgCo: filteredLogs.reduce((sum, log) => sum + (log.co_level || 0), 0) / filteredLogs.length || 0,
    maxCo: Math.max(...filteredLogs.map((log) => log.co_level || 0)),
    avgNo2: filteredLogs.reduce((sum, log) => sum + (log.no2_level || 0), 0) / filteredLogs.length || 0,
    maxNo2: Math.max(...filteredLogs.map((log) => log.no2_level || 0)),
    alertsCount: filteredLogs.filter((log) => log.has_alerts).length,
    dangerCount: filteredLogs.filter((log) => log.co_status === 'danger' || log.no2_status === 'danger').length,
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trend Analysis Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rink_filter">Filter by Rink</Label>
              <select
                id="rink_filter"
                value={selectedRink}
                onChange={(e) => setSelectedRink(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All Rinks</option>
                {rinks.map((rink) => (
                  <option key={rink.id} value={rink.id}>
                    {rink.rink_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Time Range</Label>
              <div className="flex gap-2">
                <Button
                  variant={daysRange === 7 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDaysRange(7)}
                >
                  7 Days
                </Button>
                <Button
                  variant={daysRange === 30 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDaysRange(30)}
                >
                  30 Days
                </Button>
                <Button
                  variant={daysRange === 90 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDaysRange(90)}
                >
                  90 Days
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg CO Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCo.toFixed(1)} ppm</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Max CO Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maxCo.toFixed(1)} ppm</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg NO2 Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgNo2.toFixed(2)} ppm</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Max NO2 Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.maxNo2.toFixed(2)} ppm</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.alertsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Danger Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.dangerCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* CO Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Carbon Monoxide (CO) Trends</CardTitle>
          <CardDescription>CO levels over time with threshold indicators</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'CO (ppm)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <ReferenceLine
                  y={thresholds.co_warning_threshold}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label="Warning"
                />
                <ReferenceLine
                  y={thresholds.co_danger_threshold}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label="Danger"
                />
                <Line
                  type="monotone"
                  dataKey="co"
                  stroke="#3b82f6"
                  name="CO Level"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No data available for the selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* NO2 Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Nitrogen Dioxide (NO2) Trends</CardTitle>
          <CardDescription>NO2 levels over time with threshold indicators</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'NO2 (ppm)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <ReferenceLine
                  y={thresholds.no2_warning_threshold}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label="Warning"
                />
                <ReferenceLine
                  y={thresholds.no2_danger_threshold}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label="Danger"
                />
                <Line
                  type="monotone"
                  dataKey="no2"
                  stroke="#10b981"
                  name="NO2 Level"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No data available for the selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Environmental Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Environmental Conditions</CardTitle>
          <CardDescription>Temperature and humidity trends</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Humidity (%)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temperature"
                  stroke="#f59e0b"
                  name="Temperature"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="humidity"
                  stroke="#06b6d4"
                  name="Humidity"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No data available for the selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Summary */}
      <Card className={stats.dangerCount > 0 ? 'border-red-400' : stats.alertsCount > 0 ? 'border-orange-400' : 'border-green-400'}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${stats.dangerCount > 0 ? 'text-red-600' : stats.alertsCount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            <span className="text-2xl">
              {stats.dangerCount > 0 ? '🚨' : stats.alertsCount > 0 ? '⚠️' : '✅'}
            </span>
            Air Quality Compliance Summary
          </CardTitle>
          <CardDescription>
            {stats.dangerCount > 0
              ? `${stats.dangerCount} danger event${stats.dangerCount !== 1 ? 's' : ''} detected - immediate action required`
              : stats.alertsCount > 0
              ? `${stats.alertsCount} warning${stats.alertsCount !== 1 ? 's' : ''} detected - monitor closely`
              : 'All readings within acceptable ranges'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>CO Threshold:</strong> Warning at {thresholds.co_warning_threshold} ppm, Danger at {thresholds.co_danger_threshold} ppm</p>
            <p><strong>NO2 Threshold:</strong> Warning at {thresholds.no2_warning_threshold} ppm, Danger at {thresholds.no2_danger_threshold} ppm</p>
            {stats.dangerCount > 0 && (
              <p className="text-red-600 font-medium mt-4">
                ⚠️ Danger levels detected. Review ventilation systems, evacuate if necessary, and contact facility management.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
