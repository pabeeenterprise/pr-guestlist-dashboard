import { Event, EventFormData } from '../types';
import { apiService } from './apiService';

class EventService {
  // Get all events
  async getEvents(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<Event[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/events${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiService.get(endpoint);
    return response.data;
  }

  // Get event by ID
  async getEventById(id: string): Promise<Event> {
    const response = await apiService.get(`/events/${id}`);
    return response.data;
  }

  // Add new event
  async addEvent(eventData: EventFormData): Promise<Event> {
    const response = await apiService.post('/events', eventData);
    return response.data;
  }

  // Update event
  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const response = await apiService.put(`/events/${id}`, eventData);
    return response.data;
  }

  // Delete event
  async deleteEvent(id: string): Promise<void> {
    await apiService.delete(`/events/${id}`);
  }

  // Get event statistics
  async getEventStats(): Promise<any> {
    const response = await apiService.get('/events/stats');
    return response.data;
  }

  // Get recent events
  async getRecentEvents(limit: number = 5): Promise<Event[]> {
    const response = await apiService.get(`/events/recent?limit=${limit}`);
    return response.data;
  }

  // Export events to CSV (frontend implementation)
  exportToCSV(events: Event[]): string {
    const headers = ['Name', 'Date', 'Venue', 'Guests', 'Genre', 'Status', 'PR Manager', 'Budget', 'Created At'];
    const csvData = events.map(event => [
      event.name,
      event.date,
      event.venue,
      event.guests.toString(),
      event.genre,
      event.status,
      event.prManager,
      `$${event.budget?.toLocaleString()}`,
      event.createdAt
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  // Import events from CSV (frontend implementation)
  importFromCSV(csvText: string): Event[] {
    // This is a frontend-only implementation for CSV parsing
    // In a real app, you might want to send this to the backend
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
    
    const importedEvents: Event[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => value.trim());
      const event: Partial<Event> = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        switch (header) {
          case 'name':
            event.name = value;
            break;
          case 'date':
            event.date = value;
            break;
          case 'venue':
            event.venue = value;
            break;
          case 'guests':
            event.guests = parseInt(value) || 0;
            break;
          case 'genre':
            event.genre = value;
            break;
          case 'status':
            event.status = value as 'draft' | 'published' | 'cancelled';
            break;
          case 'pr manager':
            event.prManager = value;
            break;
          case 'budget':
            event.budget = parseInt(value.replace('$', '').replace(/,/g, '')) || 0;
            break;
        }
      });

      if (event.name && event.date) {
        importedEvents.push({
          id: `imported-${Date.now()}-${i}`,
          name: event.name!,
          date: event.date!,
          venue: event.venue || 'TBD',
          guests: event.guests || 0,
          genre: event.genre || 'Other',
          status: event.status || 'draft',
          prManager: event.prManager || 'Unassigned',
          budget: event.budget || 0,
          createdAt: new Date().toISOString().split('T')[0]
        } as Event);
      }
    }

    return importedEvents;
  }
}

export const eventService = new EventService();