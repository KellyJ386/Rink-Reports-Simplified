import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Fetch staff for a facility
export const useScheduleStaff = (facilityId: string | null) => {
  return useQuery({
    queryKey: ['schedule-staff', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];

      const { data, error } = await supabase
        .from('schedule_staff')
        .select('*')
        .eq('facility_id', facilityId)
        .order('last_name')
        .order('first_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Fetch shifts for a date range
export const useShifts = (facilityId: string | null, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['schedule-shifts', facilityId, startDate, endDate],
    queryFn: async () => {
      if (!facilityId) return [];

      const { data, error } = await supabase
        .from('schedule_shifts')
        .select(`
          *,
          schedule_staff (
            first_name,
            last_name,
            email,
            role
          )
        `)
        .eq('facility_id', facilityId)
        .gte('shift_date', startDate)
        .lte('shift_date', endDate)
        .order('shift_date')
        .order('start_time');

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId && !!startDate && !!endDate,
  });
};

// Fetch time-off requests
export const useTimeOffRequests = (facilityId: string | null, status?: string) => {
  return useQuery({
    queryKey: ['schedule-time-off', facilityId, status],
    queryFn: async () => {
      if (!facilityId) return [];

      let query = supabase
        .from('schedule_time_off')
        .select(`
          *,
          schedule_staff (
            first_name,
            last_name,
            email
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('facility_id', facilityId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Create staff member
export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (staff: any) => {
      const { data, error } = await supabase
        .from('schedule_staff')
        .insert(staff)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-staff'] });
      toast.success('Staff member added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add staff member', {
        description: error.message,
      });
    },
  });
};

// Update staff member
export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('schedule_staff')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-staff'] });
      toast.success('Staff member updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update staff member', {
        description: error.message,
      });
    },
  });
};

// Create shift
export const useCreateShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shift: any) => {
      const { data, error } = await supabase
        .from('schedule_shifts')
        .insert(shift)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast.success('Shift created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create shift', {
        description: error.message,
      });
    },
  });
};

// Update shift
export const useUpdateShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('schedule_shifts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast.success('Shift updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update shift', {
        description: error.message,
      });
    },
  });
};

// Delete shift
export const useDeleteShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shiftId: string) => {
      const { error } = await supabase
        .from('schedule_shifts')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast.success('Shift deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete shift', {
        description: error.message,
      });
    },
  });
};

// Publish schedule
export const usePublishSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ facilityId, startDate, endDate }: any) => {
      const { error } = await supabase
        .from('schedule_shifts')
        .update({ is_published: true })
        .eq('facility_id', facilityId)
        .gte('shift_date', startDate)
        .lte('shift_date', endDate);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast.success('Schedule published successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to publish schedule', {
        description: error.message,
      });
    },
  });
};

// Copy previous week's schedule
export const useCopyPreviousWeek = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ facilityId, fromStartDate, fromEndDate, toStartDate }: any) => {
      // Fetch previous week's shifts
      const { data: previousShifts, error: fetchError } = await supabase
        .from('schedule_shifts')
        .select('*')
        .eq('facility_id', facilityId)
        .gte('shift_date', fromStartDate)
        .lte('shift_date', fromEndDate);

      if (fetchError) throw fetchError;
      if (!previousShifts || previousShifts.length === 0) {
        throw new Error('No shifts found in previous week');
      }

      // Calculate day offset
      const fromDate = new Date(fromStartDate);
      const toDate = new Date(toStartDate);
      const dayOffset = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

      // Create new shifts with offset dates
      const newShifts = previousShifts.map(shift => {
        const shiftDate = new Date(shift.shift_date);
        shiftDate.setDate(shiftDate.getDate() + dayOffset);

        return {
          facility_id: shift.facility_id,
          shift_date: shiftDate.toISOString().split('T')[0],
          start_time: shift.start_time,
          end_time: shift.end_time,
          shift_type: shift.shift_type,
          role: shift.role,
          assigned_staff_id: shift.assigned_staff_id,
          special_instructions: shift.special_instructions,
          is_published: false,
        };
      });

      const { error: insertError } = await supabase
        .from('schedule_shifts')
        .insert(newShifts);

      if (insertError) throw insertError;

      return newShifts.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] });
      toast.success(`Copied ${count} shifts from previous week`);
    },
    onError: (error: any) => {
      toast.error('Failed to copy previous week', {
        description: error.message,
      });
    },
  });
};

// Create time-off request
export const useCreateTimeOffRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: any) => {
      const { data, error } = await supabase
        .from('schedule_time_off')
        .insert(request)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-time-off'] });
      toast.success('Time-off request submitted');
    },
    onError: (error: any) => {
      toast.error('Failed to submit request', {
        description: error.message,
      });
    },
  });
};

// Review time-off request
export const useReviewTimeOffRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('schedule_time_off')
        .update({
          status,
          review_notes: notes,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['schedule-time-off'] });
      toast.success(`Time-off request ${data.status}`);
    },
    onError: (error: any) => {
      toast.error('Failed to review request', {
        description: error.message,
      });
    },
  });
};
