// Simple Stellar payment contract example
// This is a simplified version for demonstration purposes

// Import the Stellar SDK
const StellarSdk = require('@stellar/stellar-sdk');

// Horizon testnet instance
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

// Smart contract wrapper class
class StellarPaymentContract {
  constructor() {
    // The contract deploys to testnet by default
    this.networkPassphrase = StellarSdk.Networks.TESTNET;
    this.contractId = "EXAMPLE_CONTRACT_ID_PLACEHOLDER"; // Replace with actual deployed contract ID
  }

  // Initialize a new payment
  async initializePayment(sourceKeypair, destinationPublicKey, amount, memo = "") {
    try {
      // Load source account
      const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
      
      // Build the transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationPublicKey,
          asset: StellarSdk.Asset.native(), // XLM
          amount: amount.toString()
        }))
        .addMemo(memo ? new StellarSdk.Memo.text(memo) : StellarSdk.Memo.none())
        .setTimeout(30)
        .build();
      
      // Sign the transaction
      transaction.sign(sourceKeypair);
      
      // Submit to the network
      const result = await server.submitTransaction(transaction);
      
      return {
        success: true,
        txHash: result.hash,
        ledger: result.ledger,
        result
      };
    } catch (error) {
      console.error("Payment failed", error);
      return {
        success: false,
        error: error.message || "Unknown error",
        details: error.response?.data?.extras?.result_codes || {}
      };
    }
  }
  
  // Check payment status
  async checkPaymentStatus(txHash) {
    try {
      const tx = await server.transactions().transaction(txHash).call();
      return {
        success: true,
        status: "confirmed",
        ledger: tx.ledger,
        createdAt: tx.created_at
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return {
          success: false,
          status: "pending_or_failed",
          error: "Transaction not found. It may be pending or failed."
        };
      }
      return {
        success: false,
        status: "error",
        error: error.message || "Unknown error"
      };
    }
  }
}

// Export the contract
module.exports = StellarPaymentContract; 