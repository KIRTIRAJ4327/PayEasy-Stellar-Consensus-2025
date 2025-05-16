/**
 * MidnightService.js
 * Service for interacting with the Midnight blockchain network
 */

console.log("MidnightService script starting to load...");

const MIDNIGHT_RPC_URL = 'https://rpc.testnet-02.midnight.network/';
const BACKUP_RPC_URL = 'https://archive.testnet-02.midnight.moonbase.moonbeam.network/'; // Backup URL
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

class MidnightService {
  // Static properties
  static requestId = 1;
  static defaultAccount = null;
  static connected = false;
  static chainInfo = 'Testnet-02';
  static activeUrl = MIDNIGHT_RPC_URL;

  /**
   * Make a JSON-RPC call to the Midnight network
   */
  static async callRpc(method, params = []) {
    const request = {
      jsonrpc: '2.0',
      method,
      params,
      id: this.requestId++
    };

    let lastError = null;
    let retries = 0;

    while (retries <= MAX_RETRIES) {
      try {
        // If we're retrying and on the primary URL, try the backup
        if (retries > 0 && this.activeUrl === MIDNIGHT_RPC_URL) {
          this.activeUrl = BACKUP_RPC_URL;
          console.log(`Switching to backup Midnight RPC URL: ${this.activeUrl}`);
        }
        
        console.log(`Calling Midnight RPC (attempt ${retries + 1}): ${method}`);
        
        // Add a timeout to the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(this.activeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(request),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        // If we got a non-200 response, throw an error
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          // Special handling for method not found errors
          if (data.error.message && data.error.message.includes("Method not found")) {
            console.warn(`Midnight RPC method not found: ${method}`);
            return null; // Return null instead of throwing for method not found
          }
          throw new Error(`Midnight RPC error: ${data.error.message || JSON.stringify(data.error)}`);
        }

        // If we successfully used the backup URL, keep using it
        this.connected = true;
        return data.result;
      } catch (error) {
        lastError = error;
        retries++;
        
        // Don't retry for method not found errors
        if (error.message && error.message.includes("Method not found")) {
          break;
        }
        
        if (retries <= MAX_RETRIES) {
          console.warn(`Midnight RPC call failed, retrying (${retries}/${MAX_RETRIES}):`, error.message);
          // Add exponential backoff
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
        } else {
          console.error('All Midnight RPC attempts failed:', error);
          // Reset to primary URL for next calls
          this.activeUrl = MIDNIGHT_RPC_URL;
        }
      }
    }
    
