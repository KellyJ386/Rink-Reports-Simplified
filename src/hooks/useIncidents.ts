import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Generate unique incident number
const generateIncidentNumber = async (facilityId: string): Promise<string> => {
  const year = new Date().getFullYear();
  const { data, error } = await supabase
    .from('incidents')
    .select('incident_number')
    .eq('facility_id', facilityId)
    .like('incident_number', `${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = data[0].incident_number.split('-')[1];
    nextNumber = parseInt(lastNumber) + 1;
  }

  return `${year}-${String(nextNumber).padStart(4, '0')}`;
};

// Fetch all incidents for a facility
export const useIncidents = (facilityId: string | null, filters?: {
  severity?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['incidents', facilityId, filters],
    queryFn: async () => {
      if (!facilityId) return [];

      let query = supabase
        .from('incidents')
        .select(`
          *,
          rinks (rink_name),
          profiles (first_name, last_name)
        `)
        .eq('facility_id', facilityId)
        .order('incident_date', { ascending: false })
        .order('incident_time', { ascending: false })
        .limit(100);

      if (filters?.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters?.startDate) {
        query = query.gte('incident_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('incident_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Fetch a single incident
export const useIncident = (incidentId: string | null) => {
  return useQuery({
    queryKey: ['incident', incidentId],
    queryFn: async () => {
      if (!incidentId) return null;

      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          rinks (rink_name),
          profiles (first_name, last_name, email)
        `)
        .eq('id', incidentId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!incidentId,
  });
};

// Create a new incident
export const useCreateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incident: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Generate incident number
      const incidentNumber = await generateIncidentNumber(incident.facility_id);

      const { data, error } = await supabase
        .from('incidents')
        .insert({
          ...incident,
          incident_number: incidentNumber,
          reported_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident report created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create incident report', {
        description: error.message,
      });
    },
  });
};

// Update an incident
export const useUpdateIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      // Check if incident is locked
      const { data: incident } = await supabase
        .from('incidents')
        .select('is_locked')
        .eq('id', id)
        .single();

      if (incident?.is_locked) {
        throw new Error('This incident report is locked and cannot be edited');
      }

      const { data, error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident'] });
      toast.success('Incident report updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update incident report', {
        description: error.message,
      });
    },
  });
};

// Delete an incident
export const useDeleteIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incidentId: string) => {
      // Check if incident is locked
      const { data: incident } = await supabase
        .from('incidents')
        .select('is_locked')
        .eq('id', incidentId)
        .single();

      if (incident?.is_locked) {
        throw new Error('This incident report is locked and cannot be deleted');
      }

      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', incidentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      toast.success('Incident report deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete incident report', {
        description: error.message,
      });
    },
  });
};

// Lock/unlock an incident (managers only)
export const useLockIncident = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isLocked }: { id: string; isLocked: boolean }) => {
      const { data, error } = await supabase
        .from('incidents')
        .update({ is_locked: isLocked })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['incident'] });
      toast.success(data.is_locked ? 'Incident report locked' : 'Incident report unlocked');
    },
    onError: (error: any) => {
      toast.error('Failed to update lock status', {
        description: error.message,
      });
    },
  });
};
