import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface CircleCheckListProps {
  logs: any[];
  machines: any[];
  onEdit: (log: any) => void;
  onDelete: (log: any) => void;
}

export function CircleCheckList({ logs, machines, onEdit, onDelete }: CircleCheckListProps) {
  const getMachineName = (machineId: string) => {
    const machine = machines.find((m) => m.id === machineId);
    return machine ? `${machine.machine_name} - ${machine.model}` : 'Unknown Machine';
  };

  const getCompletionStats = (checklistItems: Record<string, boolean>) => {
    if (!checklistItems) return { checked: 0, total: 0, percentage: 0 };

    const checked = Object.values(checklistItems).filter(Boolean).length;
    const total = Object.keys(checklistItems).length;
    const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;

    return { checked, total, percentage };
  };

  const getCompletionBadge = (percentage: number) => {
    if (percentage === 100) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3" />
          Complete
        </span>
      );
    } else if (percentage >= 75) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {percentage}% Complete
        </span>
      );
    } else if (percentage >= 50) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          {percentage}% Complete
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="h-3 w-3" />
          {percentage}% Complete
        </span>
      );
    }
  };

  const getMachineTypeBadge = (machineType: string) => {
    if (machineType === 'electric') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Electric
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          Gas
        </span>
      );
    }
  };

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <p>No circle checks logged yet</p>
            <p className="text-sm mt-2">Click "New Circle Check" to log a pre-operation inspection</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const stats = getCompletionStats(log.checklist_items);

        return (
          <Card key={log.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {getMachineName(log.machine_id)}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(log.log_date), 'MMMM d, yyyy')}
                    {log.log_time && ` at ${format(new Date(`2000-01-01T${log.log_time}`), 'h:mm a')}`}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(log)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(log)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Machine Type</div>
                  <div className="mt-1">{getMachineTypeBadge(log.machine_type)}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Inspection Status</div>
                  <div className="mt-1">{getCompletionBadge(stats.percentage)}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Items Checked</div>
                  <div className="mt-1 text-sm font-semibold">
                    {stats.checked} of {stats.total} items
                  </div>
                </div>

                {log.profiles && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Inspected By</div>
                    <div className="mt-1 text-sm">
                      {log.profiles.first_name} {log.profiles.last_name}
                    </div>
                  </div>
                )}
              </div>

              {log.notes && (
                <div className="pt-3 border-t">
                  <div className="text-sm font-medium text-muted-foreground">Notes</div>
                  <div className="mt-1 text-sm whitespace-pre-wrap">{log.notes}</div>
                </div>
              )}

              {stats.percentage < 100 && (
                <div className="pt-2 border-t">
                  <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                    ⚠️ Incomplete inspection - {stats.total - stats.checked} items remaining
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
