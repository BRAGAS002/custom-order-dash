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
      ai_image_generations: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          model_used: string | null
          prompt: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          model_used?: string | null
          prompt: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          model_used?: string | null
          prompt?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          order_id: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          order_id: string
          sender_id: string
          sender_type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          order_id?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          business_id: string
          created_at: string | null
          customer_id: string
          id: string
          last_message_at: string | null
          order_id: string | null
          shop_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string | null
          customer_id: string
          id?: string
          last_message_at?: string | null
          order_id?: string | null
          shop_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          last_message_at?: string | null
          order_id?: string | null
          shop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      customization_groups: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_required: boolean | null
          name: string
          product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          name: string
          product_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_required?: boolean | null
          name?: string
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customization_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      customization_options: {
        Row: {
          created_at: string | null
          display_order: number | null
          group_id: string
          id: string
          is_default: boolean | null
          name: string
          price_modifier: number | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          group_id: string
          id?: string
          is_default?: boolean | null
          name: string
          price_modifier?: number | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          group_id?: string
          id?: string
          is_default?: boolean | null
          name?: string
          price_modifier?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "customization_options_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "customization_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      design_assets: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          max_uses: number | null
          min_order_amount: number | null
          shop_id: string | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          shop_id?: string | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          min_order_amount?: number | null
          shop_id?: string | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      order_design_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          order_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          order_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          order_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_design_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_item_customizations: {
        Row: {
          created_at: string | null
          customization_group: string
          id: string
          order_item_id: string
          price_modifier: number | null
          selected_option: string
        }
        Insert: {
          created_at?: string | null
          customization_group: string
          id?: string
          order_item_id: string
          price_modifier?: number | null
          selected_option: string
        }
        Update: {
          created_at?: string | null
          customization_group?: string
          id?: string
          order_item_id?: string
          price_modifier?: number | null
          selected_option?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_item_customizations_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          design_file_url: string | null
          id: string
          notes: string | null
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          design_file_url?: string | null
          id?: string
          notes?: string | null
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          design_file_url?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string
          created_at: string | null
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          changed_by: string
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          changed_by?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string | null
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          delivery_address: string
          discount_amount: number | null
          discount_code_id: string | null
          fulfillment_type: string | null
          id: string
          notes: string | null
          order_number: string
          order_status: string | null
          payment_method: string | null
          payment_status: string | null
          product_id: string | null
          product_name: string
          quantity: number
          rush_fee: number | null
          rush_type: string | null
          scheduled_date: string | null
          shop_id: string
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          delivery_address: string
          discount_amount?: number | null
          discount_code_id?: string | null
          fulfillment_type?: string | null
          id?: string
          notes?: string | null
          order_number: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_id?: string | null
          product_name: string
          quantity?: number
          rush_fee?: number | null
          rush_type?: string | null
          scheduled_date?: string | null
          shop_id: string
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string
          discount_amount?: number | null
          discount_code_id?: string | null
          fulfillment_type?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          order_status?: string | null
          payment_method?: string | null
          payment_status?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          rush_fee?: number | null
          rush_type?: string | null
          scheduled_date?: string | null
          shop_id?: string
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          order_id: string
          payment_method: string
          payment_status: string | null
          proof_url: string | null
          reference_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id: string
          payment_method: string
          payment_status?: string | null
          proof_url?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          payment_method?: string
          payment_status?: string | null
          proof_url?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          created_at: string | null
          display_order: number | null
          formula: string | null
          id: string
          is_active: boolean | null
          max_quantity: number | null
          min_quantity: number | null
          name: string
          price_per_unit: number | null
          product_id: string
          rule_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          formula?: string | null
          id?: string
          is_active?: boolean | null
          max_quantity?: number | null
          min_quantity?: number | null
          name: string
          price_per_unit?: number | null
          product_id: string
          rule_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          formula?: string | null
          id?: string
          is_active?: boolean | null
          max_quantity?: number | null
          min_quantity?: number | null
          name?: string
          price_per_unit?: number | null
          product_id?: string
          rule_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category: string | null
          created_at: string | null
          custom_size_support: boolean | null
          description: string | null
          estimated_days: number | null
          file_upload_required: boolean | null
          fulfillment_type: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          max_order_quantity: number | null
          min_order_quantity: number | null
          name: string
          rush_support: boolean | null
          shop_id: string
          total_orders: number | null
          updated_at: string | null
        }
        Insert: {
          base_price: number
          category?: string | null
          created_at?: string | null
          custom_size_support?: boolean | null
          description?: string | null
          estimated_days?: number | null
          file_upload_required?: boolean | null
          fulfillment_type?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_order_quantity?: number | null
          min_order_quantity?: number | null
          name: string
          rush_support?: boolean | null
          shop_id: string
          total_orders?: number | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          category?: string | null
          created_at?: string | null
          custom_size_support?: boolean | null
          description?: string | null
          estimated_days?: number | null
          file_upload_required?: boolean | null
          fulfillment_type?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          max_order_quantity?: number | null
          min_order_quantity?: number | null
          name?: string
          rush_support?: boolean | null
          shop_id?: string
          total_orders?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string
          id: string
          order_id: string
          product_id: string | null
          rating: number
          shop_id: string
          updated_at: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          order_id: string
          product_id?: string | null
          rating: number
          shop_id: string
          updated_at?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          order_id?: string
          product_id?: string | null
          rating?: number
          shop_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_services: {
        Row: {
          collection_name: string | null
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          collection_name?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          collection_name?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_services_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      service_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string | null
          allowed_payment_methods: string[] | null
          business_documents: Json | null
          created_at: string | null
          description: string | null
          email: string | null
          gcash_name: string | null
          gcash_number: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          rush_options: Json | null
          status: string | null
          supported_fulfillment: string[] | null
          total_orders: number | null
          total_revenue: number | null
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          address?: string | null
          allowed_payment_methods?: string[] | null
          business_documents?: Json | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          gcash_name?: string | null
          gcash_number?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          rush_options?: Json | null
          status?: string | null
          supported_fulfillment?: string[] | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          address?: string | null
          allowed_payment_methods?: string[] | null
          business_documents?: Json | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          gcash_name?: string | null
          gcash_number?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          rush_options?: Json | null
          status?: string | null
          supported_fulfillment?: string[] | null
          total_orders?: number | null
          total_revenue?: number | null
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          order_id: string | null
          payment_id: string | null
          shop_id: string | null
          status: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          shop_id?: string | null
          status?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          shop_id?: string | null
          status?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reports: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reported_id: string
          reported_type: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reported_id: string
          reported_type: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reported_type?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      app_role: "admin" | "business" | "customer"
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
      app_role: ["admin", "business", "customer"],
    },
  },
} as const
