import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface EdgingListProps {
  logs: any[];
  machines: any[];
  rinks: any[];
  onEdit: (log: any) => void;
  onDelete: (log: any) => void;
}

export function EdgingList({ logs, machines, rinks, onEdit, onDelete }: EdgingListProps) {
  const getMachineName = (machineId: string) => {
    const machine = machines.find((m) => m.id === machineId);
    return machine ? `${machine.machine_name} - ${machine.model}` : 'Unknown Machine';
  };

  const getRinkName = (rinkId: string) => {
    if (!rinkId) return 'N/A';
    const rink = rinks.find((r) => r.id === rinkId);
    return rink ? rink.rink_name : 'Unknown Rink';
  };

  const getConditionBadge = (condition: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      good: { label: 'Good', className: 'bg-green-100 text-green-800' },
      fair: { label: 'Fair', className: 'bg-yellow-100 text-yellow-800' },
      poor: { label: 'Poor', className: 'bg-red-100 text-red-800' },
    };

    const badge = badges[condition] || badges.fair;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  const formatSections = (sections: string[] | null) => {
    if (!sections || sections.length === 0) return 'Not specified';

    const sectionLabels: Record<string, string> = {
      north: 'North End',
      south: 'South End',
      east: 'East Side',
      west: 'West Side',
      corners: 'All Corners',
      full: 'Full Perimeter',
    };

    return sections.map((s) => sectionLabels[s] || s).join(', ');
  };

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <p>No edging logs yet</p>
            <p className="text-sm mt-2">Click "New Edging" to log an edge maintenance session</p>
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
              {log.rinks && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Rink</div>
                  <div className="mt-1 text-sm font-medium">{log.rinks.rink_name}</div>
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground">Edge Condition</div>
                <div className="mt-1">{getConditionBadge(log.edge_condition)}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Sections Edged</div>
                <div className="mt-1 text-sm">{formatSections(log.sections_edged)}</div>
              </div>

              {log.passes && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Number of Passes</div>
                  <div className="mt-1 text-sm font-semibold">{log.passes}</div>
                </div>
              )}

              {log.profiles && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Performed By</div>
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
