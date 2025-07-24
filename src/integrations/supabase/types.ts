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
      canteen_items: {
        Row: {
          available: boolean
          category: Database["public"]["Enums"]["food_category"]
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          name: string
          nutritional_info: Json | null
          preparation_time: number | null
          price: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          category: Database["public"]["Enums"]["food_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          name: string
          nutritional_info?: Json | null
          preparation_time?: number | null
          price: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          category?: Database["public"]["Enums"]["food_category"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          name?: string
          nutritional_info?: Json | null
          preparation_time?: number | null
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      canteen_orders: {
        Row: {
          coupon_id: string | null
          created_at: string
          delivered_at: string | null
          discount_amount: number | null
          estimated_time: number | null
          id: string
          items: Json
          order_number: string
          original_amount: number | null
          paid_at: string | null
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          special_instructions: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_id?: string | null
          created_at?: string
          delivered_at?: string | null
          discount_amount?: number | null
          estimated_time?: number | null
          id?: string
          items?: Json
          order_number: string
          original_amount?: number | null
          paid_at?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          special_instructions?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string | null
          created_at?: string
          delivered_at?: string | null
          discount_amount?: number | null
          estimated_time?: number | null
          id?: string
          items?: Json
          order_number?: string
          original_amount?: number | null
          paid_at?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          special_instructions?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "canteen_orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          discount_amount: number
          final_amount: number
          id: string
          order_id: string
          order_type: string
          original_amount: number
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          discount_amount: number
          final_amount: number
          id?: string
          order_id: string
          order_type: string
          original_amount: number
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          discount_amount?: number
          final_amount?: number
          id?: string
          order_id?: string
          order_type?: string
          original_amount?: number
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          active: boolean
          applicable_to: string
          code: string
          created_at: string
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          max_discount: number | null
          min_amount: number | null
          name: string
          updated_at: string
          usage_limit: number | null
          used_count: number | null
          valid_from: string
          valid_until: string
        }
        Insert: {
          active?: boolean
          applicable_to?: string
          code: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          max_discount?: number | null
          min_amount?: number | null
          name: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_until: string
        }
        Update: {
          active?: boolean
          applicable_to?: string
          code?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          max_discount?: number | null
          min_amount?: number | null
          name?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string
          valid_until?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      payments: {
        Row: {
          amount: number
          coupon_id: string | null
          created_at: string
          currency: string
          discount_amount: number | null
          id: string
          metadata: Json | null
          original_amount: number | null
          paid_at: string | null
          payment_method: string | null
          plan_id: string | null
          razorpay_order_id: string
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          coupon_id?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          id?: string
          metadata?: Json | null
          original_amount?: number | null
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          razorpay_order_id: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          coupon_id?: string | null
          created_at?: string
          currency?: string
          discount_amount?: number | null
          id?: string
          metadata?: Json | null
          original_amount?: number | null
          paid_at?: string | null
          payment_method?: string | null
          plan_id?: string | null
          razorpay_order_id?: string
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
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
      seat_bookings: {
        Row: {
          created_at: string
          end_date: string
          id: string
          seat_number: number
          start_date: string
          status: string
          subscription_id: string
          time_slot: Database["public"]["Enums"]["time_slot_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          seat_number: number
          start_date: string
          status?: string
          subscription_id: string
          time_slot: Database["public"]["Enums"]["time_slot_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          seat_number?: number
          start_date?: string
          status?: string
          subscription_id?: string
          time_slot?: Database["public"]["Enums"]["time_slot_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seat_bookings_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
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
          payment_id: string | null
          plan_id: string
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
          payment_id?: string | null
          plan_id: string
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
          payment_id?: string | null
          plan_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
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
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_seat_booking: {
        Args: {
          _user_id: string
          _time_slot: Database["public"]["Enums"]["time_slot_type"]
        }
        Returns: {
          booking_id: string
          seat_number: number
          start_date: string
          end_date: string
        }[]
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      is_seat_available: {
        Args: {
          _seat_number: number
          _time_slot: Database["public"]["Enums"]["time_slot_type"]
          _start_date: string
          _end_date: string
          _exclude_booking_id?: string
        }
        Returns: boolean
      }
      release_expired_seat_bookings: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      validate_coupon: {
        Args: {
          _coupon_code: string
          _user_id: string
          _order_type: string
          _amount: number
        }
        Returns: {
          valid: boolean
          coupon_id: string
          discount_amount: number
          final_amount: number
          error_message: string
        }[]
      }
    }
    Enums: {
      food_category: "snacks" | "beverages" | "meals" | "desserts" | "healthy"
      time_slot_type: "full_day" | "morning" | "evening" | "night"
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
    Enums: {
      food_category: ["snacks", "beverages", "meals", "desserts", "healthy"],
      time_slot_type: ["full_day", "morning", "evening", "night"],
    },
  },
} as const
