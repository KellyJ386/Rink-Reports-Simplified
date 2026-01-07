import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Copy, Send, Plus } from 'lucide-react';
import { format, addWeeks, subWeeks } from 'date-fns';
import {
  getWeekDays,
  getWeekRange,
  getWeekLabel,
  getShiftTypeColor,
  formatShiftTime,
  groupShiftsByDate,
} from '@/lib/schedulingUtils';

interface WeeklyCalendarProps {
  shifts: any[];
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  onShiftClick: (shift: any) => void;
  onAddShift: (date: string) => void;
  onCopyPreviousWeek: () => void;
  onPublishSchedule: () => void;
  isPublished: boolean;
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  shifts,
  currentWeek,
  onWeekChange,
  onShiftClick,
  onAddShift,
  onCopyPreviousWeek,
  onPublishSchedule,
  isPublished,
}) => {
  const { start: weekStart } = getWeekRange(currentWeek);
  const weekDays = getWeekDays(weekStart);
  const groupedShifts = groupShiftsByDate(shifts);

  const goToPreviousWeek = () => {
    onWeekChange(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    onWeekChange(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    onWeekChange(new Date());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Weekly Schedule</CardTitle>
            <CardDescription>{getWeekLabel(weekStart)}</CardDescription>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onCopyPreviousWeek}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Last Week
            </Button>
            <Button
              size="sm"
              onClick={onPublishSchedule}
              disabled={isPublished || shifts.length === 0}
            >
              <Send className="mr-2 h-4 w-4" />
              {isPublished ? 'Published' : 'Publish'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {weekDays.map((day) => {
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={day.toISOString()}
                className={`text-center p-2 rounded-t-lg ${
                  isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <div className="font-semibold">{format(day, 'EEE')}</div>
                <div className="text-sm">{format(day, 'MMM d')}</div>
              </div>
            );
          })}

          {/* Day cells with shifts */}
          {weekDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayShifts = groupedShifts[dateStr] || [];
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[300px] border rounded-b-lg p-2 space-y-1 ${
                  isToday ? 'border-primary border-2' : ''
                }`}
              >
                {dayShifts.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddShift(dateStr)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Shift
                    </Button>
                  </div>
                ) : (
                  <>
                    {dayShifts.map((shift) => {
                      const staffName = shift.schedule_staff
                        ? `${shift.schedule_staff.first_name} ${shift.schedule_staff.last_name.charAt(0)}.`
                        : 'Unassigned';

                      return (
                        <div
                          key={shift.id}
                          onClick={() => onShiftClick(shift)}
                          className={`p-2 rounded border cursor-pointer hover:shadow-md transition-shadow ${getShiftTypeColor(
                            shift.shift_type
                          )}`}
                        >
                          <div className="text-xs font-semibold truncate">
                            {formatShiftTime(shift.start_time, shift.end_time)}
                          </div>
                          <div className="text-xs truncate">{shift.role}</div>
                          <div className="text-xs font-medium truncate mt-1">
                            {staffName}
                          </div>
                        </div>
                      );
                    })}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddShift(dateStr)}
                      className="w-full text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="font-medium">Shift Types:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
            <span>Opening</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div>
            <span>Closing</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
            <span>Mid</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
            <span>Event</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
