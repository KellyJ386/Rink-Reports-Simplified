import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Fetch ice machines for a facility
export const useIceMachines = (facilityId: string | null) => {
  return useQuery({
    queryKey: ['ice-machines', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];

      const { data, error } = await supabase
        .from('ice_machines')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('is_active', true)
        .order('machine_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Fetch maintenance logs
export const useMaintenanceLogs = (
  facilityId: string | null,
  maintenanceType?: string
) => {
  return useQuery({
    queryKey: ['maintenance-logs', facilityId, maintenanceType],
    queryFn: async () => {
      if (!facilityId) return [];

      let query = supabase
        .from('ice_maintenance_logs')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('facility_id', facilityId)
        .order('log_date', { ascending: false })
        .order('log_time', { ascending: false })
        .limit(50);

      if (maintenanceType) {
        query = query.eq('maintenance_type', maintenanceType);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Create maintenance log
export const useCreateMaintenanceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ice_maintenance_logs')
        .insert({
          ...log,
          operator_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
      toast.success('Log entry created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create log entry', {
        description: error.message,
      });
    },
  });
};

// Update maintenance log
export const useUpdateMaintenanceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('ice_maintenance_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
      toast.success('Log entry updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update log entry', {
        description: error.message,
      });
    },
  });
};

// Delete maintenance log
export const useDeleteMaintenanceLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('ice_maintenance_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
      toast.success('Log entry deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete log entry', {
        description: error.message,
      });
    },
  });
};
