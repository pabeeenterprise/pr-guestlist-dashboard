import { supabase } from '../src/lib/supabase';

interface AutomationRule {
  id: string;
  club_id: string;
  rule_name: string;
  trigger_type: 'guest_added' | 'rsvp_confirmed' | 'event_reminder';
  conditions: any;
  actions: any;
  is_active: boolean;
  created_by: string;
}

interface EmailTemplate {
  subject: string;
  body: string;
  variables?: { [key: string]: any };
}

class AutomationService {
  async createAutomationRule(rule: Omit<AutomationRule, 'id'>) {
    const { data, error } = await supabase
      .from('automation_rules')
      .insert(rule)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async triggerAutomation(
    trigger: 'guest_added' | 'rsvp_confirmed' | 'event_reminder',
    context: any
  ) {
    try {
      // Fetch active automation rules for this trigger
      const { data: rules, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('trigger_type', trigger)
        .eq('is_active', true);

      if (error) throw error;

      for (const rule of rules || []) {
        await this.executeRule(rule, context);
      }
    } catch (error) {
      console.error('Automation trigger error:', error);
    }
  }

  private async executeRule(rule: AutomationRule, context: any) {
    const { actions } = rule;

    for (const action of actions) {
      switch (action.type) {
        case 'send_email':
          await this.sendEmail(action.template, context);
          break;
        case 'send_sms':
          await this.sendSMS(action.message, context.phone);
          break;
        case 'update_status':
          await this.updateGuestStatus(context.guest_id, action.status);
          break;
        default:
          console.log(`Unknown action type: ${action.type}`);
      }
    }
  }

  private async sendEmail(template: EmailTemplate, context: any) {
    // Replace template variables
    const subject = this.replaceVariables(template.subject, context);
    const body = this.replaceVariables(template.body, context);

    // Call Supabase Edge Function for email sending
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: context.email,
        subject,
        html: body,
      },
    });

    if (error) throw error;
    return data;
  }

  private async sendSMS(message: string, phone: string) {
    const processedMessage = this.replaceVariables(message, {});

    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: {
        to: phone,
        message: processedMessage,
      },
    });

    if (error) throw error;
    return data;
  }

  private async updateGuestStatus(guestId: string, status: string) {
    const { error } = await supabase
      .from('guestlist')
      .update({ rsvp_status: status })
      .eq('id', guestId);

    if (error) throw error;
  }

  private replaceVariables(template: string, context: any): string {
    let result = template;
    
    Object.keys(context).forEach(key => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), context[key] || '');
    });

    return result;
  }

  // Predefined automation templates
  async createWelcomeEmailAutomation(clubId: string, templateId: string) {
    return this.createAutomationRule({
      club_id: clubId,
      rule_name: 'Welcome Email on Guest Added',
      trigger_type: 'guest_added',
      conditions: {
        guest_type: ['regular', 'vip']
      },
      actions: [
        {
          type: 'send_email',
          template_id: templateId,
          delay: 0
        }
      ],
      is_active: true,
      created_by: '', // Will be set by the calling function
    });
  }

  async createRSVPReminderAutomation(clubId: string) {
    return this.createAutomationRule({
      club_id: clubId,
      rule_name: 'RSVP Reminder - 24 hours before event',
      trigger_type: 'event_reminder',
      conditions: {
        hours_before_event: 24,
        rsvp_status: 'pending'
      },
      actions: [
        {
          type: 'send_email',
          template: {
            subject: 'Reminder: Please confirm your attendance for {{event_name}}',
            body: `
              <h2>Don't forget to confirm!</h2>
              <p>Hi {{guest_name}},</p>
              <p>This is a friendly reminder that {{event_name}} is tomorrow at {{event_time}}.</p>
              <p>Please confirm your attendance by clicking the link below:</p>
              <a href="{{rsvp_link}}">Confirm Attendance</a>
              <p>We look forward to seeing you!</p>
            `
          }
        }
      ],
      is_active: true,
      created_by: '',
    });
  }
}

export const automationService = new AutomationService();

// Usage in components:
// automationService.triggerAutomation('guest_added', {
//   guest_name: 'John Doe',
//   email: 'john@example.com',
//   event_name: 'VIP Party',
//   event_time: '9 PM'
// });
