import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// =====================================================
// USERS
// =====================================================

export const useUsers = (facilityId: string | undefined) => {
  return useQuery({
    queryKey: ['users', facilityId],
    queryFn: async () => {
      if (!facilityId) return []

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          email:auth.users(email)
        `)
        .eq('facility_id', facilityId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Flatten email from nested object
      return data.map((profile) => ({
        ...profile,
        email: profile.email?.[0]?.email || null,
      }))
    },
    enabled: !!facilityId,
  })
}

export const useUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) return null

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          email:auth.users(email)
        `)
        .eq('id', userId)
        .single()

      if (error) throw error

      return {
        ...data,
        email: data.email?.[0]?.email || null,
      }
    },
    enabled: !!userId,
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id: string
      first_name?: string
      last_name?: string
      phone?: string
      role?: string
      is_active?: boolean
    }) => {
      const { id, ...updates } = data

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('User updated successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to update user', {
        description: error.message,
      })
    },
  })
}

export const useInviteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      email: string
      facility_id: string
      role: string
      first_name?: string
      last_name?: string
    }) => {
      // For now, this creates a user invitation record
      // In production, this would send an email invitation
      const { error } = await supabase.from('user_invitations').insert({
        email: data.email,
        facility_id: data.facility_id,
        role: data.role,
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })

      if (error) throw error

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User invitation sent successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to invite user', {
        description: error.message,
      })
    },
  })
}

// =====================================================
// PERMISSIONS
// =====================================================

export const useUserPermissions = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['permissions', userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

export const useAllPermissions = (facilityId: string | undefined) => {
  return useQuery({
    queryKey: ['all-permissions', facilityId],
    queryFn: async () => {
      if (!facilityId) return []

      // Get all users in facility with their permissions
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          role,
          user_permissions (*)
        `)
        .eq('facility_id', facilityId)

      if (usersError) throw usersError
      return users
    },
    enabled: !!facilityId,
  })
}

export const useUpdatePermission = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      user_id: string
      module_name: string
      permission_level: 'none' | 'view' | 'submit' | 'full'
    }) => {
      // Check if permission exists
      const { data: existing } = await supabase
        .from('user_permissions')
        .select('id')
        .eq('user_id', data.user_id)
        .eq('module_name', data.module_name)
        .single()

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('user_permissions')
          .update({ permission_level: data.permission_level })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase
          .from('user_permissions')
          .insert(data)

        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] })
      queryClient.invalidateQueries({ queryKey: ['all-permissions'] })
      toast.success('Permission updated')
    },
    onError: (error: any) => {
      toast.error('Failed to update permission', {
        description: error.message,
      })
    },
  })
}

// =====================================================
// FACILITY
// =====================================================

export const useFacility = (facilityId: string | undefined) => {
  return useQuery({
    queryKey: ['facility', facilityId],
    queryFn: async () => {
      if (!facilityId) return null

      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', facilityId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!facilityId,
  })
}

export const useUpdateFacility = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      id: string
      facility_name?: string
      address?: string
      city?: string
      state?: string
      zip?: string
      phone?: string
      email?: string
      timezone?: string
      temperature_unit?: 'fahrenheit' | 'celsius'
    }) => {
      const { id, ...updates } = data

      const { error } = await supabase
        .from('facilities')
        .update(updates)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility'] })
      toast.success('Facility settings updated')
    },
    onError: (error: any) => {
      toast.error('Failed to update facility', {
        description: error.message,
      })
    },
  })
}

export const useUploadFacilityLogo = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { facilityId: string; file: File }) => {
      // Upload to Supabase Storage
      const filePath = `facility-logos/${data.facilityId}/${Date.now()}-${data.file.name}`

      const { error: uploadError } = await supabase.storage
        .from('facility-assets')
        .upload(filePath, data.file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('facility-assets')
        .getPublicUrl(filePath)

      // Update facility record
      const { error: updateError } = await supabase
        .from('facilities')
        .update({
          logo_url: urlData.publicUrl,
          logo_uploaded_at: new Date().toISOString(),
        })
        .eq('id', data.facilityId)

      if (updateError) throw updateError

      return urlData.publicUrl
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility'] })
      toast.success('Logo uploaded successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to upload logo', {
        description: error.message,
      })
    },
  })
}

// =====================================================
// CURRENT USER INFO
// =====================================================

export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    },
  })
}
