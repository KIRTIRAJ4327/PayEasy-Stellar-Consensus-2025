document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const form = document.getElementById('payment-form');
    const statusDiv = document.getElementById('status');
    const successDiv = document.getElementById('success');
    const errorDiv = document.getElementById('error');
    const txIdSpan = document.getElementById('tx-id');
    const txLink = document.getElementById('tx-link');
    const errorMessage = document.getElementById('error-message');
    
    // Stellar SDK setup
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    const networkPassphrase = StellarSdk.Networks.TESTNET;
    
    // Replace with your actual secret key from Stellar Laboratory
    const sourceSecretKey = 'SCXZW7YP5XGTQW6QGTCW2J737RTMX7JEW3HAO2HXCDRVV22EDANWXRQI';
    let sourceKeypair;
    
    try {
        sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
        console.log('Source account public key:', sourceKeypair.publicKey());
    } catch (error) {
        console.error('Invalid secret key:', error);
        showError('Invalid source account secret key. Please update your app.js file.');
        return;
    }
    
    // Function to show/hide UI elements
    function showStatus() {
        form.style.display = 'none';
        statusDiv.classList.remove('hidden');
        successDiv.classList.add('hidden');
        errorDiv.classList.add('hidden');
    }
    
    function showSuccess(txId) {
        form.style.display = 'block';
        statusDiv.classList.add('hidden');
        successDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        
        txIdSpan.textContent = txId;
        txLink.href = `https://stellar.expert/explorer/testnet/tx/${txId}`;
    }
    
    function showError(message) {
        form.style.display = 'block';
        statusDiv.classList.add('hidden');
        successDiv.classList.add('hidden');
        errorDiv.classList.remove('hidden');
        
        errorMessage.textContent = message;
    }
    
    function resetForm() {
        form.reset();
    }
    
    // Handle form submission
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const recipientAddress = document.getElementById('recipient').value.trim();
        const amount = document.getElementById('amount').value;
        const memo = document.getElementById('memo').value.trim();
        
        // Validate inputs
        if (!StellarSdk.StrKey.isValidEd25519PublicKey(recipientAddress)) {
            showError('Invalid recipient address. Please enter a valid Stellar public key.');
            return;
        }
        
        if (parseFloat(amount) <= 0) {
            showError('Please enter a valid amount greater than 0.');
            return;
        }
        
        // Show processing status
        showStatus();
        
        try {
            // Step 1: Load the source account
            const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
            
            // Step 2: Create a transaction
            let transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: networkPassphrase
            });
            
            // Add the payment operation
            transaction = transaction.addOperation(
                StellarSdk.Operation.payment({
                    destination: recipientAddress,
                    asset: StellarSdk.Asset.native(), // XLM
                    amount: amount.toString()
                })
            );
            
            // Add memo if provided
            if (memo) {
                transaction = transaction.addMemo(StellarSdk.Memo.text(memo));
            }
            
            // Set timeout and build the transaction
            transaction = transaction.setTimeout(180).build();
            
            // Step 3: Sign the transaction
            transaction.sign(sourceKeypair);
            
            // Step 4: Submit the transaction
            const result = await server.submitTransaction(transaction);
            console.log('Transaction successful:', result);
            
            // Show success and reset form
            showSuccess(result.hash);
            resetForm();
            
        } catch (error) {
            console.error('Transaction failed:', error);
            
            // Extract error message
            let errorText = 'Transaction failed. Please try again.';
            if (error.response && error.response.data && error.response.data.extras) {
                errorText = error.response.data.extras.result_codes.operations 
                    ? `Operation failed: ${error.response.data.extras.result_codes.operations.join(', ')}`
                    : `Transaction failed: ${error.response.data.extras.result_codes.transaction}`;
            } else if (error.message) {
                errorText = error.message;
            }
            
            showError(errorText);
        }
    });
});