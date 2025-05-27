// frontend/src/api/orders.js
import { apiClient } from './index';

const ordersApi = {
  getUserOrders: async () => {
    return await apiClient.get('/orders');
  },
  // Add more methods as needed
};

// <<< EXPORT ordersApi AS A NAMED EXPORT >>>
export { ordersApi };
// <<< REMOVE OR COMMENT OUT THE DEFAULT EXPORT >>>
// export default ordersApi; // Remove this line