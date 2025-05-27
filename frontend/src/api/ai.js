// frontend/src/api/ai.js
import { apiClient } from './index';

const aiApi = {
  chat: async (data) => { // <<< ENSURE IT EXPECTS ONE ARGUMENT 'data'
    return await apiClient.post('/ai/chat', data); // <<< ENSURE 'data' IS PASSED AS BODY
  },

  getHistory: async (sessionId) => {
    return await apiClient.get(`/ai/history/${sessionId}`);
  },
};

export { aiApi };