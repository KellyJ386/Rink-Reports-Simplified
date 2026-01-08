import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface BladeChangeListProps {
  logs: any[];
  machines: any[];
  onEdit: (log: any) => void;
  onDelete: (log: any) => void;
}

export function BladeChangeList({ logs, machines, onEdit, onDelete }: BladeChangeListProps) {
  const getMachineName = (machineId: string) => {
    const machine = machines.find((m) => m.id === machineId);
    return machine ? `${machine.machine_name} - ${machine.model}` : 'Unknown Machine';
  };

  const getReasonBadge = (reason: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' },
      worn: { label: 'Worn/Dull', className: 'bg-yellow-100 text-yellow-800' },
      damaged: { label: 'Damaged', className: 'bg-red-100 text-red-800' },
      other: { label: 'Other', className: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[reason] || badges.other;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <p>No blade changes logged yet</p>
            <p className="text-sm mt-2">Click "New Blade Change" to log a blade replacement</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
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
                <div className="text-sm font-medium text-muted-foreground">Reason</div>
                <div className="mt-1">{getReasonBadge(log.reason)}</div>
              </div>

              {log.blade_type && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Blade Type</div>
                  <div className="mt-1 text-sm">{log.blade_type}</div>
                </div>
              )}

              {log.old_blade_hours && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Old Blade Hours</div>
                  <div className="mt-1 text-sm font-semibold">{log.old_blade_hours} hrs</div>
                </div>
              )}

              {log.profiles && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Changed By</div>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
