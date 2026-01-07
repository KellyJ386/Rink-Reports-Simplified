import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Check, X, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

interface TimeOffRequestsProps {
  requests: any[];
  staff: any[];
  facilityId: string;
  onSubmit: (data: any) => void;
  onReview: (id: string, status: 'approved' | 'denied', notes?: string) => void;
  canReview: boolean;
}

export const TimeOffRequests: React.FC<TimeOffRequestsProps> = ({
  requests,
  staff,
  facilityId,
  onSubmit,
  onReview,
  canReview,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      ...formData,
      facility_id: facilityId,
    });

    setFormData({
      staff_id: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(new Date(), 'yyyy-MM-dd'),
      reason: '',
    });
    setShowForm(false);
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const reviewedRequests = requests.filter((r) => r.status !== 'pending');

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      denied: 'bg-red-100 text-red-800',
    };

    const icons = {
      pending: Clock,
      approved: Check,
      denied: X,
    };

    const Icon = icons[status as keyof typeof icons];
    const badge = badges[status as keyof typeof badges];

    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Request form */}
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>Request Time Off</CardTitle>
            <CardDescription>Submit a new time-off request</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="staff_id" className="text-sm font-medium">
                  Staff Member *
                </label>
                <select
                  id="staff_id"
                  value={formData.staff_id}
                  onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="">Select staff member</option>
                  {staff
                    .filter((s) => s.status === 'active')
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="start_date" className="text-sm font-medium">
                    Start Date *
                  </label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="end_date" className="text-sm font-medium">
                    End Date *
                  </label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">
                  Reason
                </label>
                <textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Optional reason for time-off..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Time-Off Requests</h3>
            <p className="text-sm text-muted-foreground">
              {pendingRequests.length} pending request{pendingRequests.length !== 1 && 's'}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Request Time Off
          </Button>
        </div>
      )}

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Awaiting manager review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => {
                const days = differenceInDays(
                  new Date(request.end_date),
                  new Date(request.start_date)
                ) + 1;

                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-semibold">
                        {request.schedule_staff?.first_name} {request.schedule_staff?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(request.start_date)} - {formatDate(request.end_date)} ({days}{' '}
                        {days === 1 ? 'day' : 'days'})
                      </div>
                      {request.reason && (
                        <div className="text-sm mt-1">{request.reason}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Submitted {formatDate(request.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                      {canReview && request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReview(request.id, 'approved')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onReview(request.id, 'denied')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviewed requests */}
      {reviewedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
            <CardDescription>Past time-off requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reviewedRequests.slice(0, 10).map((request) => {
                const days = differenceInDays(
                  new Date(request.end_date),
                  new Date(request.start_date)
                ) + 1;

                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {request.schedule_staff?.first_name} {request.schedule_staff?.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(request.start_date)} - {formatDate(request.end_date)} ({days}{' '}
                        {days === 1 ? 'day' : 'days'})
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No time-off requests yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Click "Request Time Off" to submit a new request
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
