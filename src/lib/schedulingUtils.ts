import { startOfWeek, endOfWeek, addDays, format, parse } from 'date-fns';

// Get week range
export const getWeekRange = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
  const end = endOfWeek(date, { weekStartsOn: 0 });

  return { start, end };
};

// Get days of week
export const getWeekDays = (startDate: Date) => {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
};

// Format time for display
export const formatShiftTime = (startTime: string, endTime: string) => {
  const start = parse(startTime, 'HH:mm:ss', new Date());
  const end = parse(endTime, 'HH:mm:ss', new Date());

  return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
};

// Get shift type color
export const getShiftTypeColor = (type: string) => {
  const colors = {
    opening: 'bg-blue-100 text-blue-800 border-blue-200',
    closing: 'bg-purple-100 text-purple-800 border-purple-200',
    mid: 'bg-green-100 text-green-800 border-green-200',
    event: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Get shift type label
export const getShiftTypeLabel = (type: string) => {
  const labels = {
    opening: 'Opening',
    closing: 'Closing',
    mid: 'Mid Shift',
    event: 'Event',
  };

  return labels[type as keyof typeof labels] || type;
};

// Calculate shift duration in hours
export const calculateShiftDuration = (startTime: string, endTime: string): number => {
  const start = parse(startTime, 'HH:mm:ss', new Date());
  const end = parse(endTime, 'HH:mm:ss', new Date());

  const diffMs = end.getTime() - start.getTime();
  return diffMs / (1000 * 60 * 60);
};

// Check if staff is available (not on time-off)
export const isStaffAvailable = (
  staffId: string,
  date: string,
  timeOffRequests: any[]
): boolean => {
  const checkDate = new Date(date);

  return !timeOffRequests.some((request) => {
    if (request.staff_id !== staffId || request.status !== 'approved') {
      return false;
    }

    const startDate = new Date(request.start_date);
    const endDate = new Date(request.end_date);

    return checkDate >= startDate && checkDate <= endDate;
  });
};

// Group shifts by date
export const groupShiftsByDate = (shifts: any[]) => {
  return shifts.reduce((acc, shift) => {
    const date = shift.shift_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(shift);
    return acc;
  }, {} as Record<string, any[]>);
};

// Get shifts for a specific day
export const getShiftsForDay = (shifts: any[], date: string) => {
  return shifts.filter((shift) => shift.shift_date === date);
};

// Validate shift time
export const validateShiftTime = (startTime: string, endTime: string): boolean => {
  const start = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());

  return end > start;
};

// Check for shift conflicts
export const hasShiftConflict = (
  staffId: string,
  date: string,
  startTime: string,
  endTime: string,
  existingShifts: any[],
  excludeShiftId?: string
): boolean => {
  const newStart = parse(startTime, 'HH:mm:ss', new Date());
  const newEnd = parse(endTime, 'HH:mm:ss', new Date());

  return existingShifts.some((shift) => {
    if (shift.id === excludeShiftId) return false;
    if (shift.shift_date !== date) return false;
    if (shift.assigned_staff_id !== staffId) return false;

    const existingStart = parse(shift.start_time, 'HH:mm:ss', new Date());
    const existingEnd = parse(shift.end_time, 'HH:mm:ss', new Date());

    // Check for overlap
    return newStart < existingEnd && newEnd > existingStart;
  });
};

// Export schedule to CSV
export const exportScheduleToCSV = (shifts: any[], weekStart: Date): string => {
  const headers = ['Date', 'Day', 'Shift Type', 'Role', 'Staff', 'Start Time', 'End Time', 'Duration', 'Instructions'];
  const rows = shifts.map((shift) => {
    const date = new Date(shift.shift_date);
    const duration = calculateShiftDuration(shift.start_time, shift.end_time);
    const staffName = shift.schedule_staff
      ? `${shift.schedule_staff.first_name} ${shift.schedule_staff.last_name}`
      : 'Unassigned';

    return [
      format(date, 'yyyy-MM-dd'),
      format(date, 'EEEE'),
      getShiftTypeLabel(shift.shift_type),
      shift.role,
      staffName,
      format(parse(shift.start_time, 'HH:mm:ss', new Date()), 'h:mm a'),
      format(parse(shift.end_time, 'HH:mm:ss', new Date()), 'h:mm a'),
      `${duration.toFixed(1)}h`,
      shift.special_instructions || '',
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return csv;
};

// Get week label
export const getWeekLabel = (startDate: Date) => {
  const endDate = endOfWeek(startDate, { weekStartsOn: 0 });
  return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
};