    // If we reach here, all retries failed
    this.connected = false;
    throw lastError || new Error(`Midnight RPC call failed after ${MAX_RETRIES} retries`);
  }

  /**
   * Test the connection to the Midnight network
   */
  static async testConnection() {
    // Try different methods that might be available
    const possibleMethods = [
      'system_chain',
      'system_name',
      'rpc_methods'
    ];

    for (const method of possibleMethods) {
      try {
        const result = await this.callRpc(method);
        if (result) {
          this.connected = true;
          return { connected: true, method, result };
        }
      } catch (error) {
        // Continue to next method
      }
    }

    this.connected = false;
    return { connected: false, error: 'No available methods' };
  }

  /**
   * Get basic information about the Midnight chain
   */
  static async getChainInfo() {
    let error = null;
    
    try {
      // Try system_chain first
      const result = await this.callRpc('system_chain');
      if (result) {
        this.chainInfo = result;
        return result;
      }
    } catch (err) {
      error = err;
      console.warn('Failed to get system_chain:', err.message);
    }
    
    try {
      // Try system_name as a fallback
      const result = await this.callRpc('system_name');
      if (result) {
        this.chainInfo = result;
        return result;
      }
    } catch (err) {
      console.warn('Failed to get system_name:', err.message);
    }
    
    // If we couldn't connect, just return the hardcoded value without throwing
    console.log('Using fallback chain info:', this.chainInfo);
    return this.chainInfo;
  }

  /**
   * Get the network state
   */
  static async getNetworkState() {
    try {
      return await this.callRpc('system_networkState');
    } catch (error) {
      console.warn('system_networkState not available');
      // Return a simulated response
      return {
        connected: this.connected,
        network: 'testnet-02'
      };
    }
  }

  /**
   * Get the health status of the node
   */
  static async getHealth() {
    try {
      return await this.callRpc('system_health');
    } catch (error) {
      console.warn('system_health not available');
      // Return a simulated response
      return {
        isSyncing: false,
        peers: 5,
        shouldHavePeers: true
      };
    }
  }

  /**
   * Get account information
   */
  static async getAccount(address) {
    if (!address && !this.defaultAccount) {
      throw new Error('No account address provided');
    }
    
    const accountAddress = address || this.defaultAccount;
    
    try {
      // This would use the correct method for Midnight's API
      return await this.callRpc('midnight_getAccount', [accountAddress]);
    } catch (error) {
      console.warn('midnight_getAccount not available');
      // Return a simulated response
      return {
        address: accountAddress,
        balance: '100.0000',
        nonce: 0,
        status: 'active'
      };
    }
  }
  
  /**
   * Set a default account for operations
   */
  static setDefaultAccount(address) {
    this.defaultAccount = address;
  }
  
  /**
   * Generate a new viewing key pair
   * This would be needed for private transactions
   */
  static async generateViewingKey() {
    try {
      // In a real implementation, this would call the appropriate Midnight API
      const result = await this.callRpc('compact_generateViewingKey', []);
      
      // If the API call worked, return the result
      if (result && result.publicKey && result.privateKey) {
        return result;
      }
    } catch (error) {
      console.warn('compact_generateViewingKey not available');
    }
    
    // Fallback for demo purposes
    return {
      publicKey: 'vpk_' + Math.random().toString(36).substring(2, 15),
      privateKey: 'vsk_' + Math.random().toString(36).substring(2, 15)
    };
  }

  /**
   * Create a private transaction using Midnight's privacy features
   */
  static async createPrivateTransaction(
    recipientAddress, 
    amount, 
    memo,
    privacyOptions
  ) {
    try {
      // Use the default account or a demo account
      const fromAddress = this.defaultAccount || 'midnight_demo_address_' + Math.random().toString(36).substring(2, 10);
      
      // In a real implementation, this would call the Midnight API
      // with the appropriate transaction parameters
      const result = await this.callRpc('midnight_transfer', [
        fromAddress,
        recipientAddress,
        amount.toString(),
        {
          memo: this.encryptMemo(memo),
          ...privacyOptions
        }
      ]);
      
      if (result && result.txHash) {
        return {
          success: true,
          txHash: result.txHash,
          fromAddress,
          toAddress: recipientAddress,
          amount
        };
      }
    } catch (error) {
      console.warn('midnight_transfer not available');
    }
    
    // Simulate a transaction for demo purposes
    return {
      success: true,
      txHash: 'midnight_' + Math.random().toString(36).substring(2, 15),
      fromAddress: fromAddress,
      toAddress: recipientAddress,
      amount
    };
  }
  
  /**
   * Get transaction details
   */
  static async getTransaction(txHash) {
    try {
      return await this.callRpc('midnight_getTransaction', [txHash]);
    } catch (error) {
      console.warn('midnight_getTransaction not available');
      // Return a simulated response
      return {
        hash: txHash,
        status: 'confirmed',
        confirmations: 10,
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Encrypt a memo field for privacy
   */
  static encryptMemo(memo) {
    // In a real implementation, this would use proper encryption
    // For demo purposes, we'll just add a prefix
    return memo ? '[ENC]' + memo : '';
  }
  
  /**
   * Get the privacy capabilities of the Midnight network
   */
  static async getPrivacyCapabilities() {
    try {
      const result = await this.callRpc('midnight_privacyCapabilities', []);
      if (result) {
        return result;
      }
    } catch (error) {
      console.warn('midnight_privacyCapabilities not available:', error.message);
    }
    
    // Return simulated capabilities - don't throw
    console.log('Using simulated privacy capabilities');
    return {
      zeroKnowledge: true,
      confidentialTransactions: true,
      hiddenAddresses: true,
      metadataProtection: true,
      multipartyEncryption: false
    };
  }
  
  /**
   * Get current exchange rates
   */
  static async getExchangeRates() {
    try {
      const rates = await this.callRpc('midnight_exchangeRates', []);
      if (rates && rates.XLM && rates.DOT) {
        return rates;
      }
    } catch (error) {
      console.warn('midnight_exchangeRates not available:', error.message);
    }
    
    try {
      // Try alternative endpoint
      const rates = await this.callRpc('exchange_getRates', []);
      if (rates && rates.XLM && rates.DOT) {
        return rates;
      }
    } catch (error) {
      console.warn('exchange_getRates not available:', error.message);
    }
    
    // Return simulated exchange rates - don't throw
    console.log('Using simulated exchange rates');
    return {
      XLM: {
        USD: 0.15 + (Math.random() * 0.02 - 0.01), // $0.14-0.16
        CAD: 0.20 + (Math.random() * 0.02 - 0.01), // $0.19-0.21
        INR: 12.5 + (Math.random() * 0.5 - 0.25)   // ₹12.25-12.75
      },
      DOT: {
        USD: 6.50 + (Math.random() * 0.5 - 0.25),  // $6.25-6.75
        CAD: 8.75 + (Math.random() * 0.5 - 0.25),  // $8.50-9.00
        INR: 725 + (Math.random() * 25 - 12.5)     // ₹712.50-737.50
      }
    };
  }
  
  /**
   * Calculate fiat equivalent for a cryptocurrency amount
   */
  static calculateFiatEquivalent(amount, currency, rates) {
    if (!amount || isNaN(amount)) return { USD: '0.00', CAD: '0.00', INR: '0.00' };
    
    const parsedAmount = parseFloat(amount);
    
    return {
      USD: (parsedAmount * rates[currency].USD).toFixed(2),
      CAD: (parsedAmount * rates[currency].CAD).toFixed(2),
      INR: (parsedAmount * rates[currency].INR).toFixed(2)
    };
  }
  
  /**
   * Get network fee as a formatted string
   */
  static getNetworkFee(currency, rates) {
    if (currency === 'XLM') {
      const feeXLM = 0.00001;
      const feeUSD = (feeXLM * rates.XLM.USD).toFixed(3);
      return `<0.001 XLM ($${feeUSD})`;
    } else {
      const feeDOT = 0.01;
      const feeUSD = (feeDOT * rates.DOT.USD).toFixed(2);
      return `<0.01 DOT ($${feeUSD})`;
    }
  }
}

console.log("MidnightService class defined");

// Make it directly available as a global variable
window.MidnightService = MidnightService;
console.log("MidnightService loaded and available at window.MidnightService");

// Also make it available through the Services namespace for consistency
window.Services = window.Services || {};
window.Services.MidnightService = MidnightService;
console.log("MidnightService also available at window.Services.MidnightService");

// Export for require/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MidnightService;
  console.log("MidnightService exported as a CommonJS module");
}

console.log("MidnightService script has finished loading"); 