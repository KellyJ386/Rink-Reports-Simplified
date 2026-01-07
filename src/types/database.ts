export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      facilities: {
        Row: {
          id: string
          facility_name: string
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          phone: string | null
          email: string | null
          timezone: string
          temperature_unit: 'fahrenheit' | 'celsius'
          logo_url: string | null
          logo_uploaded_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          facility_name: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          phone?: string | null
          email?: string | null
          timezone?: string
          temperature_unit?: 'fahrenheit' | 'celsius'
          logo_url?: string | null
          logo_uploaded_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          facility_name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          phone?: string | null
          email?: string | null
          timezone?: string
          temperature_unit?: 'fahrenheit' | 'celsius'
          logo_url?: string | null
          logo_uploaded_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      rinks: {
        Row: {
          id: string
          facility_id: string
          rink_name: string
          dimensions: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          rink_name: string
          dimensions?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          rink_name?: string
          dimensions?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          facility_id: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          role: 'super_admin' | 'admin' | 'manager' | 'staff'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          facility_id?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role: 'super_admin' | 'admin' | 'manager' | 'staff'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          facility_id?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: 'super_admin' | 'admin' | 'manager' | 'staff'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ice_depth_templates: {
        Row: {
          id: string
          facility_id: string
          template_name: string
          point_count: number
          template_data: Json
          is_active: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          template_name: string
          point_count: number
          template_data: Json
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          template_name?: string
          point_count?: number
          template_data?: Json
          is_active?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ice_depth_measurements: {
        Row: {
          id: string
          facility_id: string
          rink_id: string
          template_id: string
          operator_id: string
          measurement_date: string
          measurement_time: string
          unit: 'in' | 'mm'
          measurements: Json
          min_depth: number | null
          min_depth_point_id: number | null
          max_depth: number | null
          max_depth_point_id: number | null
          avg_depth: number | null
          status: 'good' | 'warning' | 'critical' | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          rink_id: string
          template_id: string
          operator_id: string
          measurement_date: string
          measurement_time: string
          unit: 'in' | 'mm'
          measurements: Json
          min_depth?: number | null
          min_depth_point_id?: number | null
          max_depth?: number | null
          max_depth_point_id?: number | null
          avg_depth?: number | null
          status?: 'good' | 'warning' | 'critical' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          rink_id?: string
          template_id?: string
          operator_id?: string
          measurement_date?: string
          measurement_time?: string
          unit?: 'in' | 'mm'
          measurements?: Json
          min_depth?: number | null
          min_depth_point_id?: number | null
          max_depth?: number | null
          max_depth_point_id?: number | null
          avg_depth?: number | null
          status?: 'good' | 'warning' | 'critical' | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schedule_staff: {
        Row: {
          id: string
          facility_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          role: 'manager' | 'supervisor' | 'attendant' | 'instructor' | 'maintenance'
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          facility_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          role: 'manager' | 'supervisor' | 'attendant' | 'instructor' | 'maintenance'
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          facility_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          role?: 'manager' | 'supervisor' | 'attendant' | 'instructor' | 'maintenance'
          status?: 'active' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      incidents: {
        Row: {
          id: string
          incident_number: string
          facility_id: string
          rink_id: string | null
          incident_date: string
          incident_time: string
          location: string
          incident_type: string
          severity: 'minor' | 'moderate' | 'serious' | 'critical'
          injured_name: string
          injured_age: number | null
          injured_phone: string | null
          injured_email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          injuries: Json
          description: string
          contributing_factors: string[] | null
          first_aid_given: boolean
          ice_pack_given: boolean
          ambulance_called: boolean
          parent_notified: boolean
          scene_secured: boolean
          medical_facility: string | null
          staff_involved_ids: string[] | null
          witnesses: Json | null
          reported_by: string
          manager_notified: boolean
          is_locked: boolean
          created_at: string
        }
        Insert: {
          id?: string
          incident_number: string
          facility_id: string
          rink_id?: string | null
          incident_date: string
          incident_time: string
          location: string
          incident_type: string
          severity: 'minor' | 'moderate' | 'serious' | 'critical'
          injured_name: string
          injured_age?: number | null
          injured_phone?: string | null
          injured_email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          injuries: Json
          description: string
          contributing_factors?: string[] | null
          first_aid_given?: boolean
          ice_pack_given?: boolean
          ambulance_called?: boolean
          parent_notified?: boolean
          scene_secured?: boolean
          medical_facility?: string | null
          staff_involved_ids?: string[] | null
          witnesses?: Json | null
          reported_by: string
          manager_notified?: boolean
          is_locked?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          incident_number?: string
          facility_id?: string
          rink_id?: string | null
          incident_date?: string
          incident_time?: string
          location?: string
          incident_type?: string
          severity?: 'minor' | 'moderate' | 'serious' | 'critical'
          injured_name?: string
          injured_age?: number | null
          injured_phone?: string | null
          injured_email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          injuries?: Json
          description?: string
          contributing_factors?: string[] | null
          first_aid_given?: boolean
          ice_pack_given?: boolean
          ambulance_called?: boolean
          parent_notified?: boolean
          scene_secured?: boolean
          medical_facility?: string | null
          staff_involved_ids?: string[] | null
          witnesses?: Json | null
          reported_by?: string
          manager_notified?: boolean
          is_locked?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_incident_number: {
        Args: {
          facility_uuid: string
          inc_date: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
