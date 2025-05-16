/**
 * ExchangeService.js
 * Service for handling currency exchange rates and conversions
 */

console.log("ExchangeService script starting to load...");

class ExchangeService {
  // Static properties
  static lastUpdated = null;
  static currentRates = {
    XLM: { USD: 0.15, CAD: 0.20, INR: 12.5 },
    DOT: { USD: 6.50, CAD: 8.75, INR: 725 }
  };

  /**
   * Fetch current exchange rates
   */
  static async getCurrentRates() {
    try {
      console.log('Fetching current exchange rates...');
      
      // In a real implementation, this would call an exchange rate API
      // For demo purposes, we'll simulate a network call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate small price fluctuations
      const rates = {
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
      
      // Update class state
      this.lastUpdated = new Date();
      this.currentRates = rates;
      
      return rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Return last known rates if fetching fails
      return this.currentRates;
    }
  }
  
  /**
   * Convert an amount from one currency to another
   */
  static convert(amount, fromCurrency, toCurrency) {
    if (!amount || isNaN(amount)) {
      return { success: false, error: 'Invalid amount' };
    }
    
    try {
      const parsedAmount = parseFloat(amount);
      
      // For crypto to fiat conversion
      if (['XLM', 'DOT'].includes(fromCurrency) && ['USD', 'CAD', 'INR'].includes(toCurrency)) {
        const rate = this.currentRates[fromCurrency][toCurrency];
        const converted = parsedAmount * rate;
        
        return {
          success: true,
          amount: converted.toFixed(2),
          fromCurrency,
          toCurrency,
          rate
        };
      }
      
      // For fiat to crypto conversion
      if (['USD', 'CAD', 'INR'].includes(fromCurrency) && ['XLM', 'DOT'].includes(toCurrency)) {
        // Need to invert the rate
        const rate = 1 / this.currentRates[toCurrency][fromCurrency];
        const converted = parsedAmount * rate;
        
        return {
          success: true,
          amount: converted.toFixed(6),
          fromCurrency,
          toCurrency,
          rate
        };
      }
      
      // For crypto to crypto conversion (via USD as intermediary)
      if (['XLM', 'DOT'].includes(fromCurrency) && ['XLM', 'DOT'].includes(toCurrency)) {
        const usdValue = parsedAmount * this.currentRates[fromCurrency].USD;
        const rate = this.currentRates[fromCurrency].USD / this.currentRates[toCurrency].USD;
        const converted = usdValue / this.currentRates[toCurrency].USD;
        
        return {
          success: true,
          amount: converted.toFixed(6),
          fromCurrency,
          toCurrency,
          rate
        };
      }
      
      // For fiat to fiat conversion
      if (['USD', 'CAD', 'INR'].includes(fromCurrency) && ['USD', 'CAD', 'INR'].includes(toCurrency)) {
        // We'll use XLM rates to derive the conversion
        const usdToFromRate = this.currentRates.XLM[fromCurrency] / this.currentRates.XLM.USD;
        const usdToToRate = this.currentRates.XLM[toCurrency] / this.currentRates.XLM.USD;
        const rate = usdToToRate / usdToFromRate;
        const converted = parsedAmount * rate;
        
        return {
          success: true,
          amount: converted.toFixed(2),
          fromCurrency,
          toCurrency,
          rate
        };
      }
      
      return { success: false, error: 'Unsupported currency conversion' };
    } catch (error) {
      console.error('Conversion error:', error);
      return { success: false, error: 'Conversion failed' };
    }
  }
  
  /**
   * Calculate all fiat values for a cryptocurrency amount
   */
  static calculateFiatValues(amount, cryptoCurrency) {
    if (!amount || isNaN(amount)) {
      return {
        USD: '0.00',
        CAD: '0.00',
        INR: '0.00'
      };
    }
    
    try {
      const parsedAmount = parseFloat(amount);
      const rates = this.currentRates[cryptoCurrency];
      
      return {
        USD: (parsedAmount * rates.USD).toFixed(2),
        CAD: (parsedAmount * rates.CAD).toFixed(2),
        INR: (parsedAmount * rates.INR).toFixed(2)
      };
    } catch (error) {
      console.error('Error calculating fiat values:', error);
      return {
        USD: '0.00',
        CAD: '0.00',
        INR: '0.00'
      };
    }
  }
  
  /**
   * Get historical rate data for a chart
   */
  static getHistoricalRates(cryptoCurrency, fiatCurrency, timeFrame) {
    // This would fetch real historical data in a production environment
    // For the demo, we'll generate random data
    
    const now = new Date();
    const data = [];
    let numPoints;
    let interval;
    
    switch (timeFrame) {
      case '1d':
        numPoints = 24;
        interval = 60 * 60 * 1000; // 1 hour
        break;
      case '1w':
        numPoints = 7;
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '1m':
        numPoints = 30;
        interval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '3m':
        numPoints = 12;
        interval = 7 * 24 * 60 * 60 * 1000; // 1 week
        break;
      default:
        numPoints = 24;
        interval = 60 * 60 * 1000; // 1 hour
    }
    
    // Get the base rate for the selected currency
    const baseRate = this.currentRates[cryptoCurrency][fiatCurrency];
    
    // Generate data points
    for (let i = numPoints - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * interval));
      
      // Create random price fluctuations around the base rate
      // More recent points are closer to the current rate
      const volatility = 0.1 * (i / numPoints); // Higher volatility for older points
      const randomFactor = 1 + ((Math.random() * 2 - 1) * volatility);
      const rate = baseRate * randomFactor;
      
      data.push({
        timestamp,
        rate: rate.toFixed(fiatCurrency === 'INR' ? 1 : 2)
      });
    }
    
    return {
      success: true,
      currency: cryptoCurrency,
      fiat: fiatCurrency,
      timeFrame,
      data
    };
  }
}

console.log("ExchangeService class defined");

// Make it directly available as a global variable
window.ExchangeService = ExchangeService;
console.log("ExchangeService loaded and available at window.ExchangeService");

// Also make it available through the Services namespace for consistency
window.Services = window.Services || {};
window.Services.ExchangeService = ExchangeService;
console.log("ExchangeService also available at window.Services.ExchangeService");

// Export for require/CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExchangeService;
  console.log("ExchangeService exported as a CommonJS module");
}

console.log("ExchangeService script has finished loading"); 