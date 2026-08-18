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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cms_content: {
        Row: {
          attachment_url: string | null
          category: string | null
          content_type: Database["public"]["Enums"]["cms_content_type"]
          created_at: string
          description: string
          external_url: string | null
          id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["cms_status"]
          submitted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          category?: string | null
          content_type: Database["public"]["Enums"]["cms_content_type"]
          created_at?: string
          description: string
          external_url?: string | null
          id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["cms_status"]
          submitted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          category?: string | null
          content_type?: Database["public"]["Enums"]["cms_content_type"]
          created_at?: string
          description?: string
          external_url?: string | null
          id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["cms_status"]
          submitted_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      media_posts: {
        Row: {
          created_at: string
          description: string | null
          embed_url: string | null
          file_url: string | null
          id: string
          kind: string
          published: boolean
          published_at: string
          source: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          embed_url?: string | null
          file_url?: string | null
          id?: string
          kind?: string
          published?: boolean
          published_at?: string
          source?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          embed_url?: string | null
          file_url?: string | null
          id?: string
          kind?: string
          published?: boolean
          published_at?: string
          source?: string
          title?: string
        }
        Relationships: []
      }
      petition_signatures: {
        Row: {
          comment: string | null
          created_at: string
          email: string
          id: string
          name: string
          zip: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          zip: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          zip?: string
        }
        Relationships: []
      }
      prisoner_profiles: {
        Row: {
          bio: string | null
          created_at: string
          facility: string | null
          featured: boolean
          id: string
          name: string
          photo_url: string | null
          published: boolean
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          facility?: string | null
          featured?: boolean
          id?: string
          name: string
          photo_url?: string | null
          published?: boolean
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          facility?: string | null
          featured?: boolean
          id?: string
          name?: string
          photo_url?: string | null
          published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profile_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          kind: string
          media_url: string | null
          profile_id: string
          published: boolean
          title: string
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          media_url?: string | null
          profile_id: string
          published?: boolean
          title: string
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          kind?: string
          media_url?: string | null
          profile_id?: string
          published?: boolean
          title?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "prisoner_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          body: string | null
          created_at: string
          embed_url: string | null
          facility: string | null
          id: string
          media_kind: string | null
          media_url: string[]
          person_name: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitter_email: string | null
          submitter_name: string | null
          title: string | null
          type: string
          year: number | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          embed_url?: string | null
          facility?: string | null
          id?: string
          media_kind?: string | null
          media_url?: string[]
          person_name?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitter_email?: string | null
          submitter_name?: string | null
          title?: string | null
          type?: string
          year?: number | null
        }
        Update: {
          body?: string | null
          created_at?: string
          embed_url?: string | null
          facility?: string | null
          id?: string
          media_kind?: string | null
          media_url?: string[]
          person_name?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitter_email?: string | null
          submitter_name?: string | null
          title?: string | null
          type?: string
          year?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_offers: {
        Row: {
          created_at: string
          details: string | null
          email: string
          id: string
          name: string
          offer_type: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          email: string
          id?: string
          name: string
          offer_type?: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          email?: string
          id?: string
          name?: string
          offer_type?: string
          status?: string
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
      cms_content_type: "resource" | "legislation" | "proposal"
      cms_status: "pending" | "approved" | "rejected"
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
      cms_content_type: ["resource", "legislation", "proposal"],
      cms_status: ["pending", "approved", "rejected"],
    },
  },
} as const
