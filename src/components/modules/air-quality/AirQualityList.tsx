import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, AlertTriangle, Wind } from 'lucide-react';
import { format } from 'date-fns';

interface AirQualityListProps {
  logs: any[];
  onEdit: (log: any) => void;
  onDelete: (log: any) => void;
}

export function AirQualityList({ logs, onEdit, onDelete }: AirQualityListProps) {
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      normal: { label: 'Normal', className: 'bg-green-100 text-green-800' },
      warning: { label: 'Warning', className: 'bg-yellow-100 text-yellow-800' },
      danger: { label: 'Danger', className: 'bg-red-100 text-red-800' },
    };

    const badge = badges[status] || badges.normal;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

  const getVentilationBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      normal: { label: 'Normal', className: 'bg-blue-100 text-blue-800' },
      reduced: { label: 'Reduced', className: 'bg-yellow-100 text-yellow-800' },
      maintenance: { label: 'Maintenance', className: 'bg-orange-100 text-orange-800' },
      offline: { label: 'Offline', className: 'bg-red-100 text-red-800' },
    };

    const badge = badges[status] || badges.normal;

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
            <Wind className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No air quality logs found</p>
            <p className="text-sm mt-2">Start monitoring air quality levels</p>
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
                    <AlertTriangle className="h-5 w-5 text-orange-500" title="Threshold exceeded" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  {log.rinks && (
                    <>
                      <span>{log.rinks.rink_name}</span>
                      <span>•</span>
                    </>
                  )}
                  <span className="flex items-center gap-1">
                    <Wind className="h-3 w-3" />
                    {getVentilationBadge(log.ventilation_status)}
                  </span>
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
            {/* Gas Levels */}
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-2">Gas Levels</div>
              <div className="grid gap-3 md:grid-cols-2">
                {log.co_level !== null && (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-muted-foreground">Carbon Monoxide (CO)</div>
                      {getStatusBadge(log.co_status)}
                    </div>
                    <div className="text-lg font-semibold">{log.co_level} ppm</div>
                  </div>
                )}
                {log.no2_level !== null && (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-muted-foreground">Nitrogen Dioxide (NO2)</div>
                      {getStatusBadge(log.no2_status)}
                    </div>
                    <div className="text-lg font-semibold">{log.no2_level} ppm</div>
                  </div>
                )}
              </div>
            </div>

            {/* Environmental Conditions */}
            {(log.temperature !== null || log.humidity !== null) && (
              <div className="pt-2 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-2">Environmental Conditions</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {log.temperature !== null && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground">Temperature</div>
                      <div className="text-sm font-semibold">{log.temperature}°F</div>
                    </div>
                  )}
                  {log.humidity !== null && (
                    <div className="bg-muted/50 p-3 rounded-md">
                      <div className="text-xs text-muted-foreground">Humidity</div>
                      <div className="text-sm font-semibold">{log.humidity}%</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Corrective Actions */}
            {log.corrective_actions && (
              <div className="pt-2 border-t">
                <div className="text-sm font-medium text-muted-foreground">Corrective Actions</div>
                <div className="mt-1 text-sm bg-blue-50 p-2 rounded border border-blue-200">
                  {log.corrective_actions}
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
