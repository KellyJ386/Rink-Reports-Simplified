import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Fetch all tabs for a facility
export const useDailyReportTabs = (facilityId: string | null) => {
  return useQuery({
    queryKey: ['daily-report-tabs', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];

      const { data, error } = await supabase
        .from('daily_report_tabs')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('is_active', true)
        .order('tab_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Fetch a single tab
export const useDailyReportTab = (tabId: string | null) => {
  return useQuery({
    queryKey: ['daily-report-tab', tabId],
    queryFn: async () => {
      if (!tabId) return null;

      const { data, error } = await supabase
        .from('daily_report_tabs')
        .select('*')
        .eq('id', tabId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tabId,
  });
};

// Create a new tab
export const useCreateDailyReportTab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tab: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('daily_report_tabs')
        .insert({
          ...tab,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-report-tabs'] });
      toast.success('Report tab created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create report tab', {
        description: error.message,
      });
    },
  });
};

// Update a tab
export const useUpdateDailyReportTab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('daily_report_tabs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-report-tabs'] });
      queryClient.invalidateQueries({ queryKey: ['daily-report-tab'] });
      toast.success('Report tab updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update report tab', {
        description: error.message,
      });
    },
  });
};

// Delete a tab (soft delete)
export const useDeleteDailyReportTab = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tabId: string) => {
      const { error } = await supabase
        .from('daily_report_tabs')
        .update({ is_active: false })
        .eq('id', tabId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-report-tabs'] });
      toast.success('Report tab deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete report tab', {
        description: error.message,
      });
    },
  });
};

// Reorder tabs
export const useReorderDailyReportTabs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tabs: { id: string; tab_order: number }[]) => {
      const updates = tabs.map((tab) =>
        supabase
          .from('daily_report_tabs')
          .update({ tab_order: tab.tab_order })
          .eq('id', tab.id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        throw new Error('Failed to reorder tabs');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-report-tabs'] });
      toast.success('Tabs reordered successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to reorder tabs', {
        description: error.message,
      });
    },
  });
};

// Fetch submissions for a tab
export const useDailyReportSubmissions = (facilityId: string | null, tabId?: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['daily-report-submissions', facilityId, tabId, startDate, endDate],
    queryFn: async () => {
      if (!facilityId) return [];

      let query = supabase
        .from('daily_report_submissions')
        .select(`
          *,
          daily_report_tabs (tab_name),
          profiles (first_name, last_name)
        `)
        .eq('facility_id', facilityId)
        .order('report_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(100);

      if (tabId) {
        query = query.eq('tab_id', tabId);
      }

      if (startDate) {
        query = query.gte('report_date', startDate);
      }

      if (endDate) {
        query = query.lte('report_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Create a submission
export const useCreateDailyReportSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submission: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('daily_report_submissions')
        .insert({
          ...submission,
          submitted_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-report-submissions'] });
      toast.success('Daily report submitted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to submit daily report', {
        description: error.message,
      });
    },
  });
};

// Update a submission
export const useUpdateDailyReportSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('daily_report_submissions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-report-submissions'] });
      toast.success('Daily report updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update daily report', {
        description: error.message,
      });
    },
  });
};

// Delete a submission
export const useDeleteDailyReportSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase
        .from('daily_report_submissions')
        .delete()
        .eq('id', submissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-report-submissions'] });
      toast.success('Daily report deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete daily report', {
        description: error.message,
      });
    },
  });
};
