import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Fetch all air quality logs for a facility
export const useAirQualityLogs = (facilityId: string | null, filters?: {
  startDate?: string;
  endDate?: string;
  rinkId?: string;
  hasAlerts?: boolean;
}) => {
  return useQuery({
    queryKey: ['air-quality-logs', facilityId, filters],
    queryFn: async () => {
      if (!facilityId) return [];

      let query = supabase
        .from('air_quality_logs')
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

      if (filters?.hasAlerts !== undefined) {
        query = query.eq('has_alerts', filters.hasAlerts);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Fetch a single air quality log
export const useAirQualityLog = (logId: string | null) => {
  return useQuery({
    queryKey: ['air-quality-log', logId],
    queryFn: async () => {
      if (!logId) return null;

      const { data, error } = await supabase
        .from('air_quality_logs')
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
export const useAirQualityTrends = (facilityId: string | null, rinkId?: string, days: number = 30) => {
  return useQuery({
    queryKey: ['air-quality-trends', facilityId, rinkId, days],
    queryFn: async () => {
      if (!facilityId) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('air_quality_logs')
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

// Create a new air quality log
export const useCreateAirQualityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('air_quality_logs')
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
      queryClient.invalidateQueries({ queryKey: ['air-quality-logs'] });
      queryClient.invalidateQueries({ queryKey: ['air-quality-trends'] });
      toast.success('Air quality log created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create air quality log', {
        description: error.message,
      });
    },
  });
};

// Update an air quality log
export const useUpdateAirQualityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('air_quality_logs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['air-quality-logs'] });
      queryClient.invalidateQueries({ queryKey: ['air-quality-log'] });
      queryClient.invalidateQueries({ queryKey: ['air-quality-trends'] });
      toast.success('Air quality log updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update air quality log', {
        description: error.message,
      });
    },
  });
};

// Delete an air quality log
export const useDeleteAirQualityLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('air_quality_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['air-quality-logs'] });
      queryClient.invalidateQueries({ queryKey: ['air-quality-trends'] });
      toast.success('Air quality log deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete air quality log', {
        description: error.message,
      });
    },
  });
};

// Fetch threshold configurations
export const useThresholdConfigurations = (facilityId: string | null) => {
  return useQuery({
    queryKey: ['air-quality-thresholds', facilityId],
    queryFn: async () => {
      if (!facilityId) return null;

      const { data, error } = await supabase
        .from('air_quality_thresholds')
        .select('*')
        .eq('facility_id', facilityId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" errors

      // Return defaults if no configuration exists
      return data || {
        co_warning_threshold: 9,
        co_danger_threshold: 35,
        no2_warning_threshold: 0.05,
        no2_danger_threshold: 1,
      };
    },
    enabled: !!facilityId,
  });
};

// Save threshold configuration
export const useSaveThresholdConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: any) => {
      const { data, error } = await supabase
        .from('air_quality_thresholds')
        .upsert({
          ...config,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['air-quality-thresholds'] });
      toast.success('Threshold configuration saved successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to save threshold configuration', {
        description: error.message,
      });
    },
  });
};
