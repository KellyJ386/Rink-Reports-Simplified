import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, AlertTriangle, Thermometer, Gauge } from 'lucide-react';
import { format } from 'date-fns';

interface RefrigerationListProps {
  logs: any[];
  onEdit: (log: any) => void;
  onDelete: (log: any) => void;
}

export function RefrigerationList({ logs, onEdit, onDelete }: RefrigerationListProps) {
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      running: { label: 'Running', className: 'bg-green-100 text-green-800' },
      idle: { label: 'Idle', className: 'bg-yellow-100 text-yellow-800' },
      maintenance: { label: 'Maintenance', className: 'bg-orange-100 text-orange-800' },
      offline: { label: 'Offline', className: 'bg-red-100 text-red-800' },
    };

    const badge = badges[status] || badges.running;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Thermometer className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No refrigeration logs found</p>
            <p className="text-sm mt-2">Start tracking refrigeration system readings</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id} className={log.has_alerts ? 'border-orange-400 border-2' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">
                    {format(new Date(log.log_date), 'MMM d, yyyy')}
                    {log.log_time && ` at ${format(new Date(`2000-01-01T${log.log_time}`), 'h:mm a')}`}
                  </CardTitle>
                  {log.has_alerts && (
                    <AlertTriangle className="h-5 w-5 text-orange-500" title="Out of range values detected" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {log.rinks && (
                    <>
                      <span>{log.rinks.rink_name}</span>
                      <span>•</span>
                    </>
                  )}
                  {log.refrigerant_type && (
                    <>
                      <span>{log.refrigerant_type}</span>
                      <span>•</span>
                    </>
                  )}
                  <span>{getStatusBadge(log.compressor_status)}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
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
            {/* Temperature Readings */}
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Temperature Readings (°F)
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {log.supply_temp !== null && (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Supply</div>
                    <div className="text-lg font-semibold">{log.supply_temp}°</div>
                  </div>
                )}
                {log.return_temp !== null && (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Return</div>
                    <div className="text-lg font-semibold">{log.return_temp}°</div>
                  </div>
                )}
                {log.ambient_temp !== null && (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="text-xs text-muted-foreground">Ambient</div>
                    <div className="text-lg font-semibold">{log.ambient_temp}°</div>
                  </div>
                )}
              </div>
            </div>

            {/* Pressure Readings */}
            {(log.high_pressure !== null || log.low_pressure !== null) && (
              <div className="pt-2 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Pressure Readings (PSI)
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {log.high_pressure !== null && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground">High Side</div>
                      <div className="text-lg font-semibold">{log.high_pressure} PSI</div>
                    </div>
                  )}
                  {log.low_pressure !== null && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground">Low Side</div>
                      <div className="text-lg font-semibold">{log.low_pressure} PSI</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {log.custom_fields && Object.keys(log.custom_fields).length > 0 && (
              <div className="pt-2 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-2">Custom Fields</div>
                <div className="grid gap-3 md:grid-cols-3">
                  {Object.entries(log.custom_fields).map(([key, value]) => (
                    <div key={key} className="bg-muted/50 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</div>
                      <div className="text-sm font-semibold">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {log.notes && (
              <div className="pt-2 border-t">
                <div className="text-sm font-medium text-muted-foreground">Notes</div>
                <div className="mt-1 text-sm">{log.notes}</div>
              </div>
            )}

            {/* Recorded By */}
            {log.profiles && (
              <div className="pt-2 border-t text-xs text-muted-foreground">
                Recorded by {log.profiles.first_name} {log.profiles.last_name}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
