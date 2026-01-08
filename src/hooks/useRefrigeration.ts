import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Fetch all refrigeration logs for a facility
export const useRefrigerationLogs = (facilityId: string | null, filters?: {
  startDate?: string;
  endDate?: string;
  rinkId?: string;
}) => {
  return useQuery({
    queryKey: ['refrigeration-logs', facilityId, filters],
    queryFn: async () => {
      if (!facilityId) return [];

      let query = supabase
        .from('refrigeration_logs')
        .select(`
          *,
          rinks (rink_name),
          profiles (first_name, last_name)
        `)
        .eq('facility_id', facilityId)
        .order('log_date', { ascending: false })
        .order('log_time', { ascending: false })
        .limit(100);

      if (filters?.startDate) {
        query = query.gte('log_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('log_date', filters.endDate);
      }

      if (filters?.rinkId) {
        query = query.eq('rink_id', filters.rinkId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Fetch a single refrigeration log
export const useRefrigerationLog = (logId: string | null) => {
  return useQuery({
    queryKey: ['refrigeration-log', logId],
    queryFn: async () => {
      if (!logId) return null;

      const { data, error } = await supabase
        .from('refrigeration_logs')
        .select(`
          *,
          rinks (rink_name),
          profiles (first_name, last_name, email)
        `)
        .eq('id', logId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!logId,
  });
};

// Fetch trend data for charts
export const useRefrigerationTrends = (facilityId: string | null, rinkId?: string, days: number = 30) => {
  return useQuery({
    queryKey: ['refrigeration-trends', facilityId, rinkId, days],
    queryFn: async () => {
      if (!facilityId) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('refrigeration_logs')
        .select('*')
        .eq('facility_id', facilityId)
        .gte('log_date', startDate.toISOString().split('T')[0])
        .order('log_date', { ascending: true })
        .order('log_time', { ascending: true });

      if (rinkId) {
        query = query.eq('rink_id', rinkId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Create a new refrigeration log
export const useCreateRefrigerationLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('refrigeration_logs')
        .insert({
          ...log,
          recorded_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refrigeration-logs'] });
      queryClient.invalidateQueries({ queryKey: ['refrigeration-trends'] });
      toast.success('Refrigeration log created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create refrigeration log', {
        description: error.message,
      });
    },
  });
};

// Update a refrigeration log
export const useUpdateRefrigerationLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('refrigeration_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refrigeration-logs'] });
      queryClient.invalidateQueries({ queryKey: ['refrigeration-log'] });
      queryClient.invalidateQueries({ queryKey: ['refrigeration-trends'] });
      toast.success('Refrigeration log updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update refrigeration log', {
        description: error.message,
      });
    },
  });
};

// Delete a refrigeration log
export const useDeleteRefrigerationLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('refrigeration_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refrigeration-logs'] });
      queryClient.invalidateQueries({ queryKey: ['refrigeration-trends'] });
      toast.success('Refrigeration log deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete refrigeration log', {
        description: error.message,
      });
    },
  });
};

// Fetch field configurations for custom fields
export const useFieldConfigurations = (facilityId: string | null) => {
  return useQuery({
    queryKey: ['refrigeration-field-configs', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];

      const { data, error } = await supabase
        .from('refrigeration_field_configs')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Create or update field configuration
export const useSaveFieldConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: any) => {
      if (config.id) {
        // Update existing
        const { data, error } = await supabase
          .from('refrigeration_field_configs')
          .update(config)
          .eq('id', config.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('refrigeration_field_configs')
          .insert(config)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refrigeration-field-configs'] });
      toast.success('Field configuration saved successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to save field configuration', {
        description: error.message,
      });
    },
  });
};

// Delete field configuration
export const useDeleteFieldConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (configId: string) => {
      // Soft delete by setting is_active to false
      const { error } = await supabase
        .from('refrigeration_field_configs')
        .update({ is_active: false })
        .eq('id', configId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refrigeration-field-configs'] });
      toast.success('Field configuration deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete field configuration', {
        description: error.message,
      });
    },
  });
};
