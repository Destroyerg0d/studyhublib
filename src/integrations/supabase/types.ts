export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      holidays: {
        Row: {
          created_at: string
          date: string
          id: string
          name: string
          recurring: boolean
          type: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          name: string
          recurring?: boolean
          type?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          name?: string
          recurring?: boolean
          type?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean
          created_at: string
          duration_months: number
          features: string[] | null
          id: string
          name: string
          price: number
          type: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          duration_months: number
          features?: string[] | null
          id?: string
          name: string
          price: number
          type: string
        }
        Update: {
          active?: boolean
          created_at?: string
          duration_months?: number
          features?: string[] | null
          id?: string
          name?: string
          price?: number
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          id: string
          name: string
          phone?: string | null
          role?: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      registration_forms: {
        Row: {
          created_at: string
          date_of_birth: string
          email: string
          first_name: string
          form_submitted_at: string
          gender: string
          id: string
          last_name: string
          notes: string | null
          phone: string
          preferred_study_time: string
          processed_at: string | null
          processed_by: string | null
          purpose: string
          registration_agreed: boolean
          registration_experience: string | null
          special_requirements: string | null
          status: string
          terms_accepted: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth: string
          email: string
          first_name: string
          form_submitted_at?: string
          gender: string
          id?: string
          last_name: string
          notes?: string | null
          phone: string
          preferred_study_time: string
          processed_at?: string | null
          processed_by?: string | null
          purpose: string
          registration_agreed?: boolean
          registration_experience?: string | null
          special_requirements?: string | null
          status?: string
          terms_accepted?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string
          email?: string
          first_name?: string
          form_submitted_at?: string
          gender?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string
          preferred_study_time?: string
          processed_at?: string | null
          processed_by?: string | null
          purpose?: string
          registration_agreed?: boolean
          registration_experience?: string | null
          special_requirements?: string | null
          status?: string
          terms_accepted?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registration_forms_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seats: {
        Row: {
          assigned_user_id: string | null
          created_at: string
          id: string
          row_letter: string
          seat_number: number
          status: string
          updated_at: string
        }
        Insert: {
          assigned_user_id?: string | null
          created_at?: string
          id: string
          row_letter: string
          seat_number: number
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_user_id?: string | null
          created_at?: string
          id?: string
          row_letter?: string
          seat_number?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seats_assigned_user_id_fkey"
            columns: ["assigned_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_paid: number | null
          created_at: string
          end_date: string
          id: string
          payment_date: string | null
          plan_id: string
          seat_id: string | null
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string
          end_date: string
          id?: string
          payment_date?: string | null
          plan_id: string
          seat_id?: string | null
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number | null
          created_at?: string
          end_date?: string
          id?: string
          payment_date?: string | null
          plan_id?: string
          seat_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_seat_id_fkey"
            columns: ["seat_id"]
            isOneToOne: false
            referencedRelation: "seats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_slots: {
        Row: {
          active: boolean
          created_at: string
          date: string
          description: string | null
          end_time: string
          id: string
          name: string
          plan_type: string
          time: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          date?: string
          description?: string | null
          end_time: string
          id?: string
          name: string
          plan_type?: string
          time: string
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          date?: string
          description?: string | null
          end_time?: string
          id?: string
          name?: string
          plan_type?: string
          time?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      tuition_locations: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          rates: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          rates?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          rates?: Json
          updated_at?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          aadhar_back_url: string | null
          aadhar_front_url: string | null
          created_at: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aadhar_back_url?: string | null
          aadhar_front_url?: string | null
          created_at?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aadhar_back_url?: string | null
          aadhar_front_url?: string | null
          created_at?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
