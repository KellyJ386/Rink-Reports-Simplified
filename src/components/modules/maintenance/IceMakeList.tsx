import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

interface IceMakeListProps {
  logs: any[];
  machines: any[];
  rinks: any[];
  onEdit: (log: any) => void;
  onDelete: (log: any) => void;
}

export const IceMakeList: React.FC<IceMakeListProps> = ({
  logs,
  machines,
  rinks,
  onEdit,
  onDelete,
}) => {
  const getMachineName = (machineId: string) => {
    const machine = machines.find((m) => m.id === machineId);
    return machine?.machine_name || 'Unknown Machine';
  };

  const getRinkName = (rinkId: string) => {
    const rink = rinks.find((r) => r.id === rinkId);
    return rink?.rink_name || 'Unknown Rink';
  };

  const calculateDuration = (start: string, end: string): string => {
    if (!start || !end) return '--';

    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 1000 / 60);

    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ice Make History</CardTitle>
        <CardDescription>Recent resurfacing sessions</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No ice make logs yet</p>
            <p className="text-sm mt-2">Click "New Ice Make" to log a resurfacing session</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="font-semibold">
                      {formatDate(log.log_date)} at {formatTime(log.start_time)}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.make_type === 'wet'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {log.make_type === 'wet' ? 'Wet Make' : 'Dry Make'}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{getRinkName(log.rink_id)}</span>
                    {' • '}
                    {getMachineName(log.machine_id)}
                    {log.start_time && log.end_time && (
                      <>
                        {' • '}
                        Duration: {calculateDuration(log.start_time, log.end_time)}
                      </>
                    )}
                  </div>

                  <div className="flex gap-4 text-sm">
                    {log.water_used && (
                      <div>
                        <span className="text-muted-foreground">Water:</span>{' '}
                        <span className="font-medium">
                          {log.water_used} {log.water_unit}
                        </span>
                      </div>
                    )}
                    {log.snow_removed_percent !== null && (
                      <div>
                        <span className="text-muted-foreground">Snow Removed:</span>{' '}
                        <span className="font-medium">{log.snow_removed_percent}%</span>
                      </div>
                    )}
                    {log.machine_hours && (
                      <div>
                        <span className="text-muted-foreground">Machine Hours:</span>{' '}
                        <span className="font-medium">{log.machine_hours}</span>
                      </div>
                    )}
                  </div>

                  {log.notes && (
                    <div className="text-sm mt-2 p-2 bg-muted rounded">
                      {log.notes}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Logged by {log.profiles?.first_name} {log.profiles?.last_name}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(log)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(log)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
