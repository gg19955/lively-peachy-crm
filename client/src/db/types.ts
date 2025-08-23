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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      call: {
        Row: {
          call_datetime: string
          call_type: string | null
          contact_id: number
          created_at: string | null
          id: number
          notes: string | null
          outcome: string
          user_id: number
        }
        Insert: {
          call_datetime: string
          call_type?: string | null
          contact_id: number
          created_at?: string | null
          id?: number
          notes?: string | null
          outcome: string
          user_id: number
        }
        Update: {
          call_datetime?: string
          call_type?: string | null
          contact_id?: number
          created_at?: string | null
          id?: number
          notes?: string | null
          outcome?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "call_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "call_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      contact: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          id: number
          name: string
          phone_number: string
          user_id: number
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          name: string
          phone_number: string
          user_id: number
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          name?: string
          phone_number?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "contact_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_interaction: {
        Row: {
          call_duration: number | null
          call_outcome: string | null
          contact_id: number
          created_at: string | null
          email_subject: string | null
          follow_up_date: string | null
          id: number
          interaction_date: string
          interaction_type: string
          meeting_location: string | null
          notes: string | null
          updated_at: string | null
          user_id: number
        }
        Insert: {
          call_duration?: number | null
          call_outcome?: string | null
          contact_id: number
          created_at?: string | null
          email_subject?: string | null
          follow_up_date?: string | null
          id?: number
          interaction_date: string
          interaction_type: string
          meeting_location?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id: number
        }
        Update: {
          call_duration?: number | null
          call_outcome?: string | null
          contact_id?: number
          created_at?: string | null
          email_subject?: string | null
          follow_up_date?: string | null
          id?: number
          interaction_date?: string
          interaction_type?: string
          meeting_location?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "contact_interaction_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_interaction_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      email_template: {
        Row: {
          body: string
          created_at: string | null
          id: number
          is_default: boolean | null
          name: string
          subject: string
          updated_at: string | null
          user_id: number
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: number
          is_default?: boolean | null
          name: string
          subject: string
          updated_at?: string | null
          user_id: number
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: number
          is_default?: boolean | null
          name?: string
          subject?: string
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "email_template_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection: {
        Row: {
          cleaning_quality: number | null
          created_at: string | null
          id: number
          inspection_date: string
          inspection_notes: string | null
          inspection_type: string
          maintenance_garden: number | null
          overall_condition: number | null
          photos: string | null
          property_id: number
          report_document_path: string | null
          updated_at: string | null
          user_id: number
        }
        Insert: {
          cleaning_quality?: number | null
          created_at?: string | null
          id?: number
          inspection_date: string
          inspection_notes?: string | null
          inspection_type: string
          maintenance_garden?: number | null
          overall_condition?: number | null
          photos?: string | null
          property_id: number
          report_document_path?: string | null
          updated_at?: string | null
          user_id: number
        }
        Update: {
          cleaning_quality?: number | null
          created_at?: string | null
          id?: number
          inspection_date?: string
          inspection_notes?: string | null
          inspection_type?: string
          maintenance_garden?: number | null
          overall_condition?: number | null
          photos?: string | null
          property_id?: number
          report_document_path?: string | null
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "inspection_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      lead: {
        Row: {
          attachments: string | null
          closed_at: string | null
          closed_by: number | null
          closure_reason: string | null
          company_size: string | null
          contact_role: string | null
          created_at: string | null
          email: string | null
          email_clicks: number | null
          email_opens: number | null
          id: number
          interaction_count: number | null
          is_closed: boolean | null
          last_contact_date: string | null
          lead_score: number | null
          lead_source: string
          lead_stage: string | null
          name: string
          notes: string | null
          phone_number: string
          photo_gallery_link: string | null
          primary_manager_id: number | null
          priority: string | null
          property_address: string
          proposal_document_path: string | null
          reason_for_str: string | null
          referred_by: string | null
          response_quality: string | null
          response_time_hours: number | null
          score_factors: string | null
          secondary_manager_id: number | null
          timeline: string | null
          updated_at: string | null
          user_id: number
        }
        Insert: {
          attachments?: string | null
          closed_at?: string | null
          closed_by?: number | null
          closure_reason?: string | null
          company_size?: string | null
          contact_role?: string | null
          created_at?: string | null
          email?: string | null
          email_clicks?: number | null
          email_opens?: number | null
          id?: number
          interaction_count?: number | null
          is_closed?: boolean | null
          last_contact_date?: string | null
          lead_score?: number | null
          lead_source: string
          lead_stage?: string | null
          name: string
          notes?: string | null
          phone_number: string
          photo_gallery_link?: string | null
          primary_manager_id?: number | null
          priority?: string | null
          property_address: string
          proposal_document_path?: string | null
          reason_for_str?: string | null
          referred_by?: string | null
          response_quality?: string | null
          response_time_hours?: number | null
          score_factors?: string | null
          secondary_manager_id?: number | null
          timeline?: string | null
          updated_at?: string | null
          user_id: number
        }
        Update: {
          attachments?: string | null
          closed_at?: string | null
          closed_by?: number | null
          closure_reason?: string | null
          company_size?: string | null
          contact_role?: string | null
          created_at?: string | null
          email?: string | null
          email_clicks?: number | null
          email_opens?: number | null
          id?: number
          interaction_count?: number | null
          is_closed?: boolean | null
          last_contact_date?: string | null
          lead_score?: number | null
          lead_source?: string
          lead_stage?: string | null
          name?: string
          notes?: string | null
          phone_number?: string
          photo_gallery_link?: string | null
          primary_manager_id?: number | null
          priority?: string | null
          property_address?: string
          proposal_document_path?: string | null
          reason_for_str?: string | null
          referred_by?: string | null
          response_quality?: string | null
          response_time_hours?: number | null
          score_factors?: string | null
          secondary_manager_id?: number | null
          timeline?: string | null
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "lead_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_primary_manager_id_fkey"
            columns: ["primary_manager_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_secondary_manager_id_fkey"
            columns: ["secondary_manager_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      property: {
        Row: {
          address: string | null
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: number | null
          guesty_id: string | null
          id: number
          last_synced: string | null
          listed_with: string | null
          nickname: string | null
          property_address: string | null
          property_code: string | null
          property_manager_id: number | null
          property_type: string | null
          status: string | null
          title: string | null
        }
        Insert: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: number | null
          guesty_id?: string | null
          id?: number
          last_synced?: string | null
          listed_with?: string | null
          nickname?: string | null
          property_address?: string | null
          property_code?: string | null
          property_manager_id?: number | null
          property_type?: string | null
          status?: string | null
          title?: string | null
        }
        Update: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: number | null
          guesty_id?: string | null
          id?: number
          last_synced?: string | null
          listed_with?: string | null
          nickname?: string | null
          property_address?: string | null
          property_code?: string | null
          property_manager_id?: number | null
          property_type?: string | null
          status?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_property_manager_id_fkey"
            columns: ["property_manager_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      property_contact: {
        Row: {
          airbnb_cleaning_fee: number | null
          airbnb_link: string | null
          bins_info: string | null
          cleaners_charge: number | null
          cleaning_team: string | null
          cleaning_team_christmas_update: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          contract_signed_date: string | null
          created_at: string | null
          created_by: number
          gardener: string | null
          go_live_date: string | null
          id: number
          lead_id: number | null
          minimum_days: number | null
          original_lead_id: number | null
          original_lead_source: string | null
          owner_charge: number | null
          owners_discount: number | null
          owners_names: string | null
          pool: boolean | null
          pool_heating: boolean | null
          pool_heating_cost_summer: number | null
          pool_heating_cost_winter: number | null
          pool_spa_options: string | null
          primary_manager_id: number | null
          properties_coming_off_update: string | null
          property_address: string
          property_code: string | null
          property_manager: string | null
          property_notes: string | null
          property_sleeps: number | null
          public_holiday_sundays: string | null
          reason_for_str: string | null
          referred_by: string | null
          secondary_manager_id: number | null
          spa: boolean | null
          status: string | null
          suburb: string | null
          timeline: string | null
          updated_at: string | null
          website_link: string | null
        }
        Insert: {
          airbnb_cleaning_fee?: number | null
          airbnb_link?: string | null
          bins_info?: string | null
          cleaners_charge?: number | null
          cleaning_team?: string | null
          cleaning_team_christmas_update?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone?: string | null
          contract_signed_date?: string | null
          created_at?: string | null
          created_by: number
          gardener?: string | null
          go_live_date?: string | null
          id?: number
          lead_id?: number | null
          minimum_days?: number | null
          original_lead_id?: number | null
          original_lead_source?: string | null
          owner_charge?: number | null
          owners_discount?: number | null
          owners_names?: string | null
          pool?: boolean | null
          pool_heating?: boolean | null
          pool_heating_cost_summer?: number | null
          pool_heating_cost_winter?: number | null
          pool_spa_options?: string | null
          primary_manager_id?: number | null
          properties_coming_off_update?: string | null
          property_address: string
          property_code?: string | null
          property_manager?: string | null
          property_notes?: string | null
          property_sleeps?: number | null
          public_holiday_sundays?: string | null
          reason_for_str?: string | null
          referred_by?: string | null
          secondary_manager_id?: number | null
          spa?: boolean | null
          status?: string | null
          suburb?: string | null
          timeline?: string | null
          updated_at?: string | null
          website_link?: string | null
        }
        Update: {
          airbnb_cleaning_fee?: number | null
          airbnb_link?: string | null
          bins_info?: string | null
          cleaners_charge?: number | null
          cleaning_team?: string | null
          cleaning_team_christmas_update?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          contract_signed_date?: string | null
          created_at?: string | null
          created_by?: number
          gardener?: string | null
          go_live_date?: string | null
          id?: number
          lead_id?: number | null
          minimum_days?: number | null
          original_lead_id?: number | null
          original_lead_source?: string | null
          owner_charge?: number | null
          owners_discount?: number | null
          owners_names?: string | null
          pool?: boolean | null
          pool_heating?: boolean | null
          pool_heating_cost_summer?: number | null
          pool_heating_cost_winter?: number | null
          pool_spa_options?: string | null
          primary_manager_id?: number | null
          properties_coming_off_update?: string | null
          property_address?: string
          property_code?: string | null
          property_manager?: string | null
          property_notes?: string | null
          property_sleeps?: number | null
          public_holiday_sundays?: string | null
          reason_for_str?: string | null
          referred_by?: string | null
          secondary_manager_id?: number | null
          spa?: boolean | null
          status?: string | null
          suburb?: string | null
          timeline?: string | null
          updated_at?: string | null
          website_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_contact_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_contact_original_lead_id_fkey"
            columns: ["original_lead_id"]
            isOneToOne: false
            referencedRelation: "lead"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_contact_primary_manager_id_fkey"
            columns: ["primary_manager_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_contact_secondary_manager_id_fkey"
            columns: ["secondary_manager_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: number | null
          attachments: string | null
          category: string | null
          created_at: string | null
          description: string
          id: number
          payment_method: string | null
          property_id: number
          purchase_date: string
          receipt_number: string | null
          status: string | null
          updated_at: string | null
          user_id: number
          vendor_name: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: number | null
          attachments?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          id?: number
          payment_method?: string | null
          property_id: number
          purchase_date: string
          receipt_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: number
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: number | null
          attachments?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          id?: number
          payment_method?: string | null
          property_id?: number
          purchase_date?: string
          receipt_number?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: number
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_filter: {
        Row: {
          created_at: string | null
          filter_name: string
          id: number
          is_default: boolean | null
          property_ids: string
          updated_at: string | null
          user_id: number
        }
        Insert: {
          created_at?: string | null
          filter_name: string
          id?: number
          is_default?: boolean | null
          property_ids: string
          updated_at?: string | null
          user_id: number
        }
        Update: {
          created_at?: string | null
          filter_name?: string
          id?: number
          is_default?: boolean | null
          property_ids?: string
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "saved_filter_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      sop: {
        Row: {
          attachments: string | null
          author_id: number
          common_mistakes: string | null
          created_at: string | null
          created_date: string | null
          description: string | null
          expected_outcomes: string | null
          feedback: string | null
          id: number
          is_custom: boolean | null
          revised_date: string | null
          revision_notes: string | null
          status: string | null
          steps: string | null
          submitted_date: string | null
          topic: string
          updated_at: string | null
          view_count: number | null
          walked_through_by_id: number | null
          walked_through_date: string | null
        }
        Insert: {
          attachments?: string | null
          author_id: number
          common_mistakes?: string | null
          created_at?: string | null
          created_date?: string | null
          description?: string | null
          expected_outcomes?: string | null
          feedback?: string | null
          id?: number
          is_custom?: boolean | null
          revised_date?: string | null
          revision_notes?: string | null
          status?: string | null
          steps?: string | null
          submitted_date?: string | null
          topic: string
          updated_at?: string | null
          view_count?: number | null
          walked_through_by_id?: number | null
          walked_through_date?: string | null
        }
        Update: {
          attachments?: string | null
          author_id?: number
          common_mistakes?: string | null
          created_at?: string | null
          created_date?: string | null
          description?: string | null
          expected_outcomes?: string | null
          feedback?: string | null
          id?: number
          is_custom?: boolean | null
          revised_date?: string | null
          revision_notes?: string | null
          status?: string | null
          steps?: string | null
          submitted_date?: string | null
          topic?: string
          updated_at?: string | null
          view_count?: number | null
          walked_through_by_id?: number | null
          walked_through_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sop_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_walked_through_by_id_fkey"
            columns: ["walked_through_by_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_assignments: {
        Row: {
          assigned_date: string
          completed_date: string | null
          created_at: string | null
          id: number
          notes: string | null
          sop_id: number
          status: string | null
          updated_at: string | null
          user_id: number
          week_assigned: string | null
        }
        Insert: {
          assigned_date: string
          completed_date?: string | null
          created_at?: string | null
          id?: number
          notes?: string | null
          sop_id: number
          status?: string | null
          updated_at?: string | null
          user_id: number
          week_assigned?: string | null
        }
        Update: {
          assigned_date?: string
          completed_date?: string | null
          created_at?: string | null
          id?: number
          notes?: string | null
          sop_id?: number
          status?: string | null
          updated_at?: string | null
          user_id?: number
          week_assigned?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sop_assignments_sop_id_fkey"
            columns: ["sop_id"]
            isOneToOne: false
            referencedRelation: "sop"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      task: {
        Row: {
          call_id: number | null
          completed: boolean | null
          completed_at: string | null
          contact_id: number
          created_at: string | null
          due_date: string
          id: number
          notes: string | null
          task_type: string
          user_id: number
        }
        Insert: {
          call_id?: number | null
          completed?: boolean | null
          completed_at?: string | null
          contact_id: number
          created_at?: string | null
          due_date: string
          id?: number
          notes?: string | null
          task_type: string
          user_id: number
        }
        Update: {
          call_id?: number | null
          completed?: boolean | null
          completed_at?: string | null
          contact_id?: number
          created_at?: string | null
          due_date?: string
          id?: number
          notes?: string | null
          task_type?: string
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "task_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "call"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          access_permissions: string | null
          avatar_color: string | null
          company: string | null
          created_at: string | null
          email: string
          first_name: string | null
          goal_message: string | null
          google_id: string | null
          id: number
          last_name: string | null
          name: string
          password_hash: string | null
          preferred_logo: string | null
          profile_completed: boolean | null
          profile_picture: string | null
          role: string | null
        }
        Insert: {
          access_permissions?: string | null
          avatar_color?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          goal_message?: string | null
          google_id?: string | null
          id?: number
          last_name?: string | null
          name: string
          password_hash?: string | null
          preferred_logo?: string | null
          profile_completed?: boolean | null
          profile_picture?: string | null
          role?: string | null
        }
        Update: {
          access_permissions?: string | null
          avatar_color?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          goal_message?: string | null
          google_id?: string | null
          id?: number
          last_name?: string | null
          name?: string
          password_hash?: string | null
          preferred_logo?: string | null
          profile_completed?: boolean | null
          profile_picture?: string | null
          role?: string | null
        }
        Relationships: []
      }
      user_property: {
        Row: {
          assigned_at: string | null
          id: number
          is_active: boolean | null
          property_id: number
          user_id: number
        }
        Insert: {
          assigned_at?: string | null
          id?: number
          is_active?: boolean | null
          property_id: number
          user_id: number
        }
        Update: {
          assigned_at?: string | null
          id?: number
          is_active?: boolean | null
          property_id?: number
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_property_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_property_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
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
