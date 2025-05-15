/**
 * PayEasy Midnight Protocol
 * 
 * A privacy-enhancing layer built on top of Stellar's blockchain infrastructure.
 * This protocol demonstrates how advanced privacy features can be integrated
 * with Stellar's robust payment network to create a more secure and private
 * payment experience.
 * 
 * Features:
 * - Zero-knowledge proofs for transaction validation
 * - Decentralized identity management
 * - Advanced scam protection
 * - Intelligent rate limiting
 * - Enhanced session encryption
 * 
 * Note: This is a prototype implementation showcasing the concept.
 * Production implementation would integrate with established privacy technologies.
 */

import config from '../config.js';
// Use globally loaded StellarSdk instead of importing it

class SecurityManager {
    constructor() {
        this.config = config;
        this.midnightApiEndpoint = config.midnight.endpoint;
        // Check if StellarSdk is available globally
        if (typeof StellarSdk === 'undefined') {
            console.error('StellarSdk is not loaded! Please check your internet connection.');
        } else {
            this.stellarServer = new StellarSdk.Server(config.stellar.horizonUrl);
            this.network = config.stellar.network === 'TESTNET' 
                ? StellarSdk.Networks.TESTNET 
                : StellarSdk.Networks.PUBLIC;
        }
        this.encryptionKey = null;
        this.features = {
            zeroKnowledge: false,
            decentralizedId: false,
            scamProtection: false,
            rateLimiting: false,
            sessionEncryption: false
        };
    }

    // Initialize security features
    async initialize() {
        try {
            // Initialize encryption
            await this.initializeEncryption();
            
            // Initialize Midnight API connection
            await this.initializeMidnightAPI();
            
            // Initialize rate limiting
            this.initializeRateLimiting();

            return true;
        } catch (error) {
            console.error('Security initialization failed:', error);
            return false;
        }
    }

    // Initialize encryption
    async initializeEncryption() {
        try {
            this.encryptionKey = await window.crypto.subtle.generateKey(
                {
                    name: "AES-GCM",
                    length: 256
                },
                true,
                ["encrypt", "decrypt"]
            );
            this.features.sessionEncryption = true;
            return true;
        } catch (error) {
            console.error('Encryption initialization failed:', error);
            return false;
        }
    }

    // Initialize Midnight API connection
    async initializeMidnightAPI() {
        try {
            // For demo purposes, instead of actually connecting to an API,
            // simulate a successful connection with a delay
            console.log('Initializing Midnight API (demo mode)...');
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Activate the features based on config
            if (this.config.midnight.features.zeroKnowledge) {
                this.features.zeroKnowledge = true;
            }
            
            if (this.config.midnight.features.scamProtection) {
                this.features.scamProtection = true;
            }
            
            console.log('Midnight API initialized successfully (demo mode)');
            return true;
        } catch (error) {
            console.error('Midnight API initialization failed:', error);
            return false;
        }
    }

    // Initialize rate limiting
    initializeRateLimiting() {
        if (this.config.security.enabledFeatures.rateLimiting) {
            this.features.rateLimiting = true;
            return true;
        }
        return false;
    }

    // Get feature status
    getFeatureStatus() {
        return this.features;
    }

    // Validate transaction parameters
    validateTransaction(recipientAddress, amount, memo = '') {
        const checks = {
            recipient: this.validateStellarAddress(recipientAddress),
            amount: this.validateAmount(amount),
            memo: this.validateMemo(memo)
        };

        return {
            isValid: Object.values(checks).every(check => check.valid),
            errors: Object.entries(checks)
                .filter(([_, check]) => !check.valid)
                .map(([field, check]) => ({ field, message: check.message }))
        };
    }

    // Validate Stellar address format and checksum
    validateStellarAddress(address) {
        try {
            if (!address || typeof address !== 'string') {
                return { valid: false, message: 'Invalid address format' };
            }
            
            // Check if it's a valid Ed25519 Public Key
            if (typeof StellarSdk === 'undefined') {
                console.error('StellarSdk is not available to validate address');
                return { valid: true, message: 'Address format check skipped' };
            }
            
            const isValid = StellarSdk.StrKey.isValidEd25519PublicKey(address);
            if (isValid) {
                this.features.decentralizedId = true;
            }
            return {
                valid: isValid,
                message: isValid ? 'Valid' : 'Invalid Stellar address checksum'
            };
        } catch (error) {
            console.error('Address validation error:', error);
            return { valid: false, message: 'Address validation failed' };
        }
    }

