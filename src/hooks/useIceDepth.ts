import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Fetch templates for a facility
export const useTemplates = (facilityId: string | null) => {
  return useQuery({
    queryKey: ['ice-depth-templates', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];

      const { data, error } = await supabase
        .from('ice_depth_templates')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Fetch measurements for a facility
export const useMeasurements = (facilityId: string | null, rinkId?: string) => {
  return useQuery({
    queryKey: ['ice-depth-measurements', facilityId, rinkId],
    queryFn: async () => {
      if (!facilityId) return [];

      let query = supabase
        .from('ice_depth_measurements')
        .select(`
          *,
          rinks (rink_name),
          profiles (first_name, last_name)
        `)
        .eq('facility_id', facilityId)
        .order('measurement_date', { ascending: false })
        .order('measurement_time', { ascending: false })
        .limit(50);

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

// Create template
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: any) => {
      const { data, error } = await supabase
        .from('ice_depth_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ice-depth-templates'] });
      toast.success('Template created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create template', {
        description: error.message,
      });
    },
  });
};

// Update template
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('ice_depth_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ice-depth-templates'] });
      toast.success('Template updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update template', {
        description: error.message,
      });
    },
  });
};

// Delete template (soft delete)
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('ice_depth_templates')
        .update({ is_active: false })
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ice-depth-templates'] });
      toast.success('Template deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete template', {
        description: error.message,
      });
    },
  });
};

// Create measurement
export const useCreateMeasurement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (measurement: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ice_depth_measurements')
        .insert({
          ...measurement,
          operator_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ice-depth-measurements'] });
    },
    onError: (error: any) => {
      toast.error('Failed to save measurement', {
        description: error.message,
      });
      throw error;
    },
  });
};

// Fetch facility info (for getting facility_id and logo)
export const useFacilityInfo = () => {
  return useQuery({
    queryKey: ['facility-info'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      if (!profile?.facility_id) return null;

      const { data: facility } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', profile.facility_id)
        .single();

      return facility;
    },
  });
};

// Fetch rinks for a facility
export const useRinks = (facilityId: string | null) => {
  return useQuery({
    queryKey: ['rinks', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];

      const { data, error } = await supabase
        .from('rinks')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('is_active', true)
        .order('rink_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};
