/**
 * PayEasy Integrated Cross-Chain Payment
 * 
 * This file enhances the existing payment flow with cross-chain functionality
 */

(function() {
  console.log("Initializing integrated cross-chain payment...");
  
  // Initialize services
  const stellarPayment = window.StellarPaymentContract ? new window.StellarPaymentContract() : null;
  const polkadotPayment = window.PolkadotPaymentHandler ? new window.PolkadotPaymentHandler() : null;
  const launchtube = window.LaunchtubeService ? new window.LaunchtubeService() : null;
  
  // Check if services are available
  if (!stellarPayment || !polkadotPayment || !launchtube) {
    console.error("Required services not found. Make sure StellarPaymentContract, PolkadotPaymentHandler, and LaunchtubeService are loaded.");
    return;
  }
  
  // Enhance the payment screen with cross-chain features
  const enhancePaymentScreen = () => {
    // Find the payment form (currency selection)
    const currencySelectionContainer = document.querySelector('.currency-selection') || 
                                      document.querySelector('[class*="currency"]') ||
                                      document.querySelector('form');
    
    if (!currencySelectionContainer) {
      console.log("Payment form not found yet, will retry soon...");
      setTimeout(enhancePaymentScreen, 500);
      return;
    }
    
    console.log("Payment form found, enhancing with cross-chain features...");
    
    // Find the submit button
    const submitButton = document.querySelector('button[type="submit"]') || 
                         document.querySelector('form button:last-child');
    
    if (!submitButton) {
      console.log("Submit button not found, will retry...");
      setTimeout(enhancePaymentScreen, 500);
      return;
    }
    
    // Add cross-chain badge
    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'flex items-center justify-center mb-3';
    badgeContainer.innerHTML = `
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
        <span class="mr-1">🔄</span> Cross-Chain Ready
      </div>
    `;
    
    // Insert the badge before the form
    const form = submitButton.closest('form');
    if (form) {
      form.parentNode.insertBefore(badgeContainer, form);
    }
    
    // Add information about gas fee abstraction
    let feeInfoContainer = document.querySelector('.fee-info');
    
    if (!feeInfoContainer) {
      // Create fee info element if it doesn't exist
      feeInfoContainer = document.createElement('div');
      feeInfoContainer.className = 'fee-info text-center text-sm text-gray-600 mt-2';
      
      // Add it after the submit button
      submitButton.parentNode.insertBefore(feeInfoContainer, submitButton.nextSibling);
    }
    
    feeInfoContainer.innerHTML = `
      <div class="mt-2 flex items-center justify-center">
        <span class="text-green-600 mr-1">✓</span>
        <span>Gas fees sponsored by Launchtube</span>
      </div>
    `;
    
    // Observe the currency selection to update the UI accordingly
    const updateCurrencyUI = (currency) => {
      if (feeInfoContainer) {
        if (currency === 'XLM') {
          feeInfoContainer.innerHTML = `
            <div class="mt-2 flex items-center justify-center">
              <span class="text-green-600 mr-1">✓</span>
              <span>Gas fees sponsored by Launchtube</span>
            </div>
          `;
        } else {
          feeInfoContainer.innerHTML = `
            <div class="mt-2 flex items-center justify-center">
              <span class="text-purple-600 mr-1">✓</span>
              <span>Transaction fees sponsored by Polkadot Hub</span>
            </div>
          `;
        }
      }
    };
    
    // Find currency selection buttons
    const xlmButton = document.querySelector('button:has(span:contains("XLM"))') || 
                      document.querySelector('button[contains*="XLM"]') ||
                      Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('XLM') || btn.textContent.includes('Stellar'));
                      
    const dotButton = document.querySelector('button:has(span:contains("DOT"))') || 
                     document.querySelector('button[contains*="DOT"]') ||
                     Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('DOT') || btn.textContent.includes('Polkadot'));
    
    if (xlmButton && dotButton) {
      // Add click listeners to update UI
      xlmButton.addEventListener('click', () => updateCurrencyUI('XLM'));
      dotButton.addEventListener('click', () => updateCurrencyUI('DOT'));
    }
    
    // Initialize based on current selection
    const currentCurrency = document.querySelector('.currency-selection .selected')?.textContent.includes('DOT') ? 'DOT' : 'XLM';
    updateCurrencyUI(currentCurrency);
    
    // Enhance the form submission
    if (form) {
      // Store the original onsubmit handler
      const originalSubmit = form.onsubmit;
      
      // Replace with our enhanced handler
      form.onsubmit = async function(event) {
        // Call the original handler if it exists
        if (originalSubmit) {
          // If it returns false, prevent form submission
          const originalResult = originalSubmit.call(this, event);
          if (originalResult === false) {
            return false;
          }
        }
        
        // Our enhancements for cross-chain payment
        const isUsingDOT = document.querySelector('.currency-selection .selected')?.textContent.includes('DOT') || 
                         dotButton?.classList.contains('bg-blue-500') ||
                         currentCurrency === 'DOT';
        
        // Prevent default to handle submission manually
        event.preventDefault();
        
        // Set loading state
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        `;
        
        try {
          // Get form values
          const recipientInput = form.querySelector('input[placeholder*="recipient"]') || 
                               form.querySelector('input[id*="recipient"]') ||
                               form.querySelector('input[name*="recipient"]') ||
                               form.querySelector('input[placeholder*="G"]');
                               
          const amountInput = form.querySelector('input[placeholder*="amount"]') || 
                            form.querySelector('input[id*="amount"]') ||
                            form.querySelector('input[name*="amount"]');
                            
          const memoInput = form.querySelector('input[placeholder*="memo"]') || 
                           form.querySelector('input[id*="memo"]') ||
                           form.querySelector('input[name*="memo"]');
          
          if (!recipientInput || !amountInput) {
            throw new Error("Could not find required form fields");
          }
          
          const recipient = recipientInput.value;
          const amount = parseFloat(amountInput.value);
          const memo = memoInput ? memoInput.value : '';
          
          if (!recipient) {
            throw new Error("Please enter a recipient address");
          }
          
          if (isNaN(amount) || amount <= 0) {
            throw new Error("Please enter a valid amount greater than 0");
          }
          
          // Create progress indicator
          const progressContainer = document.createElement('div');
          progressContainer.className = 'my-4';
          progressContainer.innerHTML = `
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" style="width: 25%"></div>
            </div>
            <p class="text-sm text-gray-600 mt-2">Preparing transaction...</p>
          `;
          submitButton.parentNode.insertBefore(progressContainer, submitButton.nextSibling);
          
          // Update progress status
          const updateProgress = (step, message) => {
            const progressBar = progressContainer.querySelector('.bg-blue-600');
            const progressText = progressContainer.querySelector('p');
            
            if (progressBar && progressText) {
              progressBar.style.width = `${(step / 4) * 100}%`;
              progressText.textContent = message;
            }
          };
          
          // Process based on selected currency
          let txResult;
          
          if (isUsingDOT) {
            // Step 1: Connect to Polkadot
            updateProgress(1, 'Connecting to Polkadot network...');
            await polkadotPayment.connect();
            
            // Step 2: Request signature
            updateProgress(2, 'Requesting signature...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Step 3: Prepare transaction
            updateProgress(3, 'Preparing transaction...');
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Step 4: Submit transaction
            updateProgress(4, 'Submitting transaction...');
            txResult = await polkadotPayment.sendPayment(
              "mock_sender_seed", 
              recipient,
              amount
            );
          } else {
            // Step 1: Initialize payment
            updateProgress(1, 'Initializing payment...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Step 2: Request signature
            updateProgress(2, 'Requesting signature...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Step 3: Sponsor gas fees
            updateProgress(3, 'Sponsoring gas fees via Launchtube...');
            await launchtube.initialize();
            
            // Step 4: Submit transaction
            updateProgress(4, 'Submitting transaction...');
            txResult = await launchtube.sponsorAndSubmit("mock_transaction_xdr");
          }
          
          // Check if transaction was successful
          if (!txResult || !txResult.success) {
            throw new Error(txResult?.error || 'Transaction failed');
          }
          
          // Show success UI
          // Find the container to replace
          const containerToReplace = form.closest('.max-w-md') || form;
          
          // Create success message
          const successHTML = `
            <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <div class="flex items-center justify-center mb-4">
                <svg class="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h3 class="font-bold text-green-800 text-center text-xl mb-4">Payment Successful!</h3>
              
              <div class="space-y-2 mb-4">
                <div class="flex justify-between">
                  <span class="text-gray-600">Amount:</span>
                  <span class="font-medium">${amount} ${isUsingDOT ? 'DOT' : 'XLM'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Recipient:</span>
                  <span class="font-medium truncate max-w-[200px]">${recipient}</span>
                </div>
                ${memo ? `
                <div class="flex justify-between">
                  <span class="text-gray-600">Memo:</span>
                  <span class="font-medium">${memo}</span>
                </div>
                ` : ''}
                <div class="flex justify-between">
                  <span class="text-gray-600">Transaction Hash:</span>
                  <span class="font-medium truncate max-w-[200px]">${txResult.txHash.substring(0, 10)}...</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">
                    ${isUsingDOT ? 'Block Hash:' : 'Ledger:'}
                  </span>
                  <span class="font-medium">
                    ${isUsingDOT 
                      ? txResult.blockHash.substring(0, 10) + '...'
                      : txResult.ledger}
                  </span>
                </div>
              </div>
              
              <div class="mt-6 text-center">
                <span class="text-sm text-gray-500">
                  ${isUsingDOT 
                    ? 'Transaction confirmed on Polkadot Hub' 
                    : 'Gas fees sponsored by Launchtube'}
                </span>
              </div>
              
              <button 
                class="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                id="send-another-payment"
              >
                Send Another Payment
              </button>
            </div>
          `;
          
          // Replace form with success message
          containerToReplace.innerHTML = successHTML;
          
          // Add event listener to "Send Another Payment" button
          document.getElementById('send-another-payment')?.addEventListener('click', () => {
            window.location.reload();
          });
          
          return false;
        } catch (error) {
          console.error('Payment error:', error);
          
          // Show error message
          const errorContainer = document.createElement('div');
          errorContainer.className = 'mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-md';
          errorContainer.textContent = error.message || 'An error occurred during payment processing';
          submitButton.parentNode.insertBefore(errorContainer, submitButton.nextSibling);
          
          // Reset button
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
          
          // Remove progress indicator if it exists
          document.querySelector('.my-4')?.remove();
          
          return false;
        }
      };
    }
  };
  
  // Initialize enhancement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhancePaymentScreen);
  } else {
    enhancePaymentScreen();
  }
  
  console.log("Cross-chain payment integration initialized");
})(); 