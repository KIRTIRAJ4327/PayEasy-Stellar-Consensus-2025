/**
 * PayEasy Configuration
 * 
 * Integrates Stellar's payment infrastructure with the Midnight privacy protocol
 * to provide secure, private transactions on the Stellar network.
 */

const config = {
    // Stellar Network Configuration (Primary Payment Infrastructure)
    stellar: {
        network: 'TESTNET',
        horizonUrl: 'https://horizon-testnet.stellar.org',
        // Use a demo key for the hackathon presentation
        // In production, this would be securely loaded from environment variables
        sourceSecretKey: 'SCXZW7YP5XGTQW6QGTCW2J737RTMX7JEW3HAO2HXCDRVV22EDANWXRQI'
    },

    // Midnight Protocol Configuration (Privacy Layer)
    midnight: {
        // Simulated configuration for demonstration
        features: {
            zeroKnowledge: true,
            decentralizedId: true,
            scamProtection: true,
            rateLimiting: true,
            sessionEncryption: true
        },
        // Demo endpoint (would be replaced with actual privacy infrastructure in production)
        endpoint: 'https://demo.midnight-protocol.local/v1',
        timeout: 10000
    },

    // Security Settings
    security: {
        maxTransactionsPerHour: 10,
        maxAmountPerTransaction: 100000,
        // Feature toggles for the privacy layer
        enabledFeatures: {
            zeroKnowledge: true,
            decentralizedId: true,
            scamProtection: true,
            rateLimiting: true,
            sessionEncryption: true
        }
    }
};

// Prevent modification of configuration
Object.freeze(config);

export default config; 