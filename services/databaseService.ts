import { supabase } from '../lib/supabase';

export class DatabaseService {
  // === USER OPERATIONS ===
  
  static async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users_doc')
      .insert({
        document: {
          user_id: userData.id,
          email: userData.email,
          role: userData.role || 'pr',
          profile: {
            full_name: userData.full_name || '',
            phone: userData.phone || '',
            avatar_url: userData.avatar_url || ''
          },
          club_assignments: [],
          preferences: {
            notification_email: true,
            notification_sms: false,
            dashboard_theme: 'light'
          },
          metadata: {
            last_login: new Date().toISOString(),
            total_events_created: 0,
            total_guests_managed: 0
          }
        }
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUser(userId: string) {
    const { data, error } = await supabase
      .from('users_doc')
      .select('document')
      .eq('document->>user_id', userId)
      .single();
    
    if (error) throw error;
    return data?.document;
  }

  static async updateUser(userId: string, updates: any) {
    // First fetch current document
    const currentUser = await this.getUser(userId);
    
    const { data, error } = await supabase
      .from('users_doc')
      .update({
        document: {
          ...currentUser,
          ...updates,
          updated_at: new Date().toISOString()
        }
      })
      .eq('document->>user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data?.document;
  }

  // === EVENT OPERATIONS ===
  
  static async createEvent(eventData: any) {
    const eventId = `evt_${Date.now()}`;
    
    const { data, error } = await supabase
      .from('events_doc')
      .insert({
        document: {
          event_id: eventId,
          basic_info: {
            name: eventData.name,
            description: eventData.description || '',
            venue: eventData.venue || '',
            date: eventData.date,
            capacity: eventData.capacity || 100,
            type: eventData.type || 'public'
          },
          organizer: {
            pr_id: eventData.pr_id,
            pr_name: eventData.pr_name,
            club_id: eventData.club_id || 'skylite_nagpur'
          },
          collector_assignments: [],
          guestlist: [],
          analytics: {
            total_invites: 0,
            confirmed: 0,
            declined: 0,
            pending: 0,
            checked_in: 0,
            conversion_rate: 0
          },
          automation_rules: []
        }
      })
      .select()
      .single();
    
    if (error) throw error;
    return data?.document;
  }

  static async getEventsByPR(prId: string) {
    const { data, error } = await supabase
      .from('events_doc')
      .select('document')
      .eq('document->organizer->>pr_id', prId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(item => item.document) || [];
  }

  static async getEvent(eventId: string) {
    const { data, error } = await supabase
      .from('events_doc')
      .select('document')
      .eq('document->>event_id', eventId)
      .single();
    
    if (error) throw error;
    return data?.document;
  }

  static async addGuestToEvent(eventId: string, guestData: any) {
    // Get current event
    const currentEvent = await this.getEvent(eventId);
    
    const guestId = `guest_${Date.now()}`;
    const newGuest = {
      guest_id: guestId,
      personal_info: {
        name: guestData.name,
        email: guestData.email || '',
        phone: guestData.phone || ''
      },
      booking_details: {
        guest_type: guestData.guest_type || 'regular',
        plus_ones: guestData.plus_ones || 0,
        special_notes: guestData.special_notes || '',
        rsvp_status: 'pending',
        checked_in: false
      },
      collector_info: {
        added_by: guestData.collector_id,
        assignment_id: guestData.assignment_id
      },
      timestamps: {
        added_at: new Date().toISOString()
      }
    };

    // Update event with new guest
    const { data, error } = await supabase
      .from('events_doc')
      .update({
        document: {
          ...currentEvent,
          guestlist: [...currentEvent.guestlist, newGuest],
          analytics: {
            ...currentEvent.analytics,
            total_invites: currentEvent.guestlist.length + 1
          }
        }
      })
      .eq('document->>event_id', eventId)
      .select()
      .single();
    
    if (error) throw error;
    return data?.document;
  }

  static async assignCollector(eventId: string, collectorData: any) {
    const currentEvent = await this.getEvent(eventId);
    
    const assignmentId = `assign_${Date.now()}`;
    const uniqueToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    
    const newAssignment = {
      assignment_id: assignmentId,
      collector_id: collectorData.collector_id,
      collector_name: collectorData.collector_name,
      unique_token: uniqueToken,
      invitation_link: `https://yourapp.com/collect/${uniqueToken}`,
      assigned_at: new Date().toISOString(),
      is_active: true,
      performance: {
        guests_added: 0,
        confirmed_guests: 0,
        last_activity: new Date().toISOString()
      }
    };

    const { data, error } = await supabase
      .from('events_doc')
      .update({
        document: {
          ...currentEvent,
          collector_assignments: [...currentEvent.collector_assignments, newAssignment]
        }
      })
      .eq('document->>event_id', eventId)
      .select()
      .single();
    
    if (error) throw error;
    return data?.document;
  }

  // === TEMPLATE OPERATIONS ===
  
  static async createTemplate(templateData: any) {
    const templateId = `tpl_${Date.now()}`;
    
    const { data, error } = await supabase
      .from('templates_doc')
      .insert({
        document: {
          template_id: templateId,
          metadata: {
            name: templateData.name,
            description: templateData.description || '',
            created_by: templateData.created_by,
            club_id: templateData.club_id || 'skylite_nagpur',
            is_default: templateData.is_default || false,
            category: templateData.category || 'welcome_email'
          },
          content: {
            subject: templateData.subject || '',
            email_body: templateData.email_body || '',
            sms_message: templateData.sms_message || ''
          },
          variables: templateData.variables || [],
          settings: {
            auto_send: templateData.auto_send || false,
            send_delay_minutes: templateData.send_delay_minutes || 0,
            retry_failed: true,
            max_retries: 3
          },
          analytics: {
            times_used: 0,
            open_rate: 0,
            click_rate: 0,
            last_used: null
          }
        }
      })
      .select()
      .single();
    
    if (error) throw error;
    return data?.document;
  }

  static async getTemplatesByUser(userId: string) {
    const { data, error } = await supabase
      .from('templates_doc')
      .select('document')
      .eq('document->metadata->>created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(item => item.document) || [];
  }
}
