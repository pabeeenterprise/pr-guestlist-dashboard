import { Guest, GuestFormData } from '../types';
import { apiService } from './apiService';

class GuestService {
  // Get all guests
  async getGuests(params?: { 
    page?: number; 
    limit?: number; 
    eventId?: string; 
    rsvpStatus?: string; 
    search?: string 
  }): Promise<Guest[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.eventId) queryParams.append('eventId', params.eventId);
    if (params?.rsvpStatus) queryParams.append('rsvpStatus', params.rsvpStatus);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/guests${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiService.get(endpoint);
    return response.data;
  }

  // Get guest by ID
  async getGuestById(id: string): Promise<Guest> {
    const response = await apiService.get(`/guests/${id}`);
    return response.data;
  }

  // Get guests by event ID
  async getGuestsByEventId(eventId: string): Promise<Guest[]> {
    const response = await apiService.get(`/guests/event/${eventId}`);
    return response.data;
  }

  // Add new guest
  async addGuest(guestData: GuestFormData): Promise<Guest> {
    const response = await apiService.post('/guests', guestData);
    return response.data;
  }

  // Update guest
  async updateGuest(id: string, guestData: Partial<Guest>): Promise<Guest> {
    const response = await apiService.put(`/guests/${id}`, guestData);
    return response.data;
  }

  // Delete guest
  async deleteGuest(id: string): Promise<void> {
    await apiService.delete(`/guests/${id}`);
  }

  // Check in guest
  async checkInGuest(id: string): Promise<Guest> {
    const response = await apiService.patch(`/guests/${id}/checkin`);
    return response.data;
  }

  // Get guest statistics
  // async getGuestStats(): Promise<any> {
  //   const response = await apiService.get('/guests/stats');
  //   return response.data;
  // }

  // Export guests to CSV (frontend implementation)
  exportToCSV(guests: Guest[]): string {
    const headers = [
      'Event Name', 'First Name', 'Last Name', 'Email', 'Phone', 
      'Company', 'Position', 'RSVP Status', 'Plus Ones', 
      'Dietary Requirements', 'Special Requests', 'Registration Date', 
      'Check-in Time', 'Notes'
    ];
    
    const csvData = guests.map(guest => [
      guest.eventName,
      guest.firstName,
      guest.lastName,
      guest.email,
      guest.phone,
      guest.company,
      guest.position,
      guest.rsvpStatus,
      guest.plusOnes.toString(),
      guest.dietaryRequirements,
      guest.specialRequests,
      guest.registrationDate,
      guest.checkInTime || '',
      guest.notes
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  // Import guests from CSV (frontend implementation)
  importFromCSV(csvText: string, eventId?: string): Guest[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(header => 
      header.replace(/"/g, '').trim().toLowerCase()
    );
    
    const importedGuests: Guest[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(value => 
        value.replace(/^"|"$/g, '').trim()
      );
      
      const guestData: Partial<Guest> = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        switch (header) {
          case 'event name':
            guestData.eventName = value;
            break;
          case 'first name':
            guestData.firstName = value;
            break;
          case 'last name':
            guestData.lastName = value;
            break;
          case 'email':
            guestData.email = value;
            break;
          case 'phone':
            guestData.phone = value;
            break;
          case 'company':
            guestData.company = value;
            break;
          case 'position':
            guestData.position = value;
            break;
          case 'rsvp status':
            guestData.rsvpStatus = value as Guest['rsvpStatus'];
            break;
          case 'plus ones':
            guestData.plusOnes = parseInt(value) || 0;
            break;
          case 'dietary requirements':
            guestData.dietaryRequirements = value;
            break;
          case 'special requests':
            guestData.specialRequests = value;
            break;
          case 'notes':
            guestData.notes = value;
            break;
        }
      });

      if (guestData.firstName && guestData.lastName && guestData.email) {
        importedGuests.push({
          id: `imported-${Date.now()}-${i}`,
          eventId: eventId || '1',
          eventName: guestData.eventName || 'Imported Event',
          firstName: guestData.firstName!,
          lastName: guestData.lastName!,
          email: guestData.email!,
          phone: guestData.phone || '',
          company: guestData.company || '',
          position: guestData.position || '',
          rsvpStatus: guestData.rsvpStatus || 'pending',
          plusOnes: guestData.plusOnes || 0,
          dietaryRequirements: guestData.dietaryRequirements || '',
          specialRequests: guestData.specialRequests || '',
          registrationDate: new Date().toISOString().split('T')[0],
          notes: guestData.notes || ''
        } as Guest);
      }
    }

    return importedGuests;
  }

  // Get guest statistics
  getGuestStats(guests: Guest[]) {
    const total = guests.length;
    const confirmed = guests.filter(g => g.rsvpStatus === 'confirmed').length;
    const attended = guests.filter(g => g.rsvpStatus === 'attended').length;
    const pending = guests.filter(g => g.rsvpStatus === 'pending').length;
    const declined = guests.filter(g => g.rsvpStatus === 'declined').length;
    
    return {
      total,
      confirmed,
      attended,
      pending,
      declined,
      attendanceRate: total > 0 ? Math.round((attended / total) * 100) : 0
    };
  }
}

export const guestService = new GuestService();