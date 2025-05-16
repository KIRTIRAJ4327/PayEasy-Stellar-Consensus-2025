/**
 * AuthService.js
 * Service for user authentication, leveraging Midnight's decentralized identity capabilities
 */

class AuthService {
  // Static properties
  static isLoggedIn = false;
  static currentUser = null;

  /**
   * Simulate authentication with Midnight's decentralized identity
   * In a real implementation, this would use Midnight's API for zero-knowledge authentication
   */
  static async login(address, password = '') {
    console.log(`Authenticating user with address: ${address}`);
    
    try {
      // Simulate Midnight API authentication
      console.log("Simulating Midnight zero-knowledge authentication...");
      
      // For demo purposes, we'll accept any valid-looking Stellar address
      if (this.isValidStellarAddress(address)) {
        // In a real implementation, this would verify the user with Midnight API
        const userData = {
          address: address,
          displayName: address.substring(0, 7) + '...' + address.substring(address.length - 4),
          walletBalances: {
            XLM: 100 + (Math.random() * 50).toFixed(2),
            DOT: 5 + (Math.random() * 3).toFixed(2)
          },
          recentTransactions: this.generateMockTransactions(address)
        };
        
        this.currentUser = userData;
        this.isLoggedIn = true;
        
        // Store in session storage for persistence across page refreshes
        sessionStorage.setItem('payeasy_user', JSON.stringify(userData));
        sessionStorage.setItem('payeasy_logged_in', 'true');
        
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid Stellar address format');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Log out the current user
   */
  static logout() {
    this.isLoggedIn = false;
    this.currentUser = null;
    
    // Clear session storage
    sessionStorage.removeItem('payeasy_user');
    sessionStorage.removeItem('payeasy_logged_in');
    
    return { success: true };
  }
  
  /**
   * Check if user is currently logged in
   */
  static checkLoginStatus() {
    // Check session storage first
    const storedLoginStatus = sessionStorage.getItem('payeasy_logged_in');
    const storedUser = sessionStorage.getItem('payeasy_user');
    
    if (storedLoginStatus === 'true' && storedUser) {
      this.isLoggedIn = true;
      this.currentUser = JSON.parse(storedUser);
    }
    
    return {
      isLoggedIn: this.isLoggedIn,
      currentUser: this.currentUser
    };
  }
  
  /**
   * Basic validation for Stellar addresses
   */
  static isValidStellarAddress(address) {
    // Simple validation: Stellar public keys start with G and are 56 characters long
    return address && address.startsWith('G') && address.length === 56;
  }
  
  /**
   * Generate mock transaction history for demo purposes
   */
  static generateMockTransactions(userAddress) {
    const transactions = [];
    const types = ['sent', 'received'];
    const randomAddresses = [
      'GDXDFWOBZTCD4PCNJZJ72GISISUUTPQX45PU44WDJMDEP3FQWMN7CCGL',
      'GC5SIC4E3V56VOHJ3OZAX5SJDTWY52JYI2AFK6PUGSXFVRJQYQXXZBZF',
      'GAP5LETOV6YIE62YAM56STDANPRDO7ZFDBGSNHJQIYGGKSMOZAHOOS2S'
    ];
    
    // Generate 3-5 random transactions
    const count = 3 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const amount = (1 + Math.random() * 20).toFixed(2);
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 72)); // Random time in the last 3 days
      
      const otherAddress = randomAddresses[Math.floor(Math.random() * randomAddresses.length)];
      
      transactions.push({
        id: 'TX-' + Math.random().toString(16).substring(2, 15),
        type,
        amount,
        currency: 'XLM',
        timestamp: timestamp.toISOString(),
        address: type === 'sent' ? otherAddress : userAddress,
        counterparty: type === 'sent' ? otherAddress : userAddress,
        status: 'confirmed'
      });
    }
    
    // Sort by timestamp, newest first
    return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

// Make the service available globally
window.AuthService = AuthService; 