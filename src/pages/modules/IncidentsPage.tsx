import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, AlertTriangle, Filter } from 'lucide-react';
import { useFacilityInfo, useRinks } from '@/hooks/useIceDepth';
import {
  useIncidents,
  useCreateIncident,
  useUpdateIncident,
  useDeleteIncident,
  useLockIncident,
} from '@/hooks/useIncidents';
import { IncidentForm } from '@/components/modules/incidents/IncidentForm';
import { IncidentList } from '@/components/modules/incidents/IncidentList';
import { IncidentDetails } from '@/components/modules/incidents/IncidentDetails';

export function IncidentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingIncident, setEditingIncident] = useState<any>(null);
  const [viewingIncident, setViewingIncident] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    severity: '',
    startDate: '',
    endDate: '',
  });

  const { data: facility } = useFacilityInfo();
  const facilityId = facility?.id || null;
  const { data: rinks = [] } = useRinks(facilityId);
  const { data: incidents = [] } = useIncidents(facilityId, filters);

  // Mutations
  const createIncident = useCreateIncident();
  const updateIncident = useUpdateIncident();
  const deleteIncident = useDeleteIncident();
  const lockIncident = useLockIncident();

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayIncidents = incidents.filter((i: any) => i.incident_date === today).length;

  const thisMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString().split('T')[0];
  const thisMonthIncidents = incidents.filter((i: any) => i.incident_date >= thisMonthStart).length;

  const criticalIncidents = incidents.filter((i: any) => i.severity === 'critical').length;
  const minorIncidents = incidents.filter((i: any) => i.severity === 'minor').length;

  // Handlers
  const handleCreateNew = () => {
    setEditingIncident(null);
    setShowForm(true);
  };

  const handleEdit = (incident: any) => {
    setEditingIncident(incident);
    setViewingIncident(null);
    setShowForm(true);
  };

  const handleView = (incident: any) => {
    setViewingIncident(incident);
    setShowForm(false);
  };

  const handleDelete = async (incident: any) => {
    if (window.confirm(`Are you sure you want to delete incident #${incident.incident_number}?`)) {
      try {
        await deleteIncident.mutateAsync(incident.id);
      } catch (error) {
        console.error('Error deleting incident:', error);
      }
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (editingIncident) {
        await updateIncident.mutateAsync(data);
      } else {
        await createIncident.mutateAsync(data);
      }
      setShowForm(false);
      setEditingIncident(null);
    } catch (error) {
      console.error('Error saving incident:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingIncident(null);
  };

  const handleLock = async (incident: any) => {
    try {
      await lockIncident.mutateAsync({
        id: incident.id,
        isLocked: !incident.is_locked,
      });
      if (viewingIncident?.id === incident.id) {
        setViewingIncident({ ...incident, is_locked: !incident.is_locked });
      }
    } catch (error) {
      console.error('Error locking/unlocking incident:', error);
    }
  };

  const handleCloseDetails = () => {
    setViewingIncident(null);
  };

  const handleEditFromDetails = () => {
    handleEdit(viewingIncident);
  };

  const handleLockFromDetails = () => {
    handleLock(viewingIncident);
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      severity: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Incident Reports</h1>
          <p className="text-muted-foreground mt-2">
            Document and track safety incidents and injuries
          </p>
        </div>
        <div className="flex gap-2">
          {!showForm && !viewingIncident && (
            <>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                New Report
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Dashboard */}
      {!showForm && !viewingIncident && (
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Incidents</CardTitle>
              <CardDescription>Reports filed today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{todayIncidents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
              <CardDescription>Total incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{thisMonthIncidents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Critical</CardTitle>
              <CardDescription>Serious incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{criticalIncidents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Minor</CardTitle>
              <CardDescription>Minor incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{minorIncidents}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      {showFilters && !showForm && !viewingIncident && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filter Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="severity_filter">Severity</Label>
                <select
                  id="severity_filter"
                  value={filters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">All Severities</option>
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="serious">Serious</option>
                  <option value="critical">Critical</option>
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
              Showing {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <div>
        {showForm ? (
          <IncidentForm
            incident={editingIncident}
            rinks={rinks}
            facilityId={facilityId || ''}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : viewingIncident ? (
          <IncidentDetails
            incident={viewingIncident}
            onClose={handleCloseDetails}
            onEdit={handleEditFromDetails}
            onLock={handleLockFromDetails}
          />
        ) : incidents.length === 0 && !filters.severity && !filters.startDate && !filters.endDate ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent Incident Reports</CardTitle>
              <CardDescription>Latest safety incidents and injuries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No incident reports filed yet</p>
                <p className="text-sm mt-2">Click "New Report" to document an incident</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <IncidentList
            incidents={incidents}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onLock={handleLock}
          />
        )}
      </div>
    </div>
  );
}
