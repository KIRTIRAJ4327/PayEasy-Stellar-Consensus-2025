/**
 * Debug Helper for PayEasy Application
 * This script checks if all required dependencies are loaded correctly
 */

// Function to check if a dependency is loaded and report it
function checkDependency(name, obj) {
  const isLoaded = !!obj;
  console.log(`Dependency ${name}: ${isLoaded ? 'LOADED ✅' : 'MISSING ❌'}`);
  
  if (isLoaded && typeof obj === 'object') {
    console.log(`  - ${name} properties:`, Object.keys(obj).slice(0, 10).join(', ') + (Object.keys(obj).length > 10 ? '...' : ''));
  }
  
  return isLoaded;
}

// Run tests when the window loads
window.addEventListener('load', function() {
  console.group('PayEasy Application Diagnostics');
  console.log('Running diagnostics...');
  
  // Check essential React libraries
  const reactLoaded = checkDependency('React', window.React);
  const reactDomLoaded = checkDependency('ReactDOM', window.ReactDOM);
  const reactRouterLoaded = checkDependency('ReactRouterDOM', window.ReactRouterDOM);
  
  // Check PayEasy services
  const polkadotLoaded = checkDependency('PolkadotService', window.PolkadotService);
  const servicesLoaded = checkDependency('Services namespace', window.Services);
  
  if (servicesLoaded) {
    console.group('  Services:');
    checkDependency('MidnightService', window.Services.MidnightService);
    checkDependency('AuthService', window.Services.AuthService);
    checkDependency('ExchangeService', window.Services.ExchangeService);
    checkDependency('ValidationService', window.Services.ValidationService);
    console.groupEnd();
  }
  
  // Check Stellar SDK
  checkDependency('StellarSdk', window.StellarSdk);
  
  // Check if PayEasyPhase2 component is defined
  try {
    console.log('PayEasyPhase2 component: ', typeof PayEasyPhase2 === 'function' ? 'DEFINED ✅' : 'MISSING ❌');
  } catch (err) {
    console.log('PayEasyPhase2 component: MISSING ❌ (not defined in global scope)');
  }
  
  // Check if other key components are defined
  ['ErrorBoundary', 'PayEasyApp', 'PaymentScreen', 'LoginScreen', 'Dashboard'].forEach(componentName => {
    try {
      console.log(`${componentName} component: `, typeof window[componentName] === 'function' ? 'DEFINED ✅' : 'NOT GLOBALLY DEFINED ❓');
    } catch (err) {
      console.log(`${componentName} component: NOT ACCESSIBLE ❓`);
    }
  });
  
  console.log('Diagnostics complete');
  console.groupEnd();
  
  // Add a button to the page if there's a diagnostics-output element
  const outputEl = document.getElementById('diagnostics-output');
  if (outputEl) {
    outputEl.innerHTML = `
      <div style="border: 1px solid #ccc; padding: 15px; margin-top: 20px; background: #f5f5f5;">
        <h3>Diagnostics Results:</h3>
        <ul>
          <li>React: ${reactLoaded ? '✅' : '❌'}</li>
          <li>ReactDOM: ${reactDomLoaded ? '✅' : '❌'}</li>
          <li>ReactRouterDOM: ${reactRouterLoaded ? '✅' : '❌'}</li>
          <li>PolkadotService: ${polkadotLoaded ? '✅' : '❌'}</li>
          <li>Services: ${servicesLoaded ? '✅' : '❌'}</li>
        </ul>
        <p>See console for complete diagnostics.</p>
      </div>
    `;
  }
});

console.log('Debug script loaded'); 