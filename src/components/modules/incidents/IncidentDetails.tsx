import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Edit, Lock, Unlock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface IncidentDetailsProps {
  incident: any;
  onClose: () => void;
  onEdit?: () => void;
  onLock?: () => void;
}

export function IncidentDetails({ incident, onClose, onEdit, onLock }: IncidentDetailsProps) {
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      minor: 'text-green-600',
      moderate: 'text-yellow-600',
      serious: 'text-orange-600',
      critical: 'text-red-600',
    };
    return colors[severity] || 'text-gray-600';
  };

  const InfoRow = ({ label, value }: { label: string; value: any }) => {
    if (!value) return null;
    return (
      <div className="space-y-1">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className="text-sm">{value}</div>
      </div>
    );
  };

  const CheckItem = ({ label, checked }: { label: string; checked: boolean }) => (
    <div className="flex items-center gap-2">
      {checked ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-300" />
      )}
      <span className="text-sm">{label}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Incident #{incident.incident_number}</h2>
            {incident.is_locked && (
              <Lock className="h-5 w-5 text-gray-500" title="Report is locked" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(incident.incident_date), 'MMMM d, yyyy')}
            {incident.incident_time &&
              ` at ${format(new Date(`2000-01-01T${incident.incident_time}`), 'h:mm a')}`}
          </p>
        </div>
        <div className="flex gap-2">
          {!incident.is_locked && onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {onLock && (
            <Button variant="outline" size="sm" onClick={onLock}>
              {incident.is_locked ? (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Lock
                </>
              )}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Incident Information */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <InfoRow label="Location" value={incident.location} />
            {incident.rinks && <InfoRow label="Rink" value={incident.rinks.rink_name} />}
            <InfoRow label="Incident Type" value={incident.incident_type} />
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Severity</div>
              <div className={`text-sm font-semibold capitalize ${getSeverityColor(incident.severity)}`}>
                {incident.severity}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Injured Person */}
      <Card>
        <CardHeader>
          <CardTitle>Injured Person</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <InfoRow label="Name" value={incident.injured_name} />
            <InfoRow label="Age" value={incident.injured_age} />
            <InfoRow label="Phone" value={incident.injured_phone} />
            <InfoRow label="Email" value={incident.injured_email} />
            <InfoRow label="Emergency Contact" value={incident.emergency_contact_name} />
            <InfoRow label="Emergency Phone" value={incident.emergency_contact_phone} />
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">What Happened?</div>
            <div className="text-sm whitespace-pre-wrap">{incident.description}</div>
          </div>

          {incident.contributing_factors && incident.contributing_factors.length > 0 && (
            <div className="space-y-2 pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground">Contributing Factors</div>
              <div className="flex flex-wrap gap-2">
                {incident.contributing_factors.map((factor: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}

          {incident.injuries?.description && (
            <div className="space-y-2 pt-2 border-t">
              <div className="text-sm font-medium text-muted-foreground">Injuries/Symptoms</div>
              <div className="text-sm whitespace-pre-wrap">{incident.injuries.description}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Response & Actions Taken</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CheckItem label="First Aid Given" checked={incident.first_aid_given} />
            <CheckItem label="Ice Pack Given" checked={incident.ice_pack_given} />
            <CheckItem label="Ambulance Called" checked={incident.ambulance_called} />
            <CheckItem label="Parent/Guardian Notified" checked={incident.parent_notified} />
            <CheckItem label="Scene Secured" checked={incident.scene_secured} />
            <CheckItem label="Manager Notified" checked={incident.manager_notified} />
          </div>

          {incident.medical_facility && (
            <div className="pt-4 border-t">
              <InfoRow label="Medical Facility" value={incident.medical_facility} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Information */}
      <Card>
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {incident.profiles && (
              <InfoRow
                label="Reported By"
                value={`${incident.profiles.first_name} ${incident.profiles.last_name}`}
              />
            )}
            <InfoRow
              label="Report Date"
              value={format(new Date(incident.created_at), 'MMM d, yyyy h:mm a')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
