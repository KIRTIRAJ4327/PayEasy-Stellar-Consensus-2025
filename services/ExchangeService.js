/**
 * ExchangeService.js
 * Service for fetching and managing cryptocurrency exchange rates
 */

class ExchangeService {
  // Default/fallback rates in case API is unavailable
  static defaultRates = {
    XLM: {
      USD: 0.15,
      CAD: 0.20,
      INR: 12.5
    },
    DOT: {
      USD: 6.50,
      CAD: 8.75,
      INR: 725
    }
  };

  // Current rates cache
  static currentRates = {...this.defaultRates};
  static lastUpdated = null;

  /**
   * Fetch real-time exchange rates from CoinGecko API
   * This is a free, no-API-key required endpoint for demo purposes
   */
  static async fetchExchangeRates() {
    try {
      console.log("Fetching current exchange rates...");
      
      // CoinGecko API for getting real rates without API key
      const url = 'https://api.coingecko.com/api/v3/simple/price?ids=stellar,polkadot&vs_currencies=usd,cad,inr';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch rates: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Update rates if available in response
      if (data.stellar && data.polkadot) {
        this.currentRates = {
          XLM: {
            USD: data.stellar.usd || this.defaultRates.XLM.USD,
            CAD: data.stellar.cad || this.defaultRates.XLM.CAD,
            INR: data.stellar.inr || this.defaultRates.XLM.INR
          },
          DOT: {
            USD: data.polkadot.usd || this.defaultRates.DOT.USD,
            CAD: data.polkadot.cad || this.defaultRates.DOT.CAD,
            INR: data.polkadot.inr || this.defaultRates.DOT.INR
          }
        };
        
        this.lastUpdated = new Date();
        console.log("Exchange rates updated:", this.currentRates);
        
        return this.currentRates;
      } else {
        console.warn("Invalid response format from CoinGecko API");
        return this.defaultRates;
      }
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      // Return default rates as fallback
      return this.defaultRates;
    }
  }
  
  /**
   * Get current exchange rates (fetches if needed)
   */
  static async getCurrentRates() {
    const MAX_AGE_MINUTES = 15;
    
    // Fetch new rates if we don't have any or they're too old
    if (!this.lastUpdated || 
        (new Date() - this.lastUpdated) > (MAX_AGE_MINUTES * 60 * 1000)) {
      try {
        await this.fetchExchangeRates();
      } catch (error) {
        console.warn("Using cached or default rates due to fetch error");
      }
    }
    
    return this.currentRates;
  }
  
  /**
   * Calculate fiat equivalents for a cryptocurrency amount
   */
  static calculateFiatEquivalent(amount, currency) {
    if (!amount || isNaN(amount) || !this.currentRates[currency]) {
      return { USD: '0.00', CAD: '0.00', INR: '0.00' };
    }
    
    const parsedAmount = parseFloat(amount);
    const rates = this.currentRates[currency];
    
    return {
      USD: (parsedAmount * rates.USD).toFixed(2),
      CAD: (parsedAmount * rates.CAD).toFixed(2),
      INR: (parsedAmount * rates.INR).toFixed(2)
    };
  }
  
  /**
   * Get formatted fee amount
   */
  static getNetworkFee(currency) {
    if (currency === 'XLM') {
      const feeXLM = 0.00001;
      const feeUSD = (feeXLM * this.currentRates.XLM.USD).toFixed(6);
      return `<0.001 XLM ($${feeUSD})`;
    } else {
      const feeDOT = 0.01;
      const feeUSD = (feeDOT * this.currentRates.DOT.USD).toFixed(4);
      return `<0.01 DOT ($${feeUSD})`;
    }
  }
  
  /**
   * Compare rates with traditional services like Remitly
   * For demonstration purposes, we simulate slightly better rates than Remitly
   */
  static getTraditionalComparison(currency, amount) {
    if (currency !== 'XLM' || !amount || isNaN(amount)) {
      return null;
    }
    
    const fiat = this.calculateFiatEquivalent(amount, currency);
    
    // Simulate 1.5% worse rate for traditional service
    const traditionalRates = {
      USD: (parseFloat(fiat.USD) * 0.985).toFixed(2),
      CAD: (parseFloat(fiat.CAD) * 0.985).toFixed(2),
      INR: (parseFloat(fiat.INR) * 0.985).toFixed(2)
    };
    
    // Calculate the difference
    const savings = {
      USD: (parseFloat(fiat.USD) - parseFloat(traditionalRates.USD)).toFixed(2),
      CAD: (parseFloat(fiat.CAD) - parseFloat(traditionalRates.CAD)).toFixed(2),
      INR: (parseFloat(fiat.INR) - parseFloat(traditionalRates.INR)).toFixed(2)
    };
    
    return {
      payeasy: fiat,
      traditional: traditionalRates,
      savings
    };
  }
}

// Make the service available globally
window.ExchangeService = ExchangeService; 