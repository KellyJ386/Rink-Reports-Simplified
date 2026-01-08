import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Thermometer, TrendingUp, Settings, Filter } from 'lucide-react';
import { useFacilityInfo, useRinks } from '@/hooks/useIceDepth';
import {
  useRefrigerationLogs,
  useRefrigerationTrends,
  useCreateRefrigerationLog,
  useUpdateRefrigerationLog,
  useDeleteRefrigerationLog,
  useFieldConfigurations,
} from '@/hooks/useRefrigeration';
import { RefrigerationForm } from '@/components/modules/refrigeration/RefrigerationForm';
import { RefrigerationList } from '@/components/modules/refrigeration/RefrigerationList';
import { RefrigerationTrends } from '@/components/modules/refrigeration/RefrigerationTrends';

type ViewType = 'logs' | 'trends' | 'settings';

export function RefrigerationPage() {
  const [activeView, setActiveView] = useState<ViewType>('logs');
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    rinkId: '',
  });

  const { data: facility } = useFacilityInfo();
  const facilityId = facility?.id || null;
  const { data: rinks = [] } = useRinks(facilityId);
  const { data: logs = [] } = useRefrigerationLogs(facilityId, filters);
  const { data: trendData = [] } = useRefrigerationTrends(facilityId, filters.rinkId, 30);
  const { data: fieldConfigs = [] } = useFieldConfigurations(facilityId);

  // Mutations
  const createLog = useCreateRefrigerationLog();
  const updateLog = useUpdateRefrigerationLog();
  const deleteLog = useDeleteRefrigerationLog();

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayLogs = logs.filter((log: any) => log.log_date === today).length;

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);
  const thisWeekLogs = logs.filter((log: any) => log.log_date >= thisWeekStart.toISOString().split('T')[0]).length;

  const alertsCount = logs.filter((log: any) => log.has_alerts).length;

  const avgSupplyTemp = logs.reduce((sum: number, log: any) => sum + (log.supply_temp || 0), 0) / logs.length || 0;

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
    if (window.confirm('Are you sure you want to delete this refrigeration log?')) {
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

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      rinkId: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Refrigeration Log</h1>
          <p className="text-muted-foreground mt-2">
            Track refrigeration system performance and trends
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
              <CardDescription>Entries recorded today</CardDescription>
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
              <CardTitle>Avg Supply Temp</CardTitle>
              <CardDescription>Recent average</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgSupplyTemp.toFixed(1)}°F</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
              <CardDescription>Out of range values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{alertsCount}</div>
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
              <Thermometer className="h-4 w-4" />
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
              Trends
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
              Field Settings
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
            <div className="grid gap-4 md:grid-cols-4">
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
          <RefrigerationForm
            log={editingLog}
            rinks={rinks}
            fieldConfigs={fieldConfigs}
            facilityId={facilityId || ''}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : activeView === 'logs' ? (
          logs.length === 0 && !filters.startDate && !filters.endDate && !filters.rinkId ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Refrigeration Logs</CardTitle>
                <CardDescription>Latest system readings and performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Thermometer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No refrigeration logs recorded yet</p>
                  <p className="text-sm mt-2">Click "New Log" to start tracking system performance</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <RefrigerationList logs={logs} onEdit={handleEdit} onDelete={handleDelete} />
          )
        ) : activeView === 'trends' ? (
          <RefrigerationTrends logs={trendData} rinks={rinks} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Custom Field Configuration</CardTitle>
              <CardDescription>
                Configure additional fields to track facility-specific refrigeration data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Field configuration interface</p>
                <p className="text-sm mt-2">
                  Add custom fields like condenser efficiency, evaporator temperature, etc.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
