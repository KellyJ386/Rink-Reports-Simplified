import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CalendarDays, Clock, Download } from 'lucide-react';
import { StaffList } from '@/components/modules/scheduling/StaffList';
import { StaffForm } from '@/components/modules/scheduling/StaffForm';
import { WeeklyCalendar } from '@/components/modules/scheduling/WeeklyCalendar';
import { ShiftForm } from '@/components/modules/scheduling/ShiftForm';
import { TimeOffRequests } from '@/components/modules/scheduling/TimeOffRequests';
import {
  useScheduleStaff,
  useShifts,
  useTimeOffRequests,
  useCreateStaff,
  useUpdateStaff,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
  usePublishSchedule,
  useCopyPreviousWeek,
  useCreateTimeOffRequest,
  useReviewTimeOffRequest,
} from '@/hooks/useScheduling';
import { useFacilityInfo } from '@/hooks/useIceDepth';
import { getWeekRange, exportScheduleToCSV } from '@/lib/schedulingUtils';
import { format, subWeeks } from 'date-fns';
import { toast } from 'sonner';

type View = 'calendar' | 'staff' | 'timeoff';

export function SchedulingPage() {
  const [currentView, setCurrentView] = useState<View>('calendar');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showShiftForm, setShowShiftForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [shiftDefaultDate, setShiftDefaultDate] = useState<string | undefined>(undefined);

  // Fetch data
  const { data: facility } = useFacilityInfo();
  const { data: staff = [] } = useScheduleStaff(facility?.id);

  const { start: weekStart, end: weekEnd } = getWeekRange(currentWeek);
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  const { data: shifts = [] } = useShifts(facility?.id, weekStartStr, weekEndStr);
  const { data: timeOffRequests = [] } = useTimeOffRequests(facility?.id);

  // Mutations
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const createShift = useCreateShift();
  const updateShift = useUpdateShift();
  const deleteShift = useDeleteShift();
  const publishSchedule = usePublishSchedule();
  const copyPreviousWeek = useCopyPreviousWeek();
  const createTimeOffRequest = useCreateTimeOffRequest();
  const reviewTimeOffRequest = useReviewTimeOffRequest();

  // Calculate stats
  const activeStaff = staff.filter((s: any) => s.status === 'active');
  const weekShifts = shifts.length;
  const pendingTimeOff = timeOffRequests.filter((r: any) => r.status === 'pending').length;
  const isPublished = shifts.length > 0 && shifts.every((s: any) => s.is_published);

  // Handle staff operations
  const handleSaveStaff = async (data: any) => {
    if (editingStaff) {
      await updateStaff.mutateAsync(data);
    } else {
      await createStaff.mutateAsync(data);
    }
    setShowStaffForm(false);
    setEditingStaff(null);
  };

  const handleEditStaff = (staff: any) => {
    setEditingStaff(staff);
    setShowStaffForm(true);
  };

  const handleDeactivateStaff = async (staff: any) => {
    if (
      confirm(`Are you sure you want to deactivate ${staff.first_name} ${staff.last_name}?`)
    ) {
      await updateStaff.mutateAsync({
        id: staff.id,
        status: 'inactive',
      });
    }
  };

  // Handle shift operations
  const handleSaveShift = async (data: any) => {
    if (editingShift) {
      await updateShift.mutateAsync(data);
    } else {
      await createShift.mutateAsync(data);
    }
    setShowShiftForm(false);
    setEditingShift(null);
    setShiftDefaultDate(undefined);
  };

  const handleShiftClick = (shift: any) => {
    setEditingShift(shift);
    setShowShiftForm(true);
  };

  const handleAddShift = (date: string) => {
    setShiftDefaultDate(date);
    setEditingShift(null);
    setShowShiftForm(true);
  };

  const handleDeleteShift = async (id: string) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      await deleteShift.mutateAsync(id);
      setShowShiftForm(false);
      setEditingShift(null);
    }
  };

  const handlePublishSchedule = async () => {
    if (
      confirm(
        'This will publish the schedule and notify all staff. Continue?'
      )
    ) {
      await publishSchedule.mutateAsync({
        facilityId: facility?.id,
        startDate: weekStartStr,
        endDate: weekEndStr,
      });
    }
  };

  const handleCopyPreviousWeek = async () => {
    const prevWeek = subWeeks(currentWeek, 1);
    const { start: prevStart, end: prevEnd } = getWeekRange(prevWeek);

    await copyPreviousWeek.mutateAsync({
      facilityId: facility?.id,
      fromStartDate: format(prevStart, 'yyyy-MM-dd'),
      fromEndDate: format(prevEnd, 'yyyy-MM-dd'),
      toStartDate: weekStartStr,
    });
  };

  // Handle time-off operations
  const handleSubmitTimeOff = async (data: any) => {
    await createTimeOffRequest.mutateAsync(data);
  };

  const handleReviewTimeOff = async (
    id: string,
    status: 'approved' | 'denied',
    notes?: string
  ) => {
    await reviewTimeOffRequest.mutateAsync({ id, status, notes });
  };

  // Export schedule
  const handleExportCSV = () => {
    if (shifts.length === 0) {
      toast.error('No shifts to export');
      return;
    }

    const csv = exportScheduleToCSV(shifts, weekStart);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${weekStartStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Schedule exported to CSV');
  };

  // Render staff view
  if (currentView === 'staff') {
    if (showStaffForm) {
      return (
        <div className="space-y-6">
          <StaffForm
            staff={editingStaff}
            facilityId={facility?.id || ''}
            onSave={handleSaveStaff}
            onCancel={() => {
              setShowStaffForm(false);
              setEditingStaff(null);
            }}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Staff Management</h1>
            <p className="text-muted-foreground mt-2">Manage facility staff members</p>
          </div>
          <Button variant="outline" onClick={() => setCurrentView('calendar')}>
            Back to Calendar
          </Button>
        </div>

        <StaffList
          staff={staff}
          onAdd={() => setShowStaffForm(true)}
          onEdit={handleEditStaff}
          onDeactivate={handleDeactivateStaff}
        />
      </div>
    );
  }

  // Render time-off view
  if (currentView === 'timeoff') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Time-Off Requests</h1>
            <p className="text-muted-foreground mt-2">Manage staff time-off requests</p>
          </div>
          <Button variant="outline" onClick={() => setCurrentView('calendar')}>
            Back to Calendar
          </Button>
        </div>

        <TimeOffRequests
          requests={timeOffRequests}
          staff={staff}
          facilityId={facility?.id || ''}
          onSubmit={handleSubmitTimeOff}
          onReview={handleReviewTimeOff}
          canReview={true}
        />
      </div>
    );
  }

  // Render calendar view (default)
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Scheduling</h1>
          <p className="text-muted-foreground mt-2">
            Manage staff schedules, shifts, and time-off requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentView('staff')}>
            <Users className="mr-2 h-4 w-4" />
            Manage Staff
          </Button>
          <Button variant="outline" onClick={() => setCurrentView('timeoff')}>
            <Clock className="mr-2 h-4 w-4" />
            Time Off ({pendingTimeOff})
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={shifts.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStaff.length}</div>
            <p className="text-xs text-muted-foreground">Current active employees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week's Shifts</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekShifts}</div>
            <p className="text-xs text-muted-foreground">
              {isPublished ? 'Published' : 'Draft'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTimeOff}</div>
            <p className="text-xs text-muted-foreground">Time-off requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Shift form modal */}
      {showShiftForm && (
        <div className="mb-6">
          <ShiftForm
            shift={editingShift}
            staff={staff}
            facilityId={facility?.id || ''}
            defaultDate={shiftDefaultDate}
            onSave={handleSaveShift}
            onDelete={handleDeleteShift}
            onCancel={() => {
              setShowShiftForm(false);
              setEditingShift(null);
              setShiftDefaultDate(undefined);
            }}
          />
        </div>
      )}

      {/* Weekly calendar */}
      <WeeklyCalendar
        shifts={shifts}
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
        onShiftClick={handleShiftClick}
        onAddShift={handleAddShift}
        onCopyPreviousWeek={handleCopyPreviousWeek}
        onPublishSchedule={handlePublishSchedule}
        isPublished={isPublished}
      />
    </div>
  );
}
