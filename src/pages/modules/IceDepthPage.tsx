import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Ruler, TrendingUp, FileText } from 'lucide-react';
import { TemplateList } from '@/components/modules/ice-depth/TemplateList';
import { MeasurementForm } from '@/components/modules/ice-depth/MeasurementForm';
import {
  useFacilityInfo,
  useTemplates,
  useMeasurements,
  useRinks,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useCreateMeasurement,
} from '@/hooks/useIceDepth';
import { SYSTEM_TEMPLATES } from '@/lib/iceDepthUtils';
import { formatDate, formatTime } from '@/lib/utils';
import { toast } from 'sonner';

type View = 'overview' | 'templates' | 'measurement' | 'history';

export function IceDepthPage() {
  const [currentView, setCurrentView] = useState<View>('overview');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedRink, setSelectedRink] = useState<string>('');

  // Fetch data
  const { data: facility } = useFacilityInfo();
  const { data: templates = [], isLoading: templatesLoading } = useTemplates(facility?.id);
  const { data: measurements = [], isLoading: measurementsLoading } = useMeasurements(facility?.id);
  const { data: rinks = [] } = useRinks(facility?.id);

  // Mutations
  const createTemplate = useCreateTemplate();
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const createMeasurement = useCreateMeasurement();

  // Calculate stats
  const todaysMeasurements = measurements.filter(
    (m) => m.measurement_date === new Date().toISOString().split('T')[0]
  );

  const recentMeasurement = measurements[0];
  const avgDepth = recentMeasurement?.avg_depth
    ? `${recentMeasurement.avg_depth.toFixed(2)}${recentMeasurement.unit === 'mm' ? 'mm' : '"'}`
    : '--';

  // Handle template creation
  const handleCreateTemplate = () => {
    // For now, create from 24-point system template
    const systemTemplate = SYSTEM_TEMPLATES['24-point'];

    if (!facility?.id) {
      toast.error('Facility not found');
      return;
    }

    createTemplate.mutate({
      facility_id: facility.id,
      template_name: `${systemTemplate.name} ${templates.length + 1}`,
      point_count: systemTemplate.pointCount,
      template_data: {
        points: systemTemplate.points,
      },
      is_active: true,
    });
  };

  // Handle measurement save
  const handleSaveMeasurement = async (data: any) => {
    if (!facility?.id) {
      throw new Error('Facility not found');
    }

    await createMeasurement.mutateAsync({
      ...data,
      facility_id: facility.id,
    });

    setCurrentView('overview');
    setSelectedTemplate(null);
  };

  // Start new measurement
  const handleStartMeasurement = () => {
    if (templates.length === 0) {
      toast.error('Please create a template first', {
        description: 'Go to Templates to create your first measurement template',
      });
      return;
    }

    if (rinks.length === 0) {
      toast.error('No rinks found', {
        description: 'Please add rinks to your facility first',
      });
      return;
    }

    setSelectedTemplate(templates[0]);
    setSelectedRink(rinks[0].id);
    setCurrentView('measurement');
  };

  // Render based on current view
  if (currentView === 'templates') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Ice Depth Templates</h1>
            <p className="text-muted-foreground mt-2">
              Manage custom measurement templates
            </p>
          </div>
          <Button variant="outline" onClick={() => setCurrentView('overview')}>
            Back to Overview
          </Button>
        </div>

        <TemplateList
          templates={templates}
          onCreateNew={handleCreateTemplate}
          onEdit={(template) => {
            toast.info('Template editing coming soon');
          }}
          onDuplicate={(template) => {
            if (!facility?.id) return;
            createTemplate.mutate({
              ...template,
              id: undefined,
              template_name: `${template.template_name} (Copy)`,
              created_at: undefined,
              updated_at: undefined,
            });
          }}
          onDelete={(template) => {
            if (confirm(`Are you sure you want to delete "${template.template_name}"?`)) {
              deleteTemplate.mutate(template.id);
            }
          }}
        />
      </div>
    );
  }

  if (currentView === 'measurement' && selectedTemplate && selectedRink) {
    return (
      <MeasurementForm
        template={selectedTemplate}
        rinkId={selectedRink}
        facilityLogo={facility?.logo_url}
        onSave={handleSaveMeasurement}
        onCancel={() => {
          setCurrentView('overview');
          setSelectedTemplate(null);
        }}
      />
    );
  }

  if (currentView === 'history') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Measurement History</h1>
            <p className="text-muted-foreground mt-2">
              View past ice depth measurements
            </p>
          </div>
          <Button variant="outline" onClick={() => setCurrentView('overview')}>
            Back to Overview
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Measurements</CardTitle>
            <CardDescription>Last 50 measurements</CardDescription>
          </CardHeader>
          <CardContent>
            {measurementsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : measurements.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No measurements recorded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {measurements.map((measurement: any) => (
                  <div
                    key={measurement.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div>
                      <div className="font-semibold">
                        {measurement.rinks?.rink_name || 'Unknown Rink'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(measurement.measurement_date)} at{' '}
                        {formatTime(measurement.measurement_time)}
                      </div>
                      <div className="text-sm">
                        Operator: {measurement.profiles?.first_name}{' '}
                        {measurement.profiles?.last_name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Average Depth</div>
                      <div className="text-2xl font-bold">
                        {measurement.avg_depth?.toFixed(2)}
                        {measurement.unit === 'mm' ? 'mm' : '"'}
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          measurement.status === 'critical'
                            ? 'text-red-600'
                            : measurement.status === 'warning'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {measurement.status?.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Overview view (default)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ice Depth Log</h1>
          <p className="text-muted-foreground mt-2">
            Track ice surface thickness measurements with custom templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentView('templates')}>
            <Settings className="mr-2 h-4 w-4" />
            Templates
          </Button>
          <Button onClick={handleStartMeasurement}>
            <Plus className="mr-2 h-4 w-4" />
            New Measurement
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Measurements</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysMeasurements.length}</div>
            <p className="text-xs text-muted-foreground">Measurements logged today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              {4 - templates.length} slots remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Ice Depth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDepth}</div>
            <p className="text-xs text-muted-foreground">Last measurement average</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent measurements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Measurements</CardTitle>
              <CardDescription>Latest ice depth measurements</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentView('history')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {measurementsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : measurements.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ruler className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No measurements recorded yet</p>
              <p className="text-sm mt-2">Click "New Measurement" to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {measurements.slice(0, 5).map((measurement: any) => (
                <div
                  key={measurement.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-semibold">
                      {measurement.rinks?.rink_name || 'Unknown Rink'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(measurement.measurement_date)} at{' '}
                      {formatTime(measurement.measurement_time)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">
                      {measurement.avg_depth?.toFixed(2)}
                      {measurement.unit === 'mm' ? 'mm' : '"'}
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        measurement.status === 'critical'
                          ? 'text-red-600'
                          : measurement.status === 'warning'
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {measurement.status?.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
