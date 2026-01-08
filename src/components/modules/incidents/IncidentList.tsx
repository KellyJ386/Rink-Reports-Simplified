import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Lock, Unlock } from 'lucide-react';
import { format } from 'date-fns';

interface IncidentListProps {
  incidents: any[];
  onView: (incident: any) => void;
  onEdit: (incident: any) => void;
  onDelete: (incident: any) => void;
  onLock?: (incident: any) => void;
}

export function IncidentList({ incidents, onView, onEdit, onDelete, onLock }: IncidentListProps) {
  const getSeverityBadge = (severity: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      minor: { label: 'Minor', className: 'bg-green-100 text-green-800' },
      moderate: { label: 'Moderate', className: 'bg-yellow-100 text-yellow-800' },
      serious: { label: 'Serious', className: 'bg-orange-100 text-orange-800' },
      critical: { label: 'Critical', className: 'bg-red-100 text-red-800' },
    };

    const badge = badges[severity] || badges.minor;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  };

  if (incidents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <p>No incident reports found</p>
            <p className="text-sm mt-2">Incident reports will appear here when created</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {incidents.map((incident) => (
        <Card key={incident.id} className={incident.is_locked ? 'border-gray-400' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">
                    Incident #{incident.incident_number}
                  </CardTitle>
                  {incident.is_locked && (
                    <Lock className="h-4 w-4 text-gray-500" title="Report is locked" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                  <span>
                    {format(new Date(incident.incident_date), 'MMM d, yyyy')}
                    {incident.incident_time &&
                      ` at ${format(new Date(`2000-01-01T${incident.incident_time}`), 'h:mm a')}`}
                  </span>
                  <span>•</span>
                  <span>{incident.location}</span>
                  {incident.rinks && (
                    <>
                      <span>•</span>
                      <span>{incident.rinks.rink_name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => onView(incident)}>
                  <Eye className="h-4 w-4" />
                </Button>
                {!incident.is_locked && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => onEdit(incident)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(incident)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {onLock && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLock(incident)}
                    title={incident.is_locked ? 'Unlock report' : 'Lock report'}
                  >
                    {incident.is_locked ? (
                      <Unlock className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Type</div>
                <div className="mt-1 text-sm">{incident.incident_type}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Severity</div>
                <div className="mt-1">{getSeverityBadge(incident.severity)}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Injured Person</div>
                <div className="mt-1 text-sm font-semibold">{incident.injured_name}</div>
                {incident.injured_age && (
                  <div className="text-xs text-muted-foreground">Age: {incident.injured_age}</div>
                )}
              </div>

              {incident.profiles && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Reported By</div>
                  <div className="mt-1 text-sm">
                    {incident.profiles.first_name} {incident.profiles.last_name}
                  </div>
                </div>
              )}
            </div>

            {/* Response Actions Summary */}
            <div className="pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground mb-2">Actions Taken</div>
              <div className="flex flex-wrap gap-2">
                {incident.first_aid_given && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800">
                    First Aid
                  </span>
                )}
                {incident.ice_pack_given && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-cyan-100 text-cyan-800">
                    Ice Pack
                  </span>
                )}
                {incident.ambulance_called && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-red-100 text-red-800">
                    Ambulance Called
                  </span>
                )}
                {incident.parent_notified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-800">
                    Parent Notified
                  </span>
                )}
                {incident.scene_secured && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-800">
                    Scene Secured
                  </span>
                )}
                {incident.manager_notified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-indigo-100 text-indigo-800">
                    Manager Notified
                  </span>
                )}
              </div>
            </div>

            {/* Description Preview */}
            <div className="pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground">Description</div>
              <div className="mt-1 text-sm line-clamp-2">{incident.description}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
