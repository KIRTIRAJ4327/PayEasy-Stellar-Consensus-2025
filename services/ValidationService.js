/**
 * ValidationService.js
 * Service for validating addresses, transaction data, and other inputs
 */

console.log("ValidationService script starting to load...");

class ValidationService {
  // Known scam addresses (for demonstration)
  static knownScamAddresses = [
    'GSCAMADDRESS1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
    'GFRAUDADDRESS1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ12345'
  ];
  
  // Common address patterns to watch for
  static suspiciousPatterns = [
    /^GADMIN/i,    // Admin impersonation
    /^GOFFICIAL/i, // Official impersonation
    /SUPPORT$/i,   // Support impersonation
    /TEAM$/i       // Team impersonation
  ];

  /**
   * Validate a Stellar address (public key)
   */
  static validateStellarAddress(address) {
    // Basic check for empty string
    if (!address || address.trim() === '') {
      return {
        isValid: false,
        message: 'Address cannot be empty'
      };
    }
    
    // Check proper format (Stellar public keys start with G and are 56 characters)
    if (!address.startsWith('G')) {
      return {
        isValid: false,
        message: 'Stellar addresses must start with G'
      };
    }
    
    if (address.length !== 56) {
      return {
        isValid: false,
        message: 'Stellar addresses must be 56 characters long'
      };
    }
    
    // Basic character set validation (Stellar uses base-32 encoding)
    // Only allow: ABCDEFGHIJKLMNOPQRSTUVWXYZ234567
    const base32Regex = /^[A-Z2-7]+$/;
    if (!base32Regex.test(address)) {
      return {
        isValid: false,
        message: 'Stellar addresses can only contain uppercase letters A-Z and numbers 2-7'
      };
    }
    
    // For a real implementation, we would use Stellar SDK's more thorough validation
    // and potentially check if the account exists on the network
    
    return {
      isValid: true,
      message: 'Valid Stellar address'
    };
  }
  
  /**
   * Validate a Polkadot address
   */
  static validatePolkadotAddress(address) {
    // Basic check for empty string
    if (!address || address.trim() === '') {
      return {
        isValid: false,
        message: 'Address cannot be empty'
      };
    }
    
    // Check proper format (Polkadot addresses start with 1, 5, or a few other characters)
    if (!address.match(/^[15]/)) {
      return {
        isValid: false,
        message: 'Polkadot addresses typically start with 1 or 5'
      };
    }
    
    // Check length (Polkadot addresses are 48 characters when SS58-encoded)
    // Substrate addresses are usually around 47-48 characters
    if (address.length < 45 || address.length > 49) {
      return {
        isValid: false,
        message: 'Polkadot addresses should be approximately 48 characters long'
      };
    }
    
    // In a real implementation, we would use the Polkadot JS API for validation
    
    return {
      isValid: true,
      message: 'Valid Polkadot address'
    };
  }
  
  /**
   * Validate a transaction amount
   */
  static validateAmount(amount, currency) {
    // Check for valid number
    if (!amount || isNaN(amount)) {
      return {
        isValid: false,
        message: 'Please enter a valid number'
      };
    }
    
    const numericAmount = parseFloat(amount);
    
    // Check for positive amount
    if (numericAmount <= 0) {
      return {
        isValid: false,
        message: 'Amount must be greater than 0'
      };
    }
    
    // Different precision for different currencies
    if (currency === 'XLM') {
      // Stellar supports up to 7 decimal places
      const decimalPlaces = ValidationService.countDecimals(numericAmount);
      if (decimalPlaces > 7) {
        return {
          isValid: false,
          message: 'Stellar only supports up to 7 decimal places'
        };
      }
    } else if (currency === 'DOT') {
      // Polkadot supports up to 10 decimal places
      const decimalPlaces = ValidationService.countDecimals(numericAmount);
      if (decimalPlaces > 10) {
        return {
          isValid: false,
          message: 'Polkadot only supports up to 10 decimal places'
        };
      }
    }
    
    // In a real implementation, we might check against account balance, etc.
    
    return {
      isValid: true,
      message: 'Valid amount'
    };
  }
  
  /**
   * Validate transaction memo
   */
  static validateMemo(memo) {
    // Memos are optional, so empty is fine
    if (!memo || memo.trim() === '') {
      return {
        isValid: true,
        message: 'No memo provided'
      };
    }
    
    // Check length - Stellar memo texts have a maximum length of 28 bytes
    if (memo.length > 28) {
      return {
        isValid: false,
        message: 'Memo cannot exceed 28 characters'
      };
    }
    
    // Check for invalid characters
    const invalidChars = /[^\x20-\x7E]/; // Only allow printable ASCII
    if (invalidChars.test(memo)) {
      return {
        isValid: false,
        message: 'Memo contains invalid characters'
      };
    }
    
    return {
      isValid: true,
      message: 'Valid memo'
    };
  }
  
  /**
   * Helper method to count decimal places in a number
   */
  static countDecimals(value) {
    if (Math.floor(value) === value) return 0;
    return value.toString().split('.')[1].length || 0;
  }
  
  /**
   * Validate a complete transaction
   */
  static validateTransaction(transaction) {
    const { fromAddress, toAddress, amount, currency, memo } = transaction;
    
    // Validate sender address based on currency
    let senderValidation;
    if (currency === 'XLM') {
      senderValidation = this.validateStellarAddress(fromAddress);
    } else if (currency === 'DOT') {
      senderValidation = this.validatePolkadotAddress(fromAddress);
    } else {
      senderValidation = {
        isValid: false,
        message: 'Unsupported currency'
      };
    }
    
    if (!senderValidation.isValid) {
      return {
        isValid: false,
        field: 'fromAddress',
        message: senderValidation.message
      };
    }
    
    // Validate recipient address based on currency
    let recipientValidation;
    if (currency === 'XLM') {
      recipientValidation = this.validateStellarAddress(toAddress);
    } else if (currency === 'DOT') {
      recipientValidation = this.validatePolkadotAddress(toAddress);
    } else {
      recipientValidation = {
        isValid: false,
        message: 'Unsupported currency'
      };
    }
    
    if (!recipientValidation.isValid) {
      return {
        isValid: false,
        field: 'toAddress',
        message: recipientValidation.message
      };
    }
    
    // Validate amount
    const amountValidation = this.validateAmount(amount, currency);
    if (!amountValidation.isValid) {
      return {
        isValid: false,
        field: 'amount',
        message: amountValidation.message
      };
    }
    
    // Validate memo if provided
    const memoValidation = this.validateMemo(memo);
    if (!memoValidation.isValid) {
      return {
        isValid: false,
        field: 'memo',
        message: memoValidation.message
      };
    }
    
    return {
      isValid: true,
      message: 'Transaction is valid'
    };
  }
}

console.log("ValidationService class defined");

// Make it directly available as a global variable
window.ValidationService = ValidationService;
console.log("ValidationService loaded and available at window.ValidationService");

// Also make it available through the Services namespace for consistency
window.Services = window.Services || {};
window.Services.ValidationService = ValidationService;
console.log("ValidationService also available at window.Services.ValidationService");

// Export for require/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ValidationService;
  console.log("ValidationService exported as a CommonJS module");
}

console.log("ValidationService script has finished loading"); 