export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          company: string
          contract_value: number | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          logo: string | null
          name: string
          phone: string | null
          priority: string | null
          status: string | null
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          company: string
          contract_value?: number | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          logo?: string | null
          name: string
          phone?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          company?: string
          contract_value?: number | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          logo?: string | null
          name?: string
          phone?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          related_to: string | null
          related_type: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          related_to?: string | null
          related_type?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          related_to?: string | null
          related_type?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      project_type_data: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string | null
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id?: string | null
          value?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string | null
          value?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          client: string
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          progress: number | null
          status: string | null
          team: Json | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          team?: Json | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          team?: Json | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      revenue_data: {
        Row: {
          category: string | null
          costs: number | null
          created_at: string
          id: string
          month: string
          notes: string | null
          source: string | null
          updated_at: string
          user_id: string | null
          value: number
          year: number
        }
        Insert: {
          category?: string | null
          costs?: number | null
          created_at?: string
          id?: string
          month: string
          notes?: string | null
          source?: string | null
          updated_at?: string
          user_id?: string | null
          value?: number
          year: number
        }
        Update: {
          category?: string | null
          costs?: number | null
          created_at?: string
          id?: string
          month?: string
          notes?: string | null
          source?: string | null
          updated_at?: string
          user_id?: string | null
          value?: number
          year?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          activeprojects: number | null
          availability: string | null
          avatar: string | null
          created_at: string
          id: string
          name: string
          role: string
          skills: string[] | null
          updated_at: string
          user_id: string | null
          workload: number | null
        }
        Insert: {
          activeprojects?: number | null
          availability?: string | null
          avatar?: string | null
          created_at?: string
          id?: string
          name: string
          role: string
          skills?: string[] | null
          updated_at?: string
          user_id?: string | null
          workload?: number | null
        }
        Update: {
          activeprojects?: number | null
          availability?: string | null
          avatar?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: string
          skills?: string[] | null
          updated_at?: string
          user_id?: string | null
          workload?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
