export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      dpa_downloads: {
        Row: {
          contact_email: string
          created_at: string | null
          document: string | null
          id: number
          updated_at: string | null
        }
        Insert: {
          contact_email: string
          created_at?: string | null
          document?: string | null
          id?: number
          updated_at?: string | null
        }
        Update: {
          contact_email?: string
          created_at?: string | null
          document?: string | null
          id?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      lw11_meetups: {
        Row: {
          created_at: string | null
          display_info: string | null
          edition: string | null
          id: number
          isLive: boolean
          isPublished: boolean
          link: string | null
          start_at: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          display_info?: string | null
          edition?: string | null
          id?: number
          isLive?: boolean
          isPublished?: boolean
          link?: string | null
          start_at?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          display_info?: string | null
          edition?: string | null
          id?: number
          isLive?: boolean
          isPublished?: boolean
          link?: string | null
          start_at?: string | null
          title?: string | null
        }
        Relationships: []
      }
      lw11_tickets: {
        Row: {
          company: string | null
          createdAt: string
          email: string | null
          gameWonAt: string | null
          id: string
          location: string | null
          metadata: Json | null
          name: string | null
          referred_by: string | null
          role: string | null
          sharedOnLinkedIn: string | null
          sharedOnTwitter: string | null
          ticketNumber: number
          username: string | null
        }
        Insert: {
          company?: string | null
          createdAt?: string
          email?: string | null
          gameWonAt?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          name?: string | null
          referred_by?: string | null
          role?: string | null
          sharedOnLinkedIn?: string | null
          sharedOnTwitter?: string | null
          ticketNumber?: number
          username?: string | null
        }
        Update: {
          company?: string | null
          createdAt?: string
          email?: string | null
          gameWonAt?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          name?: string | null
          referred_by?: string | null
          role?: string | null
          sharedOnLinkedIn?: string | null
          sharedOnTwitter?: string | null
          ticketNumber?: number
          username?: string | null
        }
        Relationships: []
      }
      meetups: {
        Row: {
          created_at: string | null
          country: string | null
          display_info: string | null
          id: string | number
          is_live: boolean
          is_published: boolean
          link: string | null
          start_at: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          country?: string | null
          display_info?: string | null
          id?: number
          is_live?: boolean
          is_published?: boolean
          link?: string | null
          start_at?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          country?: string | null
          display_info?: string | null
          id?: number
          is_live?: boolean
          is_published?: boolean
          link?: string | null
          start_at?: string | null
          title?: string | null
        }
        Relationships: []
      }
      mfa_early_access_contacts: {
        Row: {
          company_name: string
          company_size: string | null
          contact_email: string
          contact_first_name: string | null
          contact_last_name: string | null
          contact_name: string
          contact_phone: string | null
          contacted: boolean
          country: string | null
          created_at: string
          details: string | null
          id: number
        }
        Insert: {
          company_name: string
          company_size?: string | null
          contact_email: string
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_name: string
          contact_phone?: string | null
          contacted?: boolean
          country?: string | null
          created_at?: string
          details?: string | null
          id?: number
        }
        Update: {
          company_name?: string
          company_size?: string | null
          contact_email?: string
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_name?: string
          contact_phone?: string | null
          contacted?: boolean
          country?: string | null
          created_at?: string
          details?: string | null
          id?: number
        }
        Relationships: []
      }
      partner_contacts: {
        Row: {
          company: string
          contacted: boolean
          country: string
          created_at: string
          details: string | null
          email: string
          first: string
          id: number
          last: string
          phone: string | null
          size: number | null
          title: string | null
          type: Database['public']['Enums']['partner_type']
          website: string
        }
        Insert: {
          company: string
          contacted?: boolean
          country: string
          created_at?: string
          details?: string | null
          email: string
          first: string
          id?: number
          last: string
          phone?: string | null
          size?: number | null
          title?: string | null
          type: Database['public']['Enums']['partner_type']
          website: string
        }
        Update: {
          company?: string
          contacted?: boolean
          country?: string
          created_at?: string
          details?: string | null
          email?: string
          first?: string
          id?: number
          last?: string
          phone?: string | null
          size?: number | null
          title?: string | null
          type?: Database['public']['Enums']['partner_type']
          website?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          approved: boolean | null
          call_to_action_link: string | null
          category: string
          contact: number
          created_at: string
          description: string
          developer: string
          docs: string | null
          featured: boolean | null
          id: number
          images: string[] | null
          logo: string
          overview: string
          slug: string
          title: string
          tsv: unknown | null
          type: Database['public']['Enums']['partner_type']
          video: string | null
          website: string
        }
        Insert: {
          approved?: boolean | null
          call_to_action_link?: string | null
          category: string
          contact: number
          created_at?: string
          description: string
          developer: string
          docs?: string | null
          featured?: boolean | null
          id?: number
          images?: string[] | null
          logo: string
          overview: string
          slug: string
          title: string
          tsv?: unknown | null
          type: Database['public']['Enums']['partner_type']
          video?: string | null
          website: string
        }
        Update: {
          approved?: boolean | null
          call_to_action_link?: string | null
          category?: string
          contact?: number
          created_at?: string
          description?: string
          developer?: string
          docs?: string | null
          featured?: boolean | null
          id?: number
          images?: string[] | null
          logo?: string
          overview?: string
          slug?: string
          title?: string
          tsv?: unknown | null
          type?: Database['public']['Enums']['partner_type']
          video?: string | null
          website?: string
        }
        Relationships: [
          {
            foreignKeyName: 'partners_contact_fkey'
            columns: ['contact']
            isOneToOne: false
            referencedRelation: 'partner_contacts'
            referencedColumns: ['id']
          },
        ]
      }
      soc2_requests: {
        Row: {
          company_name: string
          company_size: string | null
          contact_email: string
          contact_first_name: string | null
          contact_last_name: string | null
          contact_name: string
          contact_phone: string | null
          contacted: boolean
          country: string | null
          created_at: string
          details: string | null
          id: number
        }
        Insert: {
          company_name: string
          company_size?: string | null
          contact_email: string
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_name: string
          contact_phone?: string | null
          contacted?: boolean
          country?: string | null
          created_at?: string
          details?: string | null
          id?: number
        }
        Update: {
          company_name?: string
          company_size?: string | null
          contact_email?: string
          contact_first_name?: string | null
          contact_last_name?: string | null
          contact_name?: string
          contact_phone?: string | null
          contacted?: boolean
          country?: string | null
          created_at?: string
          details?: string | null
          id?: number
        }
        Relationships: []
      }
    }
    Views: {
      lw11_tickets_platinum: {
        Row: {
          company: string | null
          createdAt: string | null
          id: string | null
          location: string | null
          metadata: Json | null
          name: string | null
          platinum: boolean | null
          referrals: number | null
          role: string | null
          secret: boolean | null
          sharedOnLinkedIn: string | null
          sharedOnTwitter: string | null
          ticketNumber: number | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      increment_referral: {
        Args: {
          username: string
        }
        Returns: undefined
      }
    }
    Enums: {
      continents:
        | 'Africa'
        | 'Antarctica'
        | 'Asia'
        | 'Europe'
        | 'Oceania'
        | 'North America'
        | 'South America'
      partner_type: 'technology' | 'expert'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never
