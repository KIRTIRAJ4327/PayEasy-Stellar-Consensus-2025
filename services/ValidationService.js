/**
 * ValidationService.js
 * Service for validating blockchain addresses and transactions to prevent scams
 */

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
   * Validate a Stellar address with scam protection
   * @param {string} address - The Stellar address to validate
   * @returns {Object} Validation result with status and warnings
   */
  static validateStellarAddress(address) {
    const result = {
      isValid: false,
      isSuspicious: false,
      warnings: [],
      message: ''
    };
    
    // Basic format validation
    if (!address) {
      result.message = 'Address is required';
      return result;
    }
    
    // Check basic format (Stellar public keys start with G and are 56 characters)
    if (!address.startsWith('G') || address.length !== 56) {
      result.message = 'Invalid Stellar address format. Must start with G and be 56 characters long.';
      return result;
    }
    
    // Address passes basic validation
    result.isValid = true;
    
    // Enhanced scam protection checks
    
    // Check against known scam addresses
    if (this.knownScamAddresses.includes(address)) {
      result.isSuspicious = true;
      result.warnings.push('This address is associated with known scams');
    }
    
    // Check for suspicious patterns
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(address)) {
        result.isSuspicious = true;
        result.warnings.push('This address matches a suspicious pattern');
        break;
      }
    }
    
    // All checks passed
    if (result.isValid && !result.isSuspicious) {
      result.message = 'Address is valid';
    }
    
    return result;
  }
  
  /**
   * Validate transaction parameters for safety
   * @param {Object} params - Transaction parameters
   * @returns {Object} Validation result
   */
  static validateTransaction(params) {
    const { recipientAddress, amount, memo, currency = 'XLM' } = params;
    const result = {
      isValid: false,
      warnings: [],
      message: ''
    };
    
    // Validate recipient address
    const addressResult = this.validateStellarAddress(recipientAddress);
    if (!addressResult.isValid) {
      result.warnings.push(addressResult.message);
    } else if (addressResult.isSuspicious) {
      result.warnings.push(...addressResult.warnings);
    }
    
    // Validate amount
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      result.warnings.push('Please enter a valid amount greater than 0');
    } else {
      // Check for unusually large amounts that might be mistakes
      const amountValue = parseFloat(amount);
      if (currency === 'XLM' && amountValue > 1000) {
        result.warnings.push('Warning: You are sending a large amount (>1000 XLM). Double-check this is intended.');
      } else if (currency === 'DOT' && amountValue > 100) {
        result.warnings.push('Warning: You are sending a large amount (>100 DOT). Double-check this is intended.');
      }
    }
    
    // Check for suspicious memo content
    if (memo) {
      const lowerMemo = memo.toLowerCase();
      
      // Check for potentially phishing or scam-related keywords in memo
      const suspiciousKeywords = ['admin', 'verify', 'password', 'secret', 'key', 'login', 'wallet'];
      for (const keyword of suspiciousKeywords) {
        if (lowerMemo.includes(keyword)) {
          result.warnings.push('Warning: Memo contains potentially suspicious content');
          break;
        }
      }
    }
    
    // Transaction is valid if there are no warnings about address or amount
    result.isValid = !result.warnings.some(warning => 
      warning.includes('Invalid') || 
      warning.includes('required') || 
      warning.includes('greater than 0')
    );
    
    return result;
  }
  
  /**
   * Check if a transaction seems risky based on heuristics
   * @param {Object} params - Transaction parameters
   * @returns {Object} Risk assessment
   */
  static assessTransactionRisk(params) {
    const { recipientAddress, amount, memo, currency = 'XLM' } = params;
    
    const risk = {
      level: 'low',
      factors: []
    };
    
    // Check recipient address validation
    const addressResult = this.validateStellarAddress(recipientAddress);
    if (addressResult.isSuspicious) {
      risk.level = 'high';
      risk.factors.push(...addressResult.warnings);
    }
    
    // Check amount
    const amountValue = parseFloat(amount);
    if (!isNaN(amountValue)) {
      if (currency === 'XLM') {
        if (amountValue > 5000) {
          risk.level = Math.max(risk.level === 'low' ? 'medium' : risk.level);
          risk.factors.push('Large transaction amount');
        }
      } else if (currency === 'DOT') {
        if (amountValue > 500) {
          risk.level = Math.max(risk.level === 'low' ? 'medium' : risk.level);
          risk.factors.push('Large transaction amount');
        }
      }
    }
    
    // Check memo for suspicious content (simplified)
    if (memo && memo.length > 0) {
      const lowerMemo = memo.toLowerCase();
      if (/password|secret|key|login|verify|admin|urgent|important/i.test(lowerMemo)) {
        risk.level = 'high';
        risk.factors.push('Memo contains suspicious keywords');
      }
    }
    
    return risk;
  }
}

// Make the service available globally
window.ValidationService = ValidationService; 