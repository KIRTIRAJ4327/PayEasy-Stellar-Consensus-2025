/**
 * PayEasy Integrated Passkey Authentication
 * 
 * This file enhances the user experience with passkey authentication
 */

// Enhance Dashboard with Passkey Authentication Indicators
document.addEventListener('DOMContentLoaded', function() {
  console.log("Initializing passkey authentication integration...");
  
  // Create a new PasskeyAuth instance
  const passkeyAuth = window.PasskeyAuth ? new window.PasskeyAuth() : null;
  
  // Check for passkey support
  if (passkeyAuth && !passkeyAuth.checkAvailability()) {
    console.warn("Passkeys not supported in this browser");
  }
  
  // Create mutation observer to watch for the dashboard rendering
  const dashboardObserver = new MutationObserver(function(mutations) {
    // Check if the dashboard is rendered
    const dashboardHeader = document.querySelector('.dashboard-header');
    if (dashboardHeader) {
      enhanceDashboardWithPasskeyIndicator();
      
      // Once we've enhanced the dashboard, disconnect the observer
      this.disconnect();
    }
  });
  
  // Start observing the document for dashboard rendering
  dashboardObserver.observe(document.body, { childList: true, subtree: true });
  
  // Function to enhance the dashboard with passkey authentication indicator
  function enhanceDashboardWithPasskeyIndicator() {
    try {
      // Check if user is authenticated with passkey
      const isPasskeyAuth = window.AuthService && window.AuthService.isLoggedInWithPasskey && window.AuthService.isLoggedInWithPasskey();
      
      // Find the welcome message or account info section
      const accountInfoSection = document.querySelector('.dashboard-account-info');
      if (accountInfoSection) {
        // Create passkey badge element if user authenticated with passkey
        if (isPasskeyAuth) {
          // Create badge element
          const passkeySafetyBadge = document.createElement('span');
          passkeySafetyBadge.className = 'passkey-badge';
          passkeySafetyBadge.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Passkey Verified
          `;

          // Find the account name element to append the badge
          const accountName = accountInfoSection.querySelector('h2, h3, .account-name');
          if (accountName) {
            accountName.appendChild(passkeySafetyBadge);
          } else {
            // If no specific element found, append to the section
            accountInfoSection.appendChild(passkeySafetyBadge);
          }
        }
      }
      
      // Also enhance the payment form if present
      enhancePaymentForm();
      
    } catch (error) {
      console.error('Error enhancing dashboard with passkey indicator:', error);
    }
  }
  
  // Function to enhance the payment form with passkey security indicator
  function enhancePaymentForm() {
    try {
      // Check if user is authenticated with passkey
      const isPasskeyAuth = window.AuthService && window.AuthService.isLoggedInWithPasskey && window.AuthService.isLoggedInWithPasskey();
      
      if (isPasskeyAuth) {
        // Create mutation observer for payment form
        const paymentFormObserver = new MutationObserver(function(mutations) {
          const paymentForm = document.querySelector('.payment-form');
          if (paymentForm) {
            // Find the privacy section if it exists
            const privacySection = paymentForm.querySelector('.privacy-section, .security-features');
            
            if (privacySection) {
              // Check if we've already added our badge
              if (!privacySection.querySelector('.passkey-security-feature')) {
                // Create a new security feature for passkey
                const passkeySecurity = document.createElement('div');
                passkeySecurity.className = 'privacy-option passkey-security-feature flex items-center';
                passkeySecurity.innerHTML = `
                  <div class="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 mr-3">
                    <svg class="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <span class="text-gray-700 font-medium">Passkey Protection</span>
                    <p class="text-gray-500 text-xs">Enhanced security with biometric verification</p>
                  </div>
                  <div class="ml-auto">
                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Active</span>
                  </div>
                `;
                
                // Add to the privacy section
                privacySection.appendChild(passkeySecurity);
              }
            }
            
            // Disconnect observer once enhanced
            this.disconnect();
          }
        });
        
        // Start observing for payment form
        paymentFormObserver.observe(document.body, { childList: true, subtree: true });
      }
    } catch (error) {
      console.error('Error enhancing payment form with passkey indicator:', error);
    }
  }
  
  // Also enhance logout to properly handle return to main login
  function enhanceLogout() {
    // Create mutation observer to watch for logout button
    const logoutObserver = new MutationObserver(function(mutations) {
      const logoutButton = document.querySelector('.logout-button, button[data-action="logout"]');
      if (logoutButton) {
        // Store original onclick
        const originalOnClick = logoutButton.onclick;
        
        // Replace with enhanced version
        logoutButton.onclick = function(event) {
          // Clear passkey auth flag to ensure clean logout
          if (window.AuthService) {
            window.AuthService.isPasskeyAuthenticated = false;
          }
          
          // Clear the URL parameters on logout
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Call original handler
          if (typeof originalOnClick === 'function') {
            return originalOnClick.call(this, event);
          }
          return true;
        };
        
        // Disconnect observer
        this.disconnect();
      }
    });
    
    // Start observing for logout button
    logoutObserver.observe(document.body, { childList: true, subtree: true });
  }
  
  // Call enhanceLogout to set up observer
  enhanceLogout();
  
  console.log("Passkey authentication integration initialized");
}); 