    // Validate transaction amount
    validateAmount(amount) {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) {
            return { valid: false, message: 'Amount must be a number' };
        }
        if (numAmount <= 0) {
            return { valid: false, message: 'Amount must be greater than 0' };
        }
        if (numAmount > this.config.security.maxAmountPerTransaction) {
            return { valid: false, message: 'Amount exceeds maximum limit' };
        }
        return { valid: true, message: 'Valid' };
    }

    // Validate transaction memo
    validateMemo(memo) {
        if (!memo) {
            return { valid: true, message: 'Valid' };
        }
        if (typeof memo !== 'string') {
            return { valid: false, message: 'Memo must be text' };
        }
        if (memo.length > 28) { // Stellar memo text limit
            return { valid: false, message: 'Memo exceeds length limit' };
        }
        // Check for potentially harmful characters
        if (/[<>{}()']/.test(memo)) {
            return { valid: false, message: 'Memo contains invalid characters' };
        }
        return { valid: true, message: 'Valid' };
    }

    // Rate limiting for transactions
    async checkRateLimit(userAddress) {
        if (!this.features.rateLimiting) {
            return true; // If rate limiting is disabled, allow all transactions
        }

        const key = `tx_count_${userAddress}`;
        const count = parseInt(localStorage.getItem(key) || '0');
        const lastTx = parseInt(localStorage.getItem(`${key}_time`) || '0');
        const now = Date.now();

        // Reset counter if last transaction was more than an hour ago
        if (now - lastTx > 3600000) {
            localStorage.setItem(key, '0');
            localStorage.setItem(`${key}_time`, now.toString());
            return true;
        }

        // Check against configured limit
        if (count >= this.config.security.maxTransactionsPerHour) {
            return false;
        }

        localStorage.setItem(key, (count + 1).toString());
        localStorage.setItem(`${key}_time`, now.toString());
        return true;
    }

    // Monitor for suspicious activity
    async monitorActivity(transaction) {
        if (!this.features.scamProtection) {
            return true; // If scam protection is disabled, allow all transactions
        }

        const suspiciousPatterns = [
            transaction.amount > this.config.security.maxAmountPerTransaction,
            transaction.memo?.includes('http'),
            await this.isKnownScamAddress(transaction.destination)
        ];

        return !suspiciousPatterns.some(pattern => pattern);
    }

    // Check against known scam addresses
    async isKnownScamAddress(address) {
        if (!this.features.scamProtection) {
            return false; // If scam protection is disabled, consider all addresses safe
        }

        try {
            // For demo purposes, simulate API check with a delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // In demo mode, only flag specific addresses as scams for demonstration
            const knownScamAddresses = [
                'GBAD5IYGBKBG7NMNA5RYSGWTTK5PPZ4JNACN4OPSUQ3QSCVNH3NTNHRQ',
                'GDYULVJK2T6G7HFUC5GI7XXXI5FEGC764AYFBPICQRRJWMGBPWZWFVPZ'
            ];
            
            return knownScamAddresses.includes(address);
        } catch (error) {
            console.error('Scam check error:', error);
            return false; // Error during check, assume address is safe
        }
    }

    // Add a new simulated method for checking address privacy score
    async getAddressPrivacyScore(address) {
        if (!this.features.zeroKnowledge) {
            return { score: 0, details: 'Privacy features not activated' };
        }
        
        // For demo purposes, generate a score based on the address string
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Generate a consistent but random-looking score based on the address
        let hash = 0;
        for (let i = 0; i < address.length; i++) {
            hash = ((hash << 5) - hash) + address.charCodeAt(i);
            hash |= 0;
        }
        
        const normalizedScore = Math.abs(hash % 100) / 100;
        const score = normalizedScore * 0.7 + 0.3; // Ensure score is at least 0.3 (30%)
        
        return {
            score: score,
            details: `Privacy score: ${(score * 100).toFixed(1)}%`,
            recommendations: score < 0.7 ? [
                'Consider using a new address for each transaction',
                'Avoid linking this address to public identifiers'
            ] : []
        };
    }
}

// Export the SecurityManager class for ES modules
export default SecurityManager; 