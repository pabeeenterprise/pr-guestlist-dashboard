// src/services/authService.ts
import { User, LoginRequest, RegisterRequest } from '../types/auth';

// Mock user data - replace with actual database calls
const mockUsers: User[] = [
  {
    id: '1',
    uuid: 'user-123',
    email: 'admin@eventmanager.com',
    firstName: 'System',
    lastName: 'Admin',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    uuid: 'user-456',
    email: 'manager@eventmanager.com',
    firstName: 'Event',
    lastName: 'Manager',
    role: 'manager',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

class AuthService {
  // Simple token generation (for demo only)
  private generateToken(user: User): string {
    return `demo-token-${user.id}-${Date.now()}`;
  }

  // Login user - SIMPLIFIED: Just check if email exists
  async login(loginData: LoginRequest): Promise<{ user: User; token: string }> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Find user by email
        const user = mockUsers.find(u => u.email === loginData.email);
        
        if (!user) {
          reject(new Error('Email not found'));
          return;
        }

        if (!user.isActive) {
          reject(new Error('Account is deactivated'));
          return;
        }

        // SIMPLIFIED: No password check, just return user if email exists
        // Update last login
        user.lastLogin = new Date().toISOString();

        // Generate token
        const token = this.generateToken(user);

        resolve({ user, token });
      }, 1000);
    });
  }

  // Register new user - SIMPLIFIED: Just check if email already exists
  async register(registerData: RegisterRequest): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if user already exists
        const existingUser = mockUsers.find(u => u.email === registerData.email);
        if (existingUser) {
          reject(new Error('User already exists with this email'));
          return;
        }

        // Create new user
        const newUser: User = {
          id: (mockUsers.length + 1).toString(),
          uuid: `user-${Date.now()}`,
          email: registerData.email,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          role: registerData.role || 'staff',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        mockUsers.push(newUser);
        resolve(newUser);
      }, 1000);
    });
  }

  // Validate token
  async validateToken(token: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Extract user ID from token (demo token format: demo-token-{userId}-{timestamp})
        const match = token.match(/demo-token-(\d+)-/);
        if (match) {
          const userId = match[1];
          const user = mockUsers.find(u => u.id === userId);
          resolve(user || null);
        } else {
          resolve(null);
        }
      }, 500);
    });
  }

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === id);
        resolve(user || null);
      }, 500);
    });
  }

  // Check if email exists (new simple method)
  async checkEmailExists(email: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.email === email);
        resolve(!!user);
      }, 500);
    });
  }
}

export const authService = new AuthService();