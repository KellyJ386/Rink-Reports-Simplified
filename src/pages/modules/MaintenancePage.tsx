import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Wrench, Scissors, Ruler, CheckCircle2 } from 'lucide-react';
import { IceMakeForm } from '@/components/modules/maintenance/IceMakeForm';
import { IceMakeList } from '@/components/modules/maintenance/IceMakeList';
import { BladeChangeForm } from '@/components/modules/maintenance/BladeChangeForm';
import { BladeChangeList } from '@/components/modules/maintenance/BladeChangeList';
import { EdgingForm } from '@/components/modules/maintenance/EdgingForm';
import { EdgingList } from '@/components/modules/maintenance/EdgingList';
import { CircleCheckForm } from '@/components/modules/maintenance/CircleCheckForm';
import { CircleCheckList } from '@/components/modules/maintenance/CircleCheckList';
import {
  useIceMachines,
  useMaintenanceLogs,
  useCreateMaintenanceLog,
  useUpdateMaintenanceLog,
  useDeleteMaintenanceLog,
} from '@/hooks/useMaintenance';
import { useFacilityInfo, useRinks } from '@/hooks/useIceDepth';

type TabType = 'ice-make' | 'blade-change' | 'edging' | 'circle-check';

export function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<TabType>('ice-make');
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);

  // Fetch facility and related data
  const { data: facility } = useFacilityInfo();
  const facilityId = facility?.id || null;
  const { data: machines = [] } = useIceMachines(facilityId);
  const { data: rinks = [] } = useRinks(facilityId);

  // Fetch logs based on active tab
  const { data: iceMakeLogs = [] } = useMaintenanceLogs(facilityId, 'resurfacing');
  const { data: bladeChangeLogs = [] } = useMaintenanceLogs(facilityId, 'blade_change');
  const { data: edgingLogs = [] } = useMaintenanceLogs(facilityId, 'edging');
  const { data: circleCheckLogs = [] } = useMaintenanceLogs(facilityId, 'circle_check');

  // Mutations
  const createLog = useCreateMaintenanceLog();
  const updateLog = useUpdateMaintenanceLog();
  const deleteLog = useDeleteMaintenanceLog();

  const handleCreateNew = () => {
    setEditingLog(null);
    setShowForm(true);
  };

  const handleEdit = (log: any) => {
    setEditingLog(log);
    setShowForm(true);
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

  const handleDelete = async (log: any) => {
    if (window.confirm('Are you sure you want to delete this log entry?')) {
      try {
        await deleteLog.mutateAsync(log.id);
      } catch (error) {
        console.error('Error deleting log:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingLog(null);
  };

  // Calculate today's count for ice make
  const today = new Date().toISOString().split('T')[0];
  const todayIceMakes = iceMakeLogs.filter((log: any) => log.log_date === today).length;

  // Calculate this month's blade changes
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const thisMonthBladeChanges = bladeChangeLogs.filter((log: any) => log.log_date >= thisMonthStart).length;

  // Calculate this week's edging
  const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString().split('T')[0];
  const thisWeekEdging = edgingLogs.filter((log: any) => log.log_date >= thisWeekStart).length;

  // Calculate today's circle checks
  const todayCircleChecks = circleCheckLogs.filter((log: any) => log.log_date === today).length;

  const tabs = [
    {
      id: 'ice-make' as TabType,
      label: 'Ice Make',
      icon: Wrench,
      description: 'Resurfacing sessions',
    },
    {
      id: 'blade-change' as TabType,
      label: 'Blade Change',
      icon: Scissors,
      description: 'Blade replacements',
    },
    {
      id: 'edging' as TabType,
      label: 'Edging',
      icon: Ruler,
      description: 'Edge maintenance',
    },
    {
      id: 'circle-check' as TabType,
      label: 'Circle Check',
      icon: CheckCircle2,
      description: 'Circle inspections',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ice Maintenance Log</h1>
          <p className="text-muted-foreground mt-2">
            Track resurfacing, blade changes, edging, and circle checks
          </p>
        </div>
        {!showForm && (
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === 'ice-make' && 'New Ice Make'}
            {activeTab === 'blade-change' && 'New Blade Change'}
            {activeTab === 'edging' && 'New Edging'}
            {activeTab === 'circle-check' && 'New Circle Check'}
          </Button>
        )}
      </div>

      {/* Stats Dashboard */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Resurfacing</CardTitle>
            <CardDescription>Today's sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayIceMakes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blade Changes</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{thisMonthBladeChanges}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edging</CardTitle>
            <CardDescription>This week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{thisWeekEdging}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Circle Checks</CardTitle>
            <CardDescription>Today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayCircleChecks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowForm(false);
                  setEditingLog(null);
                }}
                className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'ice-make' && (
          <div className="space-y-6">
            {showForm ? (
              <IceMakeForm
                log={editingLog}
                machines={machines}
                rinks={rinks}
                facilityId={facilityId || ''}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <IceMakeList
                logs={iceMakeLogs}
                machines={machines}
                rinks={rinks}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {activeTab === 'blade-change' && (
          <div className="space-y-6">
            {showForm ? (
              <BladeChangeForm
                log={editingLog}
                machines={machines}
                facilityId={facilityId || ''}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <BladeChangeList
                logs={bladeChangeLogs}
                machines={machines}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {activeTab === 'edging' && (
          <div className="space-y-6">
            {showForm ? (
              <EdgingForm
                log={editingLog}
                machines={machines}
                rinks={rinks}
                facilityId={facilityId || ''}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <EdgingList
                logs={edgingLogs}
                machines={machines}
                rinks={rinks}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}

        {activeTab === 'circle-check' && (
          <div className="space-y-6">
            {showForm ? (
              <CircleCheckForm
                log={editingLog}
                machines={machines}
                facilityId={facilityId || ''}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <CircleCheckList
                logs={circleCheckLogs}
                machines={machines}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
