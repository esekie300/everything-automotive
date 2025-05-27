/**
 * User model that matches the backend UserProfile model
 */
class User {
  constructor(data = {}) {
    this.id = data.id || '';
    this.email = data.email || '';
    this.fullName = data.full_name || '';
    this.phone = data.phone || '';
    this.address = data.address || '';
    this.accountType = data.account_type || 'personal';
    this.companyName = data.company_name || '';
    this.createdAt = data.created_at || '';
  }
  
  // Return a plain object representation
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      full_name: this.fullName,
      phone: this.phone,
      address: this.address,
      account_type: this.accountType,
      company_name: this.companyName,
      created_at: this.createdAt
    };
  }
  
  // Create a User instance from API data
  static fromJSON(json) {
    return new User(json);
  }
}

export default User;
