import { supabase } from '../lib/supabase';

export class DatabaseService {
  static async fetchCollectors() {
    return supabase
      .from('users_doc')
      .select('document')
      .eq('document->>role','collector')
      .then(({ data, error }) => ({
        data: data?.map(d => d.document) ?? [],
        error
      }));
  }

  static async getEvent(eventId: string) {
    const { data, error } = await supabase
      .from('events_doc')
      .select('document')
      .eq('document->>event_id', eventId)
      .single();
    if (error) throw error;
    return data.document;
  }

  static async assignCollector(eventId: string, payload: any) { /* as before */ }

  static async removeCollector(eventId: string, assignmentId: string) {
    const event = await this.getEvent(eventId);
    const updated = {
      ...event,
      collector_assignments: event.collector_assignments.map((a: any) =>
        a.assignment_id === assignmentId ? { ...a, is_active: false } : a
      )
    };
    const { error } = await supabase
      .from('events_doc')
      .update({ document: updated })
      .eq('document->>event_id', eventId);
    if (error) throw error;
  }

  static async fetchGuestlistByToken(token: string) {
    // lookup event by collector_assignments.token, return its guestlist
    // ...
  }

  static async addGuest(token: string, guest: any) {
    // append guest to event.guestlist where assignment.unique_token === token
    // ...
  }
}
