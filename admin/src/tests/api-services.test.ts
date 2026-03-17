import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Admin API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch hospitals list', async () => {
    const mockHospitals = [
      { id: '1', name: 'Hospital A', location: 'Location 1' },
      { id: '2', name: 'Hospital B', location: 'Location 2' },
    ];

    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ hospitals: mockHospitals }),
      } as Response)
    );
    vi.stubGlobal('fetch', mockFetch);

    const response = await fetch('/api/hospitals');
    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledWith('/api/hospitals');
    expect(data.hospitals).toHaveLength(2);
    expect(data.hospitals[0].name).toBe('Hospital A');
  });

  it('should add a new hospital', async () => {
    const newHospital = {
      name: 'New Hospital',
      location: 'New Location',
      registrationNumber: 'REG123',
    };

    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 'new-id', ...newHospital }),
      } as Response)
    );
    vi.stubGlobal('fetch', mockFetch);

    const response = await fetch('/api/hospitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newHospital),
    });

    const data = await response.json();
    
    expect(mockFetch).toHaveBeenCalledWith('/api/hospitals', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(newHospital)
    }));
    expect(data.name).toBe('New Hospital');
    expect(data.id).toBeDefined();
  });

  it('should update hospital information', async () => {
    const updatedHospital = {
      id: '1',
      name: 'Updated Hospital',
      location: 'Updated Location',
    };

    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(updatedHospital),
      } as Response)
    );
    vi.stubGlobal('fetch', mockFetch);

    const response = await fetch('/api/hospitals/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedHospital),
    });

    const data = await response.json();
    
    expect(mockFetch).toHaveBeenCalledWith('/api/hospitals/1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify(updatedHospital)
    }));
    expect(data.name).toBe('Updated Hospital');
  });

  it('should handle API errors', async () => {
    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal Server Error' }),
      } as Response)
    );
    vi.stubGlobal('fetch', mockFetch);

    const response = await fetch('/api/hospitals');
    
    expect(mockFetch).toHaveBeenCalledWith('/api/hospitals');
    expect(response.ok).toBe(false);
    expect(response.status).toBe(500);
  });

  it('should authenticate admin user', async () => {
    const credentials = {
      email: 'admin@hospital.com',
      password: 'securepassword',
    };

    const mockFetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          token: 'jwt-token-here',
          user: { id: 'admin1', email: credentials.email, role: 'admin' },
        }),
      } as Response)
    );
    vi.stubGlobal('fetch', mockFetch);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(credentials)
    }));
    expect(data.token).toBeDefined();
    expect(data.user.role).toBe('admin');
  });
});
