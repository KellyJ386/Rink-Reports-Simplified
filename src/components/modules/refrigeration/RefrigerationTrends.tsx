import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useState } from 'react';

interface RefrigerationTrendsProps {
  logs: any[];
  rinks: any[];
}

export function RefrigerationTrends({ logs, rinks }: RefrigerationTrendsProps) {
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
    supplyTemp: log.supply_temp,
    returnTemp: log.return_temp,
    ambientTemp: log.ambient_temp,
    highPressure: log.high_pressure,
    lowPressure: log.low_pressure,
  })).sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

  // Calculate statistics
  const stats = {
    avgSupplyTemp: filteredLogs.reduce((sum, log) => sum + (log.supply_temp || 0), 0) / filteredLogs.length || 0,
    avgReturnTemp: filteredLogs.reduce((sum, log) => sum + (log.return_temp || 0), 0) / filteredLogs.length || 0,
    avgHighPressure: filteredLogs.reduce((sum, log) => sum + (log.high_pressure || 0), 0) / filteredLogs.length || 0,
    avgLowPressure: filteredLogs.reduce((sum, log) => sum + (log.low_pressure || 0), 0) / filteredLogs.length || 0,
    alertsCount: filteredLogs.filter((log) => log.has_alerts).length,
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
      <div className="grid gap-6 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Supply Temp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSupplyTemp.toFixed(1)}°F</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Return Temp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgReturnTemp.toFixed(1)}°F</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg High Pressure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgHighPressure.toFixed(1)} PSI</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Low Pressure</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgLowPressure.toFixed(1)} PSI</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alerts Triggered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.alertsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Temperature Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Temperature Trends</CardTitle>
          <CardDescription>Supply, return, and ambient temperatures over time</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="supplyTemp"
                  stroke="#3b82f6"
                  name="Supply Temp"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="returnTemp"
                  stroke="#10b981"
                  name="Return Temp"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="ambientTemp"
                  stroke="#f59e0b"
                  name="Ambient Temp"
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

      {/* Pressure Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Pressure Trends</CardTitle>
          <CardDescription>High side and low side pressure readings over time</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Pressure (PSI)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="highPressure"
                  stroke="#ef4444"
                  name="High Pressure"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="lowPressure"
                  stroke="#06b6d4"
                  name="Low Pressure"
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

      {/* Alerts Summary */}
      {stats.alertsCount > 0 && (
        <Card className="border-orange-400">
          <CardHeader>
            <CardTitle className="text-orange-600 flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Alert Summary
            </CardTitle>
            <CardDescription>
              {stats.alertsCount} log{stats.alertsCount !== 1 ? 's' : ''} with out-of-range values detected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Review the logs marked with warning icons to identify and address potential system issues.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
