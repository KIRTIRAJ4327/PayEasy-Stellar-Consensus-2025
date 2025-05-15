/**
 * PayEasy - Main Application Script
 * 
 * This script handles the core functionality of the PayEasy application:
 * - Exchange rate display and fiat equivalent calculations
 * - Payment form handling and validation
 * - Stellar payment processing
 * - Midnight API integration for enhanced security
 * - UI state management
 */

// Import required modules
import SecurityManager from './security.js';
import SecurityUI from './security-ui.js';

// Make sure StellarSdk is available
if (typeof StellarSdk === 'undefined') {
    console.error('StellarSdk is not loaded! Please check your internet connection.');
    alert('Error: Stellar SDK not loaded. Please check your internet connection and refresh the page.');
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Application initialized');
    
    // Initialize security manager and UI
    const security = new SecurityManager();
    const securityUI = new SecurityUI();
    
    // Initialize security features
    const initialized = await security.initialize();
    if (!initialized) {
        securityUI.showNotification('Security initialization failed. Some features may be limited.', 'error');
    } else {
        securityUI.initialize();
        securityUI.updateFeatureStatus('encryption', true);
    }
    
    // ===== DOM Element References =====
    const elements = {
        form: document.querySelector('#payment-form'),
        recipient: document.querySelector('#recipient'),
        amount: document.querySelector('#amount'),
        memo: document.querySelector('#memo'),
        status: document.querySelector('#status'),
        success: document.querySelector('#success'),
        error: document.querySelector('#error'),
        txId: document.querySelector('#tx-id'),
        txLink: document.querySelector('#tx-link'),
        errorMessage: document.querySelector('#error-message'),
        fiatEquivalent: document.querySelector('#fiat-equivalent'),
        securityChecks: document.querySelector('#security-checks')
    };
    
    // Verify all elements exist
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Required element not found: #${key}`);
            return;
        }
    }
    
    // ===== Stellar Setup =====
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    const sourceSecretKey = 'SCXZW7YP5XGTQW6QGTCW2J737RTMX7JEW3HAO2HXCDRVV22EDANWXRQI';
    let sourceKeypair;
    
    try {
        sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
        console.log('Source account:', sourceKeypair.publicKey());
    } catch (error) {
        console.error('Invalid secret key:', error);
        showError('Invalid source account secret key');
        return;
    }
    
    // ===== Exchange Rates =====
    let exchangeRates = {
        CAD: 0.38,
        INR: 23.45
    };
    
    // Fetch real-time exchange rates - use a mock for the hackathon demo
    async function updateExchangeRates() {
        try {
            // For demo purposes, simulate API response
            // In production, this would be a real API call
            console.log('Updating exchange rates...');
            
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Simulate random rate fluctuations
            exchangeRates = {
                CAD: (0.35 + Math.random() * 0.1).toFixed(4),
                INR: (20 + Math.random() * 10).toFixed(4)
            };
            
            console.log('Updated rates:', exchangeRates);
            
            // Update the display if amount is already entered
            const currentAmount = parseFloat(elements.amount.value) || 0;
            updateFiatEquivalent(currentAmount);
            
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
        }
    }
    
    // Update rates every 15 seconds for demonstration
    updateExchangeRates();
    setInterval(updateExchangeRates, 15000);
    
    // ===== UI Functions =====
    function showStatus(message = 'Processing payment...', securityCheck = '') {
        elements.form.style.display = 'none';
        elements.status.classList.remove('hidden');
        elements.success.classList.add('hidden');
        elements.error.classList.add('hidden');
        document.querySelector('#status-message').textContent = message;
        
        if (securityCheck) {
            const checkItem = document.createElement('div');
            checkItem.className = 'flex items-center';
            checkItem.innerHTML = `
                <svg class="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>${securityCheck}</span>
            `;
            elements.securityChecks.appendChild(checkItem);
        }
    }
    
    function showSuccess(txId) {
        elements.form.style.display = 'block';
        elements.status.classList.add('hidden');
        elements.success.classList.remove('hidden');
        elements.error.classList.add('hidden');
        elements.txId.textContent = txId;
        elements.txLink.href = `https://stellar.expert/explorer/testnet/tx/${txId}`;
        elements.securityChecks.innerHTML = '';
        securityUI.showNotification('Transaction completed securely');
    }
    
    function showError(message, securityDetails = '') {
        elements.form.style.display = 'block';
        elements.status.classList.add('hidden');
        elements.success.classList.add('hidden');
        elements.error.classList.remove('hidden');
        elements.errorMessage.textContent = message;
        elements.securityChecks.innerHTML = '';
        
        if (securityDetails) {
            document.querySelector('#error .text-sm').textContent = securityDetails;
        }
        
        securityUI.showNotification(message, 'error');
    }
    
    function resetForm() {
        elements.form.reset();
        updateFiatEquivalent(0);
        elements.securityChecks.innerHTML = '';
    }
    
    function updateFiatEquivalent(xlmAmount) {
        const cadAmount = (xlmAmount * exchangeRates.CAD).toFixed(2);
        const inrAmount = (xlmAmount * exchangeRates.INR).toFixed(2);
        elements.fiatEquivalent.textContent = `≈ CAD ${cadAmount} | ₹${inrAmount}`;
        console.log(`Updated fiat equivalent: CAD ${cadAmount} | ₹${inrAmount}`);
    }
    
    // ===== Event Listeners =====
    elements.amount.addEventListener('input', (e) => {
        const amount = parseFloat(e.target.value) || 0;
        console.log('Amount changed:', amount);
        updateFiatEquivalent(amount);
    });
    
    // Learn more link handler
    document.getElementById('security-details-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        const features = document.getElementById('security-features');
        if (features) {
            features.classList.remove('hidden');
            features.scrollIntoView({ behavior: 'smooth' });
        }
    });
    
    elements.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Form submitted');
        
        const recipientAddress = elements.recipient.value.trim();
        const amount = elements.amount.value;
        const memo = elements.memo.value.trim();
        
        // Clear previous security checks
        elements.securityChecks.innerHTML = '';
        
        // Validate inputs using security manager
        showStatus('Validating input...');
        const validation = security.validateTransaction(recipientAddress, amount, memo);
        if (!validation.isValid) {
            showError(validation.errors[0].message);
            return;
        }
        showStatus('Input validated', 'Input validation complete');
        
        // Check rate limiting
        showStatus('Checking rate limits...');
        if (!await security.checkRateLimit(sourceKeypair.publicKey())) {
            showError('Transaction limit exceeded. Please try again later.',
                     'Rate limiting helps protect against automated attacks');
            securityUI.updateFeatureStatus('rateLimit', false);
            return;
        }
        showStatus('Rate limit checked', 'Transaction within rate limits');
        securityUI.updateFeatureStatus('rateLimit', true);
        
        // Check for suspicious activity
        showStatus('Performing security checks...');
        const isSecure = await security.monitorActivity({
            destination: recipientAddress,
            amount: parseFloat(amount),
            memo
        });
        
        if (!isSecure) {
            showError('Transaction flagged as potentially suspicious.',
                     'Our security system detected unusual patterns. Please verify the recipient address.');
            securityUI.updateFeatureStatus('midnight', false);
            return;
        }
        showStatus('Security checks passed', 'No suspicious activity detected');
        securityUI.updateFeatureStatus('midnight', true);
        
        showStatus('Processing payment...');
        
        try {
            // Load the source account
            const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());
            
            // Create transaction
            let transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: StellarSdk.Networks.TESTNET
            })
            .addOperation(StellarSdk.Operation.payment({
                destination: recipientAddress,
                asset: StellarSdk.Asset.native(),
                amount: amount.toString()
            }));
            
            // Add memo if provided
            if (memo) {
                transaction = transaction.addMemo(StellarSdk.Memo.text(memo));
            }
            
            // Build and sign transaction
            transaction = transaction.setTimeout(180).build();
            transaction.sign(sourceKeypair);
            
            showStatus('Submitting transaction...', 'Transaction signed and ready');
            
            // Submit transaction
            const result = await server.submitTransaction(transaction);
            console.log('Transaction successful:', result);
            
            showSuccess(result.hash);
            resetForm();
            
        } catch (error) {
            console.error('Transaction failed:', error);
            
            let errorText = 'Transaction failed. Please try again.';
            if (error.response?.data?.extras?.result_codes) {
                const codes = error.response.data.extras.result_codes;
                errorText = codes.operations 
                    ? `Operation failed: ${codes.operations.join(', ')}`
                    : `Transaction failed: ${codes.transaction}`;
            } else if (error.message) {
                errorText = error.message;
            }
            
            showError(errorText, 'Transaction could not be completed securely');
        }
    });
});