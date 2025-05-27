// frontend/src/api/parts.js
import { apiClient } from './index';

const partsApi = {
  getAllParts: async () => {
    return await apiClient.get('/parts');
  },
  // Add more methods as needed
};

// <<< EXPORT partsApi AS A NAMED EXPORT >>>
export { partsApi };
