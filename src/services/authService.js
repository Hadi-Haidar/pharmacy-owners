import api from './api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authService = {
  // Login
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/pharmacy-owner/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store owner and pharmacy data
      localStorage.setItem('pharmacyOwner', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('pharmacyOwner');
  },

  // Get current owner
  getCurrentOwner() {
    const ownerData = localStorage.getItem('pharmacyOwner');
    return ownerData ? JSON.parse(ownerData) : null;
  },
};

