import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Wind, TrendingUp, Settings, Filter } from 'lucide-react';
import { useFacilityInfo, useRinks } from '@/hooks/useIceDepth';
import {
  useAirQualityLogs,
  useAirQualityTrends,
  useCreateAirQualityLog,
  useUpdateAirQualityLog,
  useDeleteAirQualityLog,
  useThresholdConfigurations,
} from '@/hooks/useAirQuality';
import { AirQualityForm } from '@/components/modules/air-quality/AirQualityForm';
import { AirQualityList } from '@/components/modules/air-quality/AirQualityList';
import { AirQualityTrends } from '@/components/modules/air-quality/AirQualityTrends';

type ViewType = 'logs' | 'trends' | 'settings';

export function AirQualityPage() {
  const [activeView, setActiveView] = useState<ViewType>('logs');
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    rinkId: '',
    hasAlerts: undefined as boolean | undefined,
  });

  const { data: facility } = useFacilityInfo();
  const facilityId = facility?.id || null;
  const { data: rinks = [] } = useRinks(facilityId);
  const { data: logs = [] } = useAirQualityLogs(facilityId, filters);
  const { data: trendData = [] } = useAirQualityTrends(facilityId, filters.rinkId, 30);
  const { data: thresholds } = useThresholdConfigurations(facilityId);

  // Mutations
  const createLog = useCreateAirQualityLog();
  const updateLog = useUpdateAirQualityLog();
  const deleteLog = useDeleteAirQualityLog();

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter((log: any) => log.log_date === today).length;

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const thisWeekLogs = logs.filter((log: any) => log.log_date >= thisWeekStart.toISOString().split('T')[0]).length;

  const alertsCount = logs.filter((log: any) => log.has_alerts).length;
  const dangerCount = logs.filter((log: any) => log.co_status === 'danger' || log.no2_status === 'danger').length;

  // Handlers
  const handleCreateNew = () => {
    setEditingLog(null);
    setShowForm(true);
  };

  const handleEdit = (log: any) => {
    setEditingLog(log);
    setShowForm(true);
  };

  const handleDelete = async (log: any) => {
    if (window.confirm('Are you sure you want to delete this air quality log?')) {
      try {
        await deleteLog.mutateAsync(log.id);
      } catch (error) {
        console.error('Error deleting log:', error);
      }
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingLog) {
        await updateLog.mutateAsync(data);
      } else {
        await createLog.mutateAsync(data);
      }
      setShowForm(false);
      setEditingLog(null);
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLog(null);
  };

  const handleFilterChange = (field: string, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      rinkId: '',
      hasAlerts: undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Air Quality Log</h1>
          <p className="text-muted-foreground mt-2">
            Monitor CO and NO2 levels for safety compliance
          </p>
        </div>
        <div className="flex gap-2">
          {!showForm && activeView === 'logs' && (
            <>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                New Log
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      {!showForm && (
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Logs</CardTitle>
              <CardDescription>Readings recorded today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayLogs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Week</CardTitle>
              <CardDescription>Past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{thisWeekLogs}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Warning threshold exceeded</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{alertsCount}</div>
            </CardContent>
          </Card>

          <Card className={dangerCount > 0 ? 'border-red-400' : ''}>
            <CardHeader>
              <CardTitle>Danger Events</CardTitle>
              <CardDescription>Critical levels detected</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{dangerCount}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      {!showForm && (
        <div className="border-b">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveView('logs')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${
                activeView === 'logs'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wind className="h-4 w-4" />
              Logs
            </button>
            <button
              onClick={() => setActiveView('trends')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${
                activeView === 'trends'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Trends & Compliance
            </button>
            <button
              onClick={() => setActiveView('settings')}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${
                activeView === 'settings'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="h-4 w-4" />
              Threshold Settings
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && !showForm && activeView === 'logs' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filter Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="rink_filter">Rink</Label>
                <select
                  id="rink_filter"
                  value={filters.rinkId}
                  onChange={(e) => handleFilterChange('rinkId', e.target.value)}
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
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alert_filter">Alert Status</Label>
                <select
                  id="alert_filter"
                  value={filters.hasAlerts === undefined ? '' : filters.hasAlerts.toString()}
                  onChange={(e) => handleFilterChange('hasAlerts', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">All Logs</option>
                  <option value="true">With Alerts Only</option>
                  <option value="false">Normal Only</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button variant="outline" onClick={handleClearFilters} className="w-full">
                  Clear Filters
                </Button>
              </div>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {logs.length} log{logs.length !== 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <div>
        {showForm ? (
          <AirQualityForm
            log={editingLog}
            rinks={rinks}
            thresholds={thresholds}
            facilityId={facilityId || ''}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : activeView === 'logs' ? (
          logs.length === 0 && !filters.startDate && !filters.endDate && !filters.rinkId && filters.hasAlerts === undefined ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Air Quality Logs</CardTitle>
                <CardDescription>Latest CO and NO2 monitoring data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Wind className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No air quality logs recorded yet</p>
                  <p className="text-sm mt-2">Click "New Log" to start monitoring air quality</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AirQualityList logs={logs} onEdit={handleEdit} onDelete={handleDelete} />
          )
        ) : activeView === 'trends' ? (
          <AirQualityTrends logs={trendData} rinks={rinks} thresholds={thresholds} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Threshold Configuration</CardTitle>
              <CardDescription>
                Configure warning and danger thresholds for CO and NO2 levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <p className="font-medium mb-2">Current Thresholds:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• CO Warning: {thresholds?.co_warning_threshold} ppm</li>
                    <li>• CO Danger: {thresholds?.co_danger_threshold} ppm</li>
                    <li>• NO2 Warning: {thresholds?.no2_warning_threshold} ppm</li>
                    <li>• NO2 Danger: {thresholds?.no2_danger_threshold} ppm</li>
                  </ul>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Threshold configuration interface</p>
                  <p className="text-sm mt-2">
                    Adjust thresholds based on facility requirements and safety regulations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
