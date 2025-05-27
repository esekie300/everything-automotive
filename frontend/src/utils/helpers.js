/**
 * Collection of helper utility functions
 */
const helpers = {
  formatDate: (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },
  
  formatCurrency: (value, currency = 'USD') => {
    if (value === undefined || value === null) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(value);
  },
  
  truncateText: (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  },
};

export default helpers;
