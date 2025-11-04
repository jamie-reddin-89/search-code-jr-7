export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cost_estimates: {
        Row: {
          created_at: string
          error_code: string
          id: string
          labor_hours: number | null
          labor_rate: number | null
          notes: string | null
          parts_cost: number | null
          system_name: string
          total_cost: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_code: string
          id?: string
          labor_hours?: number | null
          labor_rate?: number | null
          notes?: string | null
          parts_cost?: number | null
          system_name: string
          total_cost?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_code?: string
          id?: string
          labor_hours?: number | null
          labor_rate?: number | null
          notes?: string | null
          parts_cost?: number | null
          system_name?: string
          total_cost?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      diagnostic_photos: {
        Row: {
          ai_analysis: string | null
          confidence_score: number | null
          created_at: string
          equipment_identified: string | null
          id: string
          storage_path: string
          user_id: string | null
        }
        Insert: {
          ai_analysis?: string | null
          confidence_score?: number | null
          created_at?: string
          equipment_identified?: string | null
          id?: string
          storage_path: string
          user_id?: string | null
        }
        Update: {
          ai_analysis?: string | null
          confidence_score?: number | null
          created_at?: string
          equipment_identified?: string | null
          id?: string
          storage_path?: string
          user_id?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string
          id: string
          installation_date: string | null
          location: string | null
          model: string | null
          notes: string | null
          qr_code: string
          serial_number: string | null
          system_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          installation_date?: string | null
          location?: string | null
          model?: string | null
          notes?: string | null
          qr_code: string
          serial_number?: string | null
          system_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          installation_date?: string | null
          location?: string | null
          model?: string | null
          notes?: string | null
          qr_code?: string
          serial_number?: string | null
          system_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      error_codes_db: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          difficulty: string | null
          estimated_time: string | null
          id: string
          manual_url: string | null
          meaning: string
          related_codes: string[] | null
          solution: string
          brand_id: string | null
          model_id: string | null
          system_name: string
          troubleshooting_steps: Json | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          id?: string
          manual_url?: string | null
          meaning: string
          related_codes?: string[] | null
          solution: string
          brand_id?: string | null
          model_id?: string | null
          system_name: string
          troubleshooting_steps?: Json | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          difficulty?: string | null
          estimated_time?: string | null
          id?: string
          manual_url?: string | null
          meaning?: string
          related_codes?: string[] | null
          solution?: string
          brand_id?: string | null
          model_id?: string | null
          system_name?: string
          troubleshooting_steps?: Json | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      error_notes: {
        Row: {
          created_at: string | null
          error_code: string
          id: string
          note: string
          system_name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_code: string
          id?: string
          note: string
          system_name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_code?: string
          id?: string
          note?: string
          system_name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      error_photos: {
        Row: {
          created_at: string | null
          description: string | null
          error_code: string
          id: string
          storage_path: string
          system_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          error_code: string
          id?: string
          storage_path: string
          system_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          error_code?: string
          id?: string
          storage_path?: string
          system_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string | null
          error_code: string
          id: string
          system_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_code: string
          id?: string
          system_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_code?: string
          id?: string
          system_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      search_analytics: {
        Row: {
          error_code: string
          id: string
          searched_at: string | null
          system_name: string
          user_id: string | null
        }
        Insert: {
          error_code: string
          id?: string
          searched_at?: string | null
          system_name: string
          user_id?: string | null
        }
        Update: {
          error_code?: string
          id?: string
          searched_at?: string | null
          system_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      service_history: {
        Row: {
          created_at: string
          error_code: string
          id: string
          labor_hours: number | null
          notes: string | null
          parts_replaced: Json | null
          repair_date: string
          system_name: string
          total_cost: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_code: string
          id?: string
          labor_hours?: number | null
          notes?: string | null
          parts_replaced?: Json | null
          repair_date?: string
          system_name: string
          total_cost?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_code?: string
          id?: string
          labor_hours?: number | null
          notes?: string | null
          parts_replaced?: Json | null
          repair_date?: string
          system_name?: string
          total_cost?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          banned?: boolean
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          banned?: boolean
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          banned?: boolean
        }
        Relationships: []
      }
      brands: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      models: {
        Row: {
          id: string
          brand_id: string
          name: string
          description: string | null
          specs: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          description?: string | null
          specs?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          description?: string | null
          specs?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "models_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          id: string
          name: string
          url: string
          type: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          type?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          type?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      urls: {
        Row: {
          id: string
          name: string
          url: string
          category: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          category?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          category?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string | null
          session_start: string
          session_end: string | null
          ip_address: string | null
          device_info: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_start?: string
          session_end?: string | null
          ip_address?: string | null
          device_info?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_start?: string
          session_end?: string | null
          ip_address?: string | null
          device_info?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          id: string
          user_id: string | null
          activity_type: string
          path: string | null
          meta: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          activity_type: string
          path?: string | null
          meta?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          activity_type?: string
          path?: string | null
          meta?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      app_analytics: {
        Row: {
          id: string
          user_id: string | null
          device_id: string | null
          event_type: string
          path: string | null
          meta: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          device_id?: string | null
          event_type: string
          path?: string | null
          meta?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          device_id?: string | null
          event_type?: string
          path?: string | null
          meta?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      app_logs: {
        Row: {
          id: string
          level: string
          message: string
          stack_trace: Json | null
          user_id: string | null
          page_path: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          level?: string
          message: string
          stack_trace?: Json | null
          user_id?: string | null
          page_path?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          level?: string
          message?: string
          stack_trace?: Json | null
          user_id?: string | null
          page_path?: string | null
          timestamp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
