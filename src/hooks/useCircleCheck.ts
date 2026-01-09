import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// =====================================================
// TEMPLATES
// =====================================================

// Fetch all circle check templates for a facility
export const useCircleCheckTemplates = (facilityId: string | null) => {
  return useQuery({
    queryKey: ['circle-check-templates', facilityId],
    queryFn: async () => {
      if (!facilityId) return [];

      const { data, error } = await supabase
        .from('circle_check_templates')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('is_active', true)
        .order('template_name');

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Fetch a single template with all items
export const useCircleCheckTemplate = (templateId: string | null) => {
  return useQuery({
    queryKey: ['circle-check-template', templateId],
    queryFn: async () => {
      if (!templateId) return null;

      const { data, error } = await supabase
        .from('circle_check_templates')
        .select(`
          *,
          circle_check_items (*)
        `)
        .eq('id', templateId)
        .single();

      if (error) throw error;

      // Sort items by order
      if (data && data.circle_check_items) {
        data.circle_check_items.sort((a: any, b: any) => a.item_order - b.item_order);
      }

      return data;
    },
    enabled: !!templateId,
  });
};

// Create a new template
export const useCreateCircleCheckTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: any) => {
      const { data, error } = await supabase
        .from('circle_check_templates')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-check-templates'] });
      toast.success('Circle check template created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create template', {
        description: error.message,
      });
    },
  });
};

// Initialize default templates for a facility
export const useInitializeDefaultTemplates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (facilityId: string) => {
      const { data, error } = await supabase.rpc('create_default_circle_check_templates', {
        p_facility_id: facilityId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-check-templates'] });
      toast.success('Default templates created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create default templates', {
        description: error.message,
      });
    },
  });
};

// =====================================================
// ITEMS
// =====================================================

// Fetch items for a template
export const useCircleCheckItems = (templateId: string | null) => {
  return useQuery({
    queryKey: ['circle-check-items', templateId],
    queryFn: async () => {
      if (!templateId) return [];

      const { data, error } = await supabase
        .from('circle_check_items')
        .select('*')
        .eq('template_id', templateId)
        .order('item_order');

      if (error) throw error;
      return data || [];
    },
    enabled: !!templateId,
  });
};

// Update item (toggle enabled, change order, etc.)
export const useUpdateCircleCheckItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('circle_check_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['circle-check-items'] });
      queryClient.invalidateQueries({ queryKey: ['circle-check-template'] });
      toast.success('Check item updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update check item', {
        description: error.message,
      });
    },
  });
};

// Bulk update item orders (for drag-and-drop)
export const useBulkUpdateItemOrders = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: { id: string; item_order: number }[]) => {
      const updates = items.map(async (item) => {
        return supabase
          .from('circle_check_items')
          .update({ item_order: item.item_order })
          .eq('id', item.id);
      });

      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-check-items'] });
      queryClient.invalidateQueries({ queryKey: ['circle-check-template'] });
      toast.success('Item order updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update item order', {
        description: error.message,
      });
    },
  });
};

// Add custom item to template
export const useAddCircleCheckItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: any) => {
      const { data, error } = await supabase
        .from('circle_check_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-check-items'] });
      queryClient.invalidateQueries({ queryKey: ['circle-check-template'] });
      toast.success('Check item added successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to add check item', {
        description: error.message,
      });
    },
  });
};

// =====================================================
// LOGS
// =====================================================

// Fetch all circle check logs for a facility
export const useCircleCheckLogs = (facilityId: string | null, filters?: {
  startDate?: string;
  endDate?: string;
  machineId?: string;
  status?: 'pass' | 'fail';
}) => {
  return useQuery({
    queryKey: ['circle-check-logs', facilityId, filters],
    queryFn: async () => {
      if (!facilityId) return [];

      let query = supabase
        .from('circle_check_logs')
        .select(`
          *,
          ice_machines (machine_name),
          profiles (first_name, last_name),
          circle_check_templates (template_name)
        `)
        .eq('facility_id', facilityId)
        .order('log_date', { ascending: false })
        .order('log_time', { ascending: false })
        .limit(50);

      if (filters?.startDate) {
        query = query.gte('log_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('log_date', filters.endDate);
      }

      if (filters?.machineId) {
        query = query.eq('machine_id', filters.machineId);
      }

      if (filters?.status) {
        query = query.eq('overall_status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!facilityId,
  });
};

// Fetch a single log with all results
export const useCircleCheckLog = (logId: string | null) => {
  return useQuery({
    queryKey: ['circle-check-log', logId],
    queryFn: async () => {
      if (!logId) return null;

      const { data, error } = await supabase
        .from('circle_check_logs')
        .select(`
          *,
          ice_machines (machine_name),
          profiles (first_name, last_name),
          circle_check_templates (template_name),
          circle_check_results (*)
        `)
        .eq('id', logId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!logId,
  });
};

// Create a new circle check log
export const useCreateCircleCheckLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logData: {
      facility_id: string;
      machine_id: string;
      template_id: string;
      log_date: string;
      log_time: string;
      results: Array<{
        item_id: string;
        item_text: string;
        status: 'pass' | 'fail' | 'n/a';
        notes?: string;
        photo?: File;
      }>;
      general_notes?: string;
      manager_notified?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate totals
      const totalItems = logData.results.length;
      const passedItems = logData.results.filter(r => r.status === 'pass').length;
      const failedItems = logData.results.filter(r => r.status === 'fail').length;
      const overallStatus = failedItems > 0 ? 'fail' : 'pass';

      // Insert log
      const { data: log, error: logError } = await supabase
        .from('circle_check_logs')
        .insert({
          facility_id: logData.facility_id,
          machine_id: logData.machine_id,
          template_id: logData.template_id,
          log_date: logData.log_date,
          log_time: logData.log_time,
          operator_id: user.id,
          total_items: totalItems,
          passed_items: passedItems,
          failed_items: failedItems,
          overall_status: overallStatus,
          general_notes: logData.general_notes || null,
          manager_notified: logData.manager_notified || false,
        })
        .select()
        .single();

      if (logError) throw logError;

      // Upload photos and insert results
      for (const result of logData.results) {
        let photoUrl: string | null = null;

        if (result.photo) {
          const photoPath = `circle-check-photos/${logData.facility_id}/${log.id}/${result.item_id}-${Date.now()}.jpg`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('circle-check-photos')
            .upload(photoPath, result.photo);

          if (uploadError) {
            console.error('Photo upload error:', uploadError);
          } else {
            photoUrl = photoPath;
          }
        }

        const { error: resultError } = await supabase
          .from('circle_check_results')
          .insert({
            log_id: log.id,
            item_id: result.item_id,
            item_text: result.item_text,
            status: result.status,
            notes: result.notes || null,
            photo_url: photoUrl,
          });

        if (resultError) throw resultError;
      }

      return log;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-check-logs'] });
      toast.success('Circle check completed successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to submit circle check', {
        description: error.message,
      });
    },
  });
};

// Delete a circle check log
export const useDeleteCircleCheckLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logId: string) => {
      const { error } = await supabase
        .from('circle_check_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['circle-check-logs'] });
      toast.success('Circle check deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete circle check', {
        description: error.message,
      });
    },
  });
};

// =====================================================
// PHOTOS
// =====================================================

// Get photo URL from Supabase Storage
export const getCircleCheckPhotoUrl = async (photoPath: string): Promise<string | null> => {
  if (!photoPath) return null;

  const { data } = await supabase.storage
    .from('circle-check-photos')
    .createSignedUrl(photoPath, 3600); // 1 hour expiry

  return data?.signedUrl || null;
};
