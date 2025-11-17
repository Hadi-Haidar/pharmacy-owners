const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const medicineService = {
  // Get all available medicines (from admin)
  async getAllAvailableMedicines() {
    try {
      const url = `${API_URL}/pharmacy-owner/medicines/all`;
      console.log('Fetching medicines from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || `Failed to fetch medicines (${response.status})`);
      }

      const data = await response.json();
      console.log('Medicines API response:', data);
      return data;
    } catch (error) {
      console.error('Error fetching medicines:', error);
      throw error;
    }
  },

  // Get medicines available to add (not yet added to pharmacy)
  async getAvailableMedicinesToAdd(pharmacyId, ownerId) {
    try {
      const response = await fetch(
        `${API_URL}/pharmacy-owner/pharmacy/${pharmacyId}/medicines/available`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch available medicines');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching available medicines:', error);
      throw error;
    }
  },

  // Get pharmacy's medicines (inventory)
  async getPharmacyMedicines(pharmacyId, ownerId) {
    try {
      console.log('Fetching pharmacy medicines for:', { pharmacyId, ownerId });
      const url = `${API_URL}/pharmacy-owner/pharmacy/${pharmacyId}/medicines?ownerId=${ownerId}`;
      console.log('URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.message || `Failed to fetch pharmacy medicines (${response.status})`);
      }

      const data = await response.json();
      console.log('Pharmacy medicines fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching pharmacy medicines:', error);
      throw error;
    }
  },

  // Add medicine to pharmacy
  async addMedicineToPharmacy(pharmacyId, ownerId, medicineData) {
    try {
      const response = await fetch(
        `${API_URL}/pharmacy-owner/pharmacy/${pharmacyId}/medicines`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ownerId,
            medicineId: medicineData.medicineId,
            status: medicineData.status || 'available',
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add medicine');
      }

      return data;
    } catch (error) {
      console.error('Error adding medicine:', error);
      throw error;
    }
  },

  // Update medicine status
  async updateMedicineStatus(medicineId, pharmacyId, ownerId, status) {
    try {
      const response = await fetch(
        `${API_URL}/pharmacy-owner/pharmacy/${pharmacyId}/medicines/${medicineId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ownerId,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update medicine status');
      }

      return data;
    } catch (error) {
      console.error('Error updating medicine status:', error);
      throw error;
    }
  },

  // Remove medicine from pharmacy
  async removeMedicineFromPharmacy(medicineId, pharmacyId, ownerId) {
    try {
      const response = await fetch(
        `${API_URL}/pharmacy-owner/pharmacy/${pharmacyId}/medicines/${medicineId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ownerId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove medicine');
      }

      return data;
    } catch (error) {
      console.error('Error removing medicine:', error);
      throw error;
    }
  },
};

