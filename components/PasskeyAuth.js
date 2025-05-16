// Passkey Authentication Component for Stellar Smart Wallets
// This is a simplified example for demonstration purposes

// Note: In a real implementation, you would use @stellar/passkey-kit
// This is a placeholder implementation showing the concept

class PasskeyAuth {
  constructor() {
    // Check if we're running in development mode
    this.isDevelopmentMode = window.location.hostname === 'localhost' || 
                             window.location.protocol !== 'https:';
    
    // In development mode, we'll simulate passkey support
    this.isAvailable = this.isDevelopmentMode || 
                      (typeof window !== 'undefined' && 
                       window.PublicKeyCredential !== undefined);
    
    this.userId = null;
    this.username = null;
    
    console.log(`PasskeyAuth initialized - Development mode: ${this.isDevelopmentMode}, Available: ${this.isAvailable}`);
  }

  // Check if WebAuthn/Passkeys are supported in this browser
  checkAvailability() {
    // Always return true in development mode to allow simulation
    if (this.isDevelopmentMode) {
      console.log("Running in development mode - simulating passkey support");
      return true;
    }
    
    if (!this.isAvailable) {
      console.error("WebAuthn/Passkeys are not supported in this browser");
      return false;
    }
    
    return true;
  }

  // Register a new user with passkey
  async registerUser(username) {
    // In development mode, simulate successful registration
    if (this.isDevelopmentMode) {
      console.log(`Development mode: Simulating passkey registration for ${username}`);
      
      // Generate a random user ID
      const userId = Math.random().toString(36).substring(2, 15);
      
      // Store in class for this session
      this.userId = userId;
      this.username = username;
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        userId: userId,
        credential: {
          id: "simulated-credential-id",
          type: "public-key"
        }
      };
    }
    
    if (!this.checkAvailability()) return { success: false, error: "Passkeys not supported" };
    
    try {
      // Generate a random user ID
      const userId = crypto.randomUUID();
      
      // Create PublicKeyCredentialCreationOptions
      const publicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32).fill(1),  // In production, use a server-generated challenge
        rp: {
          name: "PayEasy",
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: username,
          displayName: username
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 }  // ES256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform", // Prefer built-in authenticator (like FaceID)
          requireResidentKey: true,
          userVerification: "required"
        },
        timeout: 60000,
        attestation: "direct"
      };

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      });

      // In production, you would send this credential to your server
      console.log("Credential created:", credential);
      
      // Store in class for this session
      this.userId = userId;
      this.username = username;
      
      return {
        success: true,
        userId: userId,
        credential: {
          id: credential.id,
          type: credential.type
        }
      };
    } catch (error) {
      console.error("Error creating passkey:", error);
      return {
        success: false,
        error: error.message || "Failed to create passkey"
      };
    }
  }

  // Authenticate a user with passkey
  async authenticateUser() {
    // In development mode, simulate successful authentication
    if (this.isDevelopmentMode) {
      console.log("Development mode: Simulating passkey authentication");
      
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        credential: {
          id: "simulated-credential-id",
          type: "public-key"
        }
      };
    }
    
    if (!this.checkAvailability()) return { success: false, error: "Passkeys not supported" };
    
    try {
      // Create PublicKeyCredentialRequestOptions
      const publicKeyCredentialRequestOptions = {
        challenge: new Uint8Array(32).fill(2),  // In production, use a server-generated challenge
        rpId: window.location.hostname,
        userVerification: "required",
        timeout: 60000
      };

      // Get credentials
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      });

      // In production, you would validate this assertion on your server
      console.log("User authenticated with credential:", credential);
      
      return {
        success: true,
        credential: {
          id: credential.id,
          type: credential.type
        }
      };
    } catch (error) {
      console.error("Error authenticating with passkey:", error);
      return {
        success: false,
        error: error.message || "Failed to authenticate with passkey"
      };
    }
  }

  // Create a Stellar Smart Wallet using the passkey
  async createStellarSmartWallet() {
    // In development mode, we can simulate this without requiring prior registration
    if (this.isDevelopmentMode && !this.userId) {
      const simulatedUserId = Math.random().toString(36).substring(2, 15);
      this.userId = simulatedUserId;
      this.username = this.username || "Demo User";
    }
    
    if (!this.userId) {
      return { 
        success: false, 
        error: "User not registered yet. Please register first." 
      };
    }
    
    // Use a fixed, consistent Stellar address for demo purposes
    // This matches the example address shown on the login page
    const stellarAddress = "GDXDFWOBZTCD4PCNJZJ72GISISUUTPQX45PU44WDJMDEP3FQWMN7CCGL";
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      stellarAddress: stellarAddress,
      userId: this.userId,
      username: this.username
    };
  }
  
  // Sign a transaction using the passkey
  async signTransaction(transactionXDR) {
    // In development mode, we can simulate this without requiring authentication
    if (this.isDevelopmentMode && !this.userId) {
      this.userId = Math.random().toString(36).substring(2, 15);
    }
    
    if (!this.userId) {
      return { 
        success: false, 
        error: "User not authenticated. Please authenticate first." 
      };
    }
    
    try {
      // In a real implementation, this would use the WebAuthn API to sign the transaction
      // For demo purposes, we'll simulate a successful signature
      
      console.log("Simulating transaction signature for:", transactionXDR?.substring(0, 20) + "...");
      
      return {
        success: true,
        signedTransaction: (transactionXDR || "empty") + ".SIGNED", // Just a placeholder
        signedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error signing transaction:", error);
      return {
        success: false,
        error: error.message || "Failed to sign transaction"
      };
    }
  }
}

// Export the authentication service
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PasskeyAuth;
}

// Also make it available as a global variable
if (typeof window !== 'undefined') {
  window.PasskeyAuth = PasskeyAuth;
}

console.log("PasskeyAuth loaded"); 