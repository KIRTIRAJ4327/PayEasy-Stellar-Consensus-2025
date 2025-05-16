// React Router components
const { HashRouter, Route, Link, Redirect, useHistory, useLocation } = ReactRouterDOM;

// Error Boundary Component to gracefully handle errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <div className="flex items-center mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="ml-4 text-xl font-semibold text-gray-800">Something went wrong</h2>
            </div>
            <p className="text-gray-600 mb-4">
              The application encountered an error. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Refresh Page
            </button>
            
            <div className="mt-6 p-4 bg-gray-100 rounded-md overflow-auto text-xs">
              <details>
                <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                <p className="text-red-600">{this.state.error?.toString()}</p>
                <pre className="mt-2 text-gray-700">{this.state.errorInfo?.componentStack}</pre>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create a wrapper component that contains all routing logic
const PayEasyApp = () => {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);
  const isMounted = React.useRef(true);
  
  // Check login status on mount and clean up on unmount
  React.useEffect(() => {
    try {
      const { isLoggedIn, currentUser } = AuthService.checkLoginStatus();
      setIsLoggedIn(isLoggedIn);
      setCurrentUser(currentUser);
    } catch (error) {
      console.error("Error checking login status:", error);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Login handler
  const handleLogin = async (address) => {
    try {
      const result = await AuthService.login(address);
      
      if (!isMounted.current) return false;
      
      if (result.success) {
        setIsLoggedIn(true);
        setCurrentUser(result.user);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("Login error:", error);
      }
      return false;
    }
  };
  
  // Logout handler
  const handleLogout = () => {
    try {
      // Mark as unmounted first to prevent any state updates after logout
      isMounted.current = false;
      
      AuthService.logout();
      setIsLoggedIn(false);
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ProtectedRoute component for authenticated pages
  const ProtectedRoute = ({ component: Component, ...rest }) => (
    <Route
      {...rest}
      render={props =>
        isLoggedIn ? (
          <Component 
            {...props} 
            currentUser={currentUser} 
            onLogout={handleLogout}
          />
        ) : (
          <Redirect to="/" />
        )
      }
    />
  );

  return (
    <HashRouter>
      <Route
        exact
        path="/"
        render={props => 
          isLoggedIn ? (
            <Redirect to="/dashboard" />
          ) : (
            <LoginScreen 
              {...props} 
              onLogin={handleLogin} 
            />
          )
        }
      />
      <ProtectedRoute
        path="/dashboard"
        component={Dashboard}
      />
      <ProtectedRoute
        path="/payment"
        component={PaymentScreen}
      />
      <Route
        render={() => <Redirect to="/" />}
      />
    </HashRouter>
  );
};

// Payment Screen Component - Update history usage
const PaymentScreen = ({ currentUser, onLogout }) => {
  const history = useHistory();
  
  // Add mounted ref to prevent state updates after unmounting
  const isMounted = React.useRef(true);
  
  // All the state from the original PayEasyPhase2 component
  const [state, setState] = React.useState('form'); // Possible states: form, loading, success, error
  const [recipientAddress, setRecipientAddress] = React.useState('');
  const [senderAddress, setSenderAddress] = React.useState(currentUser?.address || '');
  const [amount, setAmount] = React.useState('');
  const [memo, setMemo] = React.useState('');
  const [txId, setTxId] = React.useState('');
  const [errorText, setErrorText] = React.useState('');
  
  // Currency selection (controls network choice)
  const [selectedCurrency, setSelectedCurrency] = React.useState('XLM');
  
  // Fiat currency conversion
  const [cadEquivalent, setCadEquivalent] = React.useState('0.00');
  const [inrEquivalent, setInrEquivalent] = React.useState('0.00');
  const [usdEquivalent, setUsdEquivalent] = React.useState('0.00');
  const [feeAmount, setFeeAmount] = React.useState('<0.001 XLM ($0.01)');
  
  // Exchange rates
  const [exchangeRates, setExchangeRates] = React.useState({
    XLM: { USD: 0.15, CAD: 0.20, INR: 12.5 },
    DOT: { USD: 6.50, CAD: 8.75, INR: 725 }
  });
  
  // Auto-refresh state
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = React.useState(true);
  const [lastRefreshTime, setLastRefreshTime] = React.useState(new Date());
  const refreshIntervalRef = React.useRef(null);
  
  // Set up cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
      // Also clear any intervals to be safe
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, []);
  
  // Privacy features state
  const [privacyScore, setPrivacyScore] = React.useState(20);
  const [privacyScoreDescription, setPrivacyScoreDescription] = React.useState('Basic Privacy');
  const [privacyBadge, setPrivacyBadge] = React.useState('Standard');
  const [privacyOptions, setPrivacyOptions] = React.useState({
    zeroKnowledge: false,
    scamProtection: true,
    rateLimiting: false,
    encryption: false,
    hideAmount: false,
    obscureRecipient: false,
    preventTracking: false,
    protectMetadata: false
  });
  
  // Preview state
  const [previewAmount, setPreviewAmount] = React.useState('100.00');
  const [previewRecipient, setPreviewRecipient] = React.useState('GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ');
  const [previewMemo, setPreviewMemo] = React.useState('PayEasy Demo Transaction');
  const [demoMode, setDemoMode] = React.useState(false);
  
  // Network information
  const [midnightStatus, setMidnightStatus] = React.useState({ connected: false, chainInfo: '' });

  // Determine if using Polkadot network based on currency
  const usingMidnightNetwork = selectedCurrency === 'DOT'; // Variable name kept for compatibility with existing code

  // Function to check Midnight connection
  const checkMidnightConnection = React.useCallback(async () => {
    if (!isMounted.current) return;
    setIsRefreshing(true);
    try {
      const chainInfo = await MidnightService.getChainInfo();
      
      // Also check privacy capabilities
      try {
        if (!isMounted.current) return;
        const capabilities = await MidnightService.getPrivacyCapabilities();
        
        // Update capabilities if needed
        if (capabilities && isMounted.current) {
          setPrivacyOptions(prevOptions => ({
            ...prevOptions,
            zeroKnowledge: capabilities.zeroKnowledge || prevOptions.zeroKnowledge,
            protectMetadata: capabilities.metadataProtection || prevOptions.protectMetadata
          }));
        }
      } catch (err) {
        console.warn('Could not fetch privacy capabilities, using defaults', err);
      }
      
      if (!isMounted.current) return;
      setMidnightStatus({
        connected: true,
        chainInfo
      });
      console.log('Connected to Midnight chain:', chainInfo);
    } catch (error) {
      if (!isMounted.current) return;
      console.error('Failed to connect to Midnight:', error);
      setMidnightStatus({
        connected: false,
        chainInfo: ''
      });
    } finally {
      if (isMounted.current) {
        setIsRefreshing(false);
        setLastRefreshTime(new Date());
      }
    }
  }, []);

  // Set up auto-refresh on mount
  React.useEffect(() => {
    // Initial check
    checkMidnightConnection();

    // Set up auto-refresh interval
    if (autoRefreshEnabled) {
      refreshIntervalRef.current = setInterval(() => {
        // Only refresh if not already refreshing
        if (!isRefreshing && isMounted.current) {
          checkMidnightConnection();
        }
      }, 30000); // Refresh every 30 seconds
    }

    // Clean up interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefreshEnabled, checkMidnightConnection, isRefreshing]);

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    if (!isMounted.current) return;
    
    const newState = !autoRefreshEnabled;
    setAutoRefreshEnabled(newState);
    
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    // Set up new interval if enabled
    if (newState && isMounted.current) {
      refreshIntervalRef.current = setInterval(() => {
        if (!isRefreshing && isMounted.current) {
          checkMidnightConnection();
        }
      }, 30000);
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    if (!isRefreshing && isMounted.current) {
      checkMidnightConnection();
    }
  };

  // When currency changes, update privacy settings
  React.useEffect(() => {
    // Enable zero-knowledge proofs and metadata protection by default for DOT (Midnight)
    if (selectedCurrency === 'DOT') {
      setPrivacyOptions(prevOptions => ({
        ...prevOptions,
        zeroKnowledge: true,
        protectMetadata: true
      }));
    }
  }, [selectedCurrency]);

  // Update privacy score whenever options change
  React.useEffect(() => {
    const enabledOptions = Object.values(privacyOptions).filter(Boolean).length;
    const totalOptions = Object.keys(privacyOptions).length;
    const newScore = Math.round((enabledOptions / totalOptions) * 100);
    setPrivacyScore(newScore);
    
    // Update privacy description based on score
    if (newScore < 25) {
      setPrivacyScoreDescription('Basic Privacy');
      setPrivacyBadge('Standard');
    } else if (newScore < 50) {
      setPrivacyScoreDescription('Enhanced Privacy');
      setPrivacyBadge('Enhanced');
    } else if (newScore < 75) {
      setPrivacyScoreDescription('Advanced Privacy');
      setPrivacyBadge('Advanced');
    } else {
      setPrivacyScoreDescription('Maximum Privacy');
      setPrivacyBadge('Maximum');
    }
    
    // Update preview
    if (demoMode) {
      if (privacyOptions.hideAmount) {
        setPreviewAmount('***.**');
      } else {
        setPreviewAmount(amount || '100.00');
      }
      
      if (privacyOptions.obscureRecipient) {
        setPreviewRecipient('G***********************************************Z');
      } else {
        setPreviewRecipient(recipientAddress || 'GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ');
      }
      
      if (privacyOptions.protectMetadata) {
        setPreviewMemo('[Encrypted]');
      } else {
        setPreviewMemo(memo || 'PayEasy Demo Transaction');
      }
    }
  }, [privacyOptions, demoMode, amount, recipientAddress, memo]);

  // Handle privacy option toggle
  const handleToggleOption = (option) => {
    setPrivacyOptions({
      ...privacyOptions,
      [option]: !privacyOptions[option]
    });
  };

  // Function to calculate fiat equivalents
  const calculateFiatEquivalent = (value, currency, rates) => {
    if (!value || isNaN(value)) return { USD: '0.00', CAD: '0.00', INR: '0.00' };
    
    const parsedValue = parseFloat(value);
    
    return {
      USD: (parsedValue * rates[currency].USD).toFixed(2),
      CAD: (parsedValue * rates[currency].CAD).toFixed(2),
      INR: (parsedValue * rates[currency].INR).toFixed(2)
    };
  };
  
  // Function to get formatted fee amount
  const getNetworkFee = (currency, rates) => {
    if (currency === 'XLM') {
      const feeXLM = 0.00001;
      const feeUSD = (feeXLM * rates.XLM.USD).toFixed(3);
      return `<0.001 XLM ($${feeUSD})`;
    } else {
      const feeDOT = 0.01;
      const feeUSD = (feeDOT * rates.DOT.USD).toFixed(2);
      return `<0.01 DOT ($${feeUSD})`;
    }
  };

  // Function to fetch latest exchange rates
  const updateExchangeRates = React.useCallback(async () => {
    try {
      const rates = await MidnightService.getExchangeRates();
      if (!isMounted.current) return;
      
      if (rates) {
        setExchangeRates(rates);
        console.log('Updated exchange rates:', rates);
        
        // Recalculate equivalents if there's an amount
        if (amount && !isNaN(amount)) {
          const equivalents = calculateFiatEquivalent(amount, selectedCurrency, rates);
          setUsdEquivalent(equivalents.USD);
          setCadEquivalent(equivalents.CAD);
          setInrEquivalent(equivalents.INR);
        }
        
        // Update fee display
        setFeeAmount(getNetworkFee(selectedCurrency, rates));
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    }
  }, [amount, selectedCurrency]);
  
  // Update exchange rates when component mounts
  React.useEffect(() => {
    updateExchangeRates();
    
    // Set up interval to update rates every 30 seconds
    const ratesInterval = setInterval(updateExchangeRates, 30000);
    
    return () => clearInterval(ratesInterval);
  }, [updateExchangeRates]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isMounted.current) return;
    
    if (!recipientAddress) {
      setErrorText('Please enter a valid recipient address');
      setState('error');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setErrorText('Please enter a valid amount greater than 0');
      setState('error');
      return;
    }
    
    // Show loading state
    setState('loading');
    
    try {
      // Choose between Stellar and Polkadot networks based on currency
      if (usingMidnightNetwork) {
        // ---------------------------------------------
        // POLKADOT NETWORK TRANSACTION FLOW
        // ---------------------------------------------
        console.log("Processing Polkadot transaction...");
        
        try {
          // Check if PolkadotService is available in the global scope
          console.log("Checking for PolkadotService availability in window:", window.PolkadotService);
          console.log("Checking for PolkadotService availability in Services:", window.Services?.PolkadotService);
          
          // Try to access PolkadotService from either location
          const PolkadotSvc = window.PolkadotService || window.Services?.PolkadotService;
          
          if (!PolkadotSvc) {
            console.error("PolkadotService is not loaded. Make sure PolkadotService.js is correctly included in the HTML.");
            throw new Error("Polkadot service not available. Please try refreshing the page.");
          }
          
          console.log("PolkadotService found:", PolkadotSvc);
          console.log("PolkadotService connected state:", PolkadotSvc.connected);
          
          // First connect to the wallet if not already connected
          if (!PolkadotSvc.connected) {
            console.log("Attempting to connect to Polkadot wallet...");
            const walletConnection = await PolkadotSvc.connectWallet();
            console.log("Wallet connection result:", walletConnection);
            if (!walletConnection.success) {
              throw new Error(walletConnection.message || "Failed to connect to Polkadot wallet");
            }
          }
          
          // If no account is selected, select the first account (in a real app, show account selection UI)
          if (!PolkadotSvc.selectedAccount && PolkadotSvc.accounts.length > 0) {
            PolkadotSvc.selectAccount(PolkadotSvc.accounts[0]);
          }
          
          if (!PolkadotSvc.selectedAccount) {
            throw new Error("No Polkadot account selected");
          }
          
          // Check balance
          const balanceCheck = await PolkadotSvc.checkUSDCBalance(PolkadotSvc.selectedAccount.address);
          if (!balanceCheck.success || !balanceCheck.hasEnoughFunds) {
            throw new Error(balanceCheck.message || "Insufficient funds for this transaction");
          }
          
          // Execute transaction
          const result = await PolkadotSvc.sendUSDCTransaction(
            PolkadotSvc.selectedAccount,
            recipientAddress,
            parseFloat(amount)
          );
          
          // Check if component is still mounted before updating state
          if (!isMounted.current) return;
          
          // Check if transaction was successful
          if (result.success) {
            setState('success');
            setTxId(result.transactionHash);
            
            // Update privacy features to match what was actually used
            setPrivacyOptions({
              ...privacyOptions,
              zeroKnowledge: true,
              scamProtection: true
            });
          } else {
            setErrorText(`Transaction failed: ${result.message}`);
            setState('error');
          }
        } catch (polkadotError) {
          if (!isMounted.current) return;
          
          console.error('Polkadot transaction failed:', polkadotError);
          setErrorText(`Polkadot transaction failed: ${polkadotError.message}`);
          setState('error');
        }
      } else {
        // ---------------------------------------------
        // STELLAR NETWORK TRANSACTION FLOW
        // ---------------------------------------------
        console.log("Processing Stellar transaction...");
        
        try {
          // Use original Stellar implementation
          // Simulate network delay
          setTimeout(() => {
            // First check if component is still mounted
            if (!isMounted.current) return;
            
            // 90% chance of success
            if (Math.random() < 0.9) {
              setState('success');
              // Generate Stellar-specific transaction ID format that includes partial sender info
              const truncatedSender = senderAddress ? senderAddress.substring(0, 10) + '...' : '';
              const stellarTxId = 'TX-' + Math.random().toString(16).substring(2, 18) + 
                                 (truncatedSender ? '-' + truncatedSender : '');
              setTxId(stellarTxId);
              
              // In a real implementation, we would store the transaction details
              // including sender and recipient for display in the confirmation
              console.log(`Demo transaction: ${senderAddress || 'Unknown'} → ${recipientAddress}`);
            } else {
              setErrorText('Stellar transaction failed. Network error.');
              setState('error');
            }
          }, 2000);
        } catch (stellarError) {
          if (!isMounted.current) return;
          
          console.error('Stellar transaction failed:', stellarError);
          setErrorText(`Stellar transaction failed: ${stellarError.message}`);
          setState('error');
        }
      }
    } catch (error) {
      if (!isMounted.current) return;
      
      console.error('Transaction failed:', error);
      setErrorText(`Transaction failed: ${error.message}`);
      setState('error');
    }
  };
  
  const resetForm = () => {
    // Clear transaction state
    setState('form');
    setErrorText('');
    
    // Clear form inputs
    setRecipientAddress('');
    setSenderAddress('');
    setAmount('');
    setMemo('');
    
    // Reset transaction ID
    setTxId('');
    
    // Clear fiat equivalents
    setUsdEquivalent('0.00');
    setCadEquivalent('0.00');
    setInrEquivalent('0.00');
  };

  const toggleDemoMode = () => {
    setDemoMode(!demoMode);
  };

  const handleCurrencyChange = (currency) => {
    // Clear any previous transaction data when switching networks
    if (selectedCurrency !== currency) {
      setState('form');
      setTxId('');
      setErrorText('');
    }
    
    setSelectedCurrency(currency);
    // Currency change will trigger the useEffect to update fiat equivalents
  };

  // Handle amount change with fiat conversion
  const handleAmountChange = (e) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    
    // Calculate fiat equivalents
    if (newAmount && !isNaN(newAmount)) {
      const equivalents = calculateFiatEquivalent(newAmount, selectedCurrency, exchangeRates);
      setUsdEquivalent(equivalents.USD);
      setCadEquivalent(equivalents.CAD);
      setInrEquivalent(equivalents.INR);
    } else {
      setUsdEquivalent('0.00');
      setCadEquivalent('0.00');
      setInrEquivalent('0.00');
    }
  };
  
  // Update equivalents when currency changes
  React.useEffect(() => {
    // Update fee display
    setFeeAmount(getNetworkFee(selectedCurrency, exchangeRates));
    
    // Recalculate equivalents if there's an amount
    if (amount && !isNaN(amount)) {
      const equivalents = calculateFiatEquivalent(amount, selectedCurrency, exchangeRates);
      setUsdEquivalent(equivalents.USD);
      setCadEquivalent(equivalents.CAD);
      setInrEquivalent(equivalents.INR);
    }
  }, [selectedCurrency, amount, exchangeRates]);

  // Function to reset form and return to dashboard
  const returnToDashboard = () => {
    resetForm();
    history.push('/dashboard');
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 py-8">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Dashboard
            </Link>
            
            <h1 className="text-2xl font-bold text-white text-center">Send Payment</h1>
            
            <button
              className="text-white flex items-center"
              onClick={onLogout}
            >
              Logout
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* The rest of the payment form and states */}
        {state === 'form' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column - Payment form */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Send Payment</h2>
                <form onSubmit={handleSubmit}>
                  {/* Currency Selector */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">
                      Select Currency
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className={`flex items-center justify-center p-3 rounded-md border-2 ${
                          selectedCurrency === 'XLM' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-blue-400'
                        }`}
                        onClick={() => handleCurrencyChange('XLM')}
                        aria-pressed={selectedCurrency === 'XLM'}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <span className="text-blue-600 font-semibold">XLM</span>
                        </div>
                        <span className="font-medium">Stellar</span>
                      </button>
                      
                      <button
                        type="button"
                        className={`flex items-center justify-center p-3 rounded-md border-2 ${
                          selectedCurrency === 'DOT' 
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-300 hover:border-purple-400'
                        }`}
                        onClick={() => handleCurrencyChange('DOT')}
                        aria-pressed={selectedCurrency === 'DOT'}
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                          <span className="text-purple-600 font-semibold">DOT</span>
                        </div>
                        <span className="font-medium">Polkadot</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="recipient-address">
                      Recipient Address
                    </label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      id="recipient-address"
                      name="recipient-address"
                      placeholder={usingMidnightNetwork ? "5..." : "G..."}
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      autoComplete="off"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {usingMidnightNetwork 
                        ? "Example: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
                        : "Example: GDXDFWOBZTCD4PCNJZJ72GISISUUTPQX45PU44WDJMDEP3FQWMN7CCGL"}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="sender-address">
                      Sender Address
                    </label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      id="sender-address"
                      name="sender-address"
                      placeholder="G..."
                      value={senderAddress}
                      onChange={(e) => setSenderAddress(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="payment-amount">
                      Amount ({selectedCurrency})
                    </label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="number"
                      id="payment-amount"
                      name="payment-amount"
                      placeholder="1.0"
                      min="0.0000001"
                      step="0.0000001"
                      value={amount}
                      onChange={handleAmountChange}
                      autoComplete="transaction-amount"
                      required
                    />
                    <div className="text-sm text-gray-600 mt-1">
                      ≈ ${usdEquivalent} | CAD {cadEquivalent} | ₹{inrEquivalent}
                    </div>
                    <div className="text-green-600 text-sm mt-1 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                      Fee: {feeAmount}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="transaction-memo">
                      Memo {usingMidnightNetwork && "(Protected by default)"}
                    </label>
                    <input
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="text"
                      id="transaction-memo"
                      name="transaction-memo"
                      placeholder="Payment for coffee"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className={`w-full ${
                      usingMidnightNetwork 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-medium py-3 px-4 rounded-md transition duration-200`}
                  >
                    Send Payment
                  </button>
                </form>
              </div>
              
              {/* Right column - Privacy panel */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Transaction Privacy</h2>
                    <div>
                      <span className="text-gray-700 mr-2">Privacy Score:</span>
                      <span className={`${usingMidnightNetwork ? 'text-purple-600' : 'text-blue-600'} font-bold text-xl`}>
                        {privacyScore}%
                      </span>
                      <span className="text-gray-500 text-sm ml-2">{privacyScoreDescription}</span>
                    </div>
                  </div>
                  
                  {usingMidnightNetwork && (
                    <div className="mb-4 rounded-md bg-purple-50 p-3 border border-purple-200">
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mt-0.5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-purple-800">
                          DOT transactions on Midnight network provide enhanced privacy by default with zero-knowledge proofs.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Security Features Section */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Security Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="toggle-zero-knowledge" 
                          name="toggle-zero-knowledge"
                          className={`mr-2 h-4 w-4 ${usingMidnightNetwork ? 'text-purple-600' : 'text-blue-600'}`}
                          checked={privacyOptions.zeroKnowledge}
                          onChange={() => handleToggleOption('zeroKnowledge')}
                          disabled={!usingMidnightNetwork}
                          aria-describedby="zero-knowledge-desc"
                        />
                        <label htmlFor="toggle-zero-knowledge" className="text-gray-700">
                          Zero-Knowledge Proofs
                          {usingMidnightNetwork && (
                            <span className="ml-1 text-xs text-purple-600" id="zero-knowledge-desc">(Default)</span>
                          )}
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="toggle-scam-protection" 
                          name="toggle-scam-protection"
                          className={`mr-2 h-4 w-4 ${usingMidnightNetwork ? 'text-purple-600' : 'text-blue-600'}`}
                          checked={privacyOptions.scamProtection}
                          onChange={() => handleToggleOption('scamProtection')}
                        />
                        <label htmlFor="toggle-scam-protection" className="text-gray-700">Scam Protection</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="toggle-rate-limiting" 
                          name="toggle-rate-limiting"
                          className={`mr-2 h-4 w-4 ${usingMidnightNetwork ? 'text-purple-600' : 'text-blue-600'}`}
                          checked={privacyOptions.rateLimiting}
                          onChange={() => handleToggleOption('rateLimiting')}
                        />
                        <label htmlFor="toggle-rate-limiting" className="text-gray-700">Rate Limiting</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="toggle-encryption" 
                          name="toggle-encryption"
                          className={`mr-2 h-4 w-4 ${usingMidnightNetwork ? 'text-purple-600' : 'text-blue-600'}`}
                          checked={privacyOptions.encryption}
                          onChange={() => handleToggleOption('encryption')}
                        />
                        <label htmlFor="toggle-encryption" className="text-gray-700">Session Encryption</label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Privacy Options Section */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Transaction Privacy Options</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="toggle-hide-amount" 
                          name="toggle-hide-amount"
                          className={`mr-2 h-4 w-4 ${usingMidnightNetwork ? 'text-purple-600' : 'text-blue-600'}`}
                          checked={privacyOptions.hideAmount}
                          onChange={() => handleToggleOption('hideAmount')}
                        />
                        <label htmlFor="toggle-hide-amount" className="text-gray-700">Hide Amount</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="toggle-obscure-recipient" 
                          name="toggle-obscure-recipient"
                          className={`mr-2 h-4 w-4 ${usingMidnightNetwork ? 'text-purple-600' : 'text-blue-600'}`}
                          checked={privacyOptions.obscureRecipient}
                          onChange={() => handleToggleOption('obscureRecipient')}
                        />
                        <label htmlFor="toggle-obscure-recipient" className="text-gray-700">Obscure Recipient</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="toggle-prevent-tracking" 
                          name="toggle-prevent-tracking"
                          className={`mr-2 h-4 w-4 ${usingMidnightNetwork ? 'text-purple-600' : 'text-blue-600'}`}
                          checked={privacyOptions.preventTracking}
                          onChange={() => handleToggleOption('preventTracking')}
                        />
                        <label htmlFor="toggle-prevent-tracking" className="text-gray-700">Prevent Tracking</label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="toggle-metadata-protection" 
                          name="toggle-metadata-protection"
                          className={`mr-2 h-4 w-4 ${usingMidnightNetwork ? 'text-purple-600' : 'text-blue-600'}`}
                          checked={privacyOptions.protectMetadata}
                          onChange={() => handleToggleOption('protectMetadata')}
                          disabled={!usingMidnightNetwork}
                          aria-describedby="metadata-protection-desc"
                        />
                        <label htmlFor="toggle-metadata-protection" className="text-gray-700">
                          Protect Metadata
                          {usingMidnightNetwork && (
                            <span className="ml-1 text-xs text-purple-600" id="metadata-protection-desc">(Default)</span>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Transaction Preview */}
                  <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-md font-medium text-gray-700">Transaction Preview</h3>
                      <span className={`${
                        usingMidnightNetwork 
                          ? 'bg-purple-600' 
                          : (privacyBadge === 'Standard' ? 'bg-gray-600' : 
                             privacyBadge === 'Enhanced' ? 'bg-blue-600' : 
                             privacyBadge === 'Advanced' ? 'bg-purple-600' : 
                             'bg-green-600')
                      } text-white px-2 py-1 rounded text-sm`}>
                        {usingMidnightNetwork ? 'Midnight Enhanced' : privacyBadge}
                      </span>
                    </div>
                    <div className="flex flex-col space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-mono">{previewAmount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recipient:</span>
                        <span className="font-mono truncate max-w-[200px]">{previewRecipient}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Memo:</span>
                        <span className="font-mono">{usingMidnightNetwork ? '[Protected]' : previewMemo}</span>
                      </div>
                      {usingMidnightNetwork && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Zero-Knowledge:</span>
                          <span className="font-mono text-green-600">Enabled</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Demo Mode Button */}
                  <div className="mt-4 flex justify-end">
                    <button 
                      className={`${demoMode ? 'bg-gray-600' : (usingMidnightNetwork ? 'bg-purple-600' : 'bg-blue-600')} hover:bg-opacity-90 text-white px-4 py-2 rounded-md text-sm flex items-center`}
                      onClick={toggleDemoMode}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      {demoMode ? 'Exit Demo Mode' : 'Demo Mode'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {state === 'loading' && (
          <div className="py-8 text-center">
            <div className={`inline-block w-12 h-12 border-4 ${
              usingMidnightNetwork 
                ? 'border-purple-200 border-t-purple-600' 
                : 'border-blue-200 border-t-blue-600'
            } rounded-full animate-spin mb-4`}></div>
            <p className="text-gray-700 text-lg">
              Processing your payment on {usingMidnightNetwork ? 'Midnight' : 'Stellar'} network
              {usingMidnightNetwork && (
                <span> with {privacyScore}% privacy protection</span>
              )}
              ...
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {usingMidnightNetwork 
                ? 'Securing your transaction with zero-knowledge proofs' 
                : 'Creating your transaction on the Stellar network'}
            </p>
          </div>
        )}
        
        {state === 'success' && (
          <div className="py-6 text-center">
            <div className={`${usingMidnightNetwork ? 'bg-purple-100' : 'bg-green-100'} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${usingMidnightNetwork ? 'text-purple-500' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold ${usingMidnightNetwork ? 'text-purple-700' : 'text-green-700'} mb-2`}>Payment Successful!</h3>
            <p className="text-gray-600 mb-1">
              Network: <span className="font-semibold">{usingMidnightNetwork ? 'Polkadot Assethub' : 'Stellar Testnet'}</span>
            </p>
            <p className="text-gray-600 mb-1">
              Token: <span className="font-semibold">{usingMidnightNetwork ? 'USDC on Assethub' : 'XLM'}</span>
            </p>
            <p className="text-gray-600 mb-1">
              Privacy Level: <span className="font-semibold">{usingMidnightNetwork ? 'Polkadot Enhanced' : privacyScoreDescription}</span>
            </p>
            
            {/* Show transaction participants */}
            {!usingMidnightNetwork && senderAddress && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 my-3 text-left">
                <p className="text-gray-700 text-sm mb-1">
                  <span className="font-semibold">From:</span> {senderAddress}
                </p>
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">To:</span> {recipientAddress}
                </p>
              </div>
            )}
            
            <p className="text-gray-600 mb-2">Transaction ID:</p>
            <p className="bg-gray-100 p-2 rounded font-mono text-sm break-all mb-4">{txId}</p>
            
            {/* Show the appropriate explorer link based on the network */}
            {usingMidnightNetwork ? (
              <a
                href="https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fassethub-kusama-rpc.polkadot.io#/explorer" 
                className="text-purple-600 hover:text-purple-800 font-medium flex items-center justify-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Polkadot Explorer
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <a
                href="https://stellar.expert/explorer/testnet" 
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Stellar Expert
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            
            <button
              onClick={returnToDashboard}
              className={`mt-6 ${usingMidnightNetwork ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-md transition duration-200`}
            >
              Return to Dashboard
            </button>
          </div>
        )}
        
        {state === 'error' && (
          <div className="py-6 text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-red-700 mb-2">Payment Failed</h3>
            <p className="text-gray-700 mb-4">{errorText}</p>
            <button
              onClick={resetForm}
              className={`${usingMidnightNetwork ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-2 px-4 rounded-md transition duration-200`}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Update the LoginScreen component to prevent state updates after unmounting
const LoginScreen = ({ onLogin }) => {
  const [loginAddress, setLoginAddress] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const isMounted = React.useRef(true);
  
  // Set up cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const handleLoginSubmit = async () => {
    setIsLoading(true);
    setError('');
    
    // Validate address format
    const validationResult = ValidationService.validateStellarAddress(loginAddress);
    if (!validationResult.isValid) {
      if (isMounted.current) {
        setError(validationResult.message);
        setIsLoading(false);
      }
      return;
    }
    
    try {
      const success = await onLogin(loginAddress);
      if (!isMounted.current) return;
      
      if (!success) {
        setError('Authentication failed. Please check your address and try again.');
      }
    } catch (err) {
      if (isMounted.current) {
        setError('An error occurred during login.');
        console.error('Login error:', err);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 py-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <div className="mb-3 flex justify-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-blue-600 text-2xl font-bold">💸</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">PayEasy</h1>
          <p className="text-blue-100 mt-2">Fast, secure, and private payments on Stellar & Midnight</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold mb-6 text-center">Welcome to PayEasy</h2>
          <p className="text-sm text-gray-600 mb-6 text-center">
            Experience next-generation payments with enhanced privacy and security
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-md" role="alert">
              {error}
            </div>
          )}
          
          <form onSubmit={(e) => { e.preventDefault(); handleLoginSubmit(); }}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="stellar-address">
                Stellar Public Key
              </label>
              <input
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                id="stellar-address"
                name="stellar-address"
                placeholder="G..."
                value={loginAddress}
                onChange={(e) => setLoginAddress(e.target.value)}
                autoComplete="off"
                aria-required="true"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: GDXDFWOBZTCD4PCNJZJ72GISISUUTPQX45PU44WDJMDEP3FQWMN7CCGL
              </p>
            </div>
            
            <button
              type="submit"
              className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-3 px-4 rounded-md mt-4 flex justify-center items-center transition duration-200`}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true"></div>
                  Logging in...
                </>
              ) : (
                'Login Securely'
              )}
            </button>
          </form>
          
          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="bg-purple-50 rounded-lg border border-purple-100 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-purple-800">
                    Enhanced privacy with Midnight's zero-knowledge proofs
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg border border-green-100 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    Fast, secure transactions with near-zero fees
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t">
          <p className="text-gray-600 text-sm">Built for Stellar Consensus Hackathon 2025</p>
          <p className="text-gray-500 text-xs mt-1">Runs on Stellar Testnet & Midnight</p>
        </div>
      </div>
    </div>
  );
};

// Update the Dashboard component to accept currentUser and onLogout props
const Dashboard = ({ currentUser, onLogout }) => {
  const history = useHistory();
  
  // Add mounted ref to prevent state updates after unmounting
  const isMounted = React.useRef(true);
  
  // Auto-refresh state
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = React.useState(true);
  const [lastRefreshTime, setLastRefreshTime] = React.useState(new Date());
  const refreshIntervalRef = React.useRef(null);
  
  // Exchange rates
  const [exchangeRates, setExchangeRates] = React.useState({
    XLM: { USD: 0.15, CAD: 0.20, INR: 12.5 },
    DOT: { USD: 6.50, CAD: 8.75, INR: 725 }
  });
  
  // Network information
  const [midnightStatus, setMidnightStatus] = React.useState({ connected: false, chainInfo: '' });
  
  // Set up cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Check Midnight connection status
  const checkMidnightConnection = React.useCallback(async () => {
    if (!isMounted.current) return;
    setIsRefreshing(true);
    try {
      const chainInfo = await MidnightService.getChainInfo();
      
      if (!isMounted.current) return;
      setMidnightStatus({
        connected: true,
        chainInfo
      });
      console.log('Connected to Midnight chain:', chainInfo);
    } catch (error) {
      if (!isMounted.current) return;
      console.error('Failed to connect to Midnight:', error);
      setMidnightStatus({
        connected: false,
        chainInfo: ''
      });
    } finally {
      if (isMounted.current) {
        setIsRefreshing(false);
        setLastRefreshTime(new Date());
      }
    }
  }, []);

  // Set up auto-refresh on mount
  React.useEffect(() => {
    // Initial check
    checkMidnightConnection();
    
    // Set up auto-refresh interval
    if (autoRefreshEnabled) {
      refreshIntervalRef.current = setInterval(() => {
        // Only refresh if not already refreshing
        if (!isRefreshing && isMounted.current) {
          checkMidnightConnection();
        }
      }, 30000); // Refresh every 30 seconds
    }
    
    // Initialize exchange rates
    const initRates = async () => {
      try {
        // Make sure component is still mounted before continuing
        if (!isMounted.current) return;
        
        const rates = await ExchangeService.getCurrentRates();
        if (isMounted.current) {
          setExchangeRates(rates);
        }
      } catch (error) {
        if (isMounted.current) {
          console.error("Error initializing exchange rates:", error);
        }
      }
    };
    
    initRates();
    
    // Clean up interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [autoRefreshEnabled, checkMidnightConnection, isRefreshing]);

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    if (!isMounted.current) return;
    
    const newState = !autoRefreshEnabled;
    setAutoRefreshEnabled(newState);
    
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    // Set up new interval if enabled
    if (newState && isMounted.current) {
      refreshIntervalRef.current = setInterval(() => {
        if (!isRefreshing && isMounted.current) {
          checkMidnightConnection();
        }
      }, 30000);
    }
  };

  // Manual refresh function
  const handleManualRefresh = () => {
    if (!isRefreshing && isMounted.current) {
      checkMidnightConnection();
    }
  };
  
  // Navigate to payment screen
  const goToPayment = () => {
    // Cancel any pending operations or updates
    isMounted.current = false;
    
    // Clear any existing intervals
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    
    // Navigate to payment screen
    history.push('/payment');
  };
  
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 py-8">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6 text-center">
          <div className="flex justify-between items-center">
            <div className="flex-1 flex justify-start">
              <button 
                className="text-white text-xs flex items-center bg-opacity-30 bg-white px-2 py-1 rounded"
                onClick={toggleAutoRefresh}
              >
                <span className={`w-3 h-3 rounded-full mr-1 ${autoRefreshEnabled ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                Auto-refresh
              </button>
            </div>
            
            <h1 className="text-3xl font-bold text-white flex-2">PayEasy</h1>
            
            <div className="flex-1 flex justify-end">
              <button 
                className="text-white flex items-center"
                onClick={onLogout}
              >
                Logout
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <p className="text-blue-100 mt-1">Welcome back, {currentUser?.displayName || 'User'}</p>
          
          <p className="text-xs text-blue-200 mt-1">
            Last updated: {lastRefreshTime.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Wallet Balance */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Wallet Balance</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <span className="text-blue-600 font-semibold">XLM</span>
                    </div>
                    <span>Stellar Lumens</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{currentUser?.walletBalances?.XLM || '0.00'} XLM</div>
                    <div className="text-sm text-gray-500">
                      ~${((parseFloat(currentUser?.walletBalances?.XLM || 0) * exchangeRates.XLM.USD)).toFixed(2)} USD
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                      <span className="text-purple-600 font-semibold">DOT</span>
                    </div>
                    <span>Polkadot</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{currentUser?.walletBalances?.DOT || '0.00'} DOT</div>
                    <div className="text-sm text-gray-500">
                      ~${((parseFloat(currentUser?.walletBalances?.DOT || 0) * exchangeRates.DOT.USD)).toFixed(2)} USD
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  onClick={goToPayment}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 px-4 rounded-md"
                >
                  Send Payment
                </button>
              </div>
            </div>
            
            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h2>
              {currentUser?.recentTransactions?.length > 0 ? (
                <div className="space-y-3">
                  {currentUser.recentTransactions.map((tx, index) => (
                    <div key={tx.id} className={`p-3 rounded-lg border ${tx.type === 'sent' ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{tx.type === 'sent' ? 'Sent' : 'Received'} {tx.amount} {tx.currency}</div>
                          <div className="text-sm text-gray-600">
                            {tx.type === 'sent' ? 'To: ' : 'From: '}
                            <span className="font-mono text-xs">
                              {tx.counterparty.substring(0, 8)}...{tx.counterparty.substring(tx.counterparty.length - 4)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${tx.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}>
                            {tx.type === 'sent' ? '-' : '+'}{tx.amount}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-6">
                  No transactions yet
                </div>
              )}
            </div>
          </div>
          
          {/* Network Status */}
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Network Status</h2>
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={handleManualRefresh}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-blue-100 bg-blue-50 rounded p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <h3 className="font-medium text-blue-800">Stellar Network</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    Stellar Testnet is operational
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Exchange rate: 1 XLM = ${exchangeRates.XLM.USD.toFixed(2)} USD
                  </p>
                </div>
                
                <div className={`border rounded p-4 ${midnightStatus.connected ? 'border-purple-100 bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-2 ${midnightStatus.connected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <h3 className={`font-medium ${midnightStatus.connected ? 'text-purple-800' : 'text-gray-700'}`}>Midnight Network</h3>
                  </div>
                  <p className={`text-sm ${midnightStatus.connected ? 'text-purple-700' : 'text-gray-600'}`}>
                    {midnightStatus.connected 
                      ? 'Midnight Testnet is operational'
                      : 'Connecting to Midnight Testnet...'}
                  </p>
                  <p className={`text-xs mt-1 ${midnightStatus.connected ? 'text-purple-600' : 'text-gray-500'}`}>
                    {midnightStatus.connected 
                      ? `Exchange rate: 1 DOT = $${exchangeRates.DOT.USD.toFixed(2)} USD`
                      : 'Refresh to check connection status'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rate Comparison */}
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                PayEasy vs Traditional Services
              </h2>
              
              <div className="overflow-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium text-gray-600">Service</th>
                      <th className="py-2 text-right font-medium text-gray-600">Fee for $100</th>
                      <th className="py-2 text-right font-medium text-gray-600">Exchange Rate</th>
                      <th className="py-2 text-right font-medium text-gray-600">Delivery Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b bg-blue-50">
                      <td className="py-3 text-blue-800 font-medium">PayEasy (Stellar)</td>
                      <td className="py-3 text-right text-blue-800">$0.01</td>
                      <td className="py-3 text-right text-blue-800">Market Rate</td>
                      <td className="py-3 text-right text-blue-800">Instant</td>
                    </tr>
                    <tr className="border-b bg-purple-50">
                      <td className="py-3 text-purple-800 font-medium">PayEasy (Midnight)</td>
                      <td className="py-3 text-right text-purple-800">$0.07</td>
                      <td className="py-3 text-right text-purple-800">Market Rate + Privacy</td>
                      <td className="py-3 text-right text-purple-800">1-2 minutes</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 text-gray-700">Traditional Bank</td>
                      <td className="py-3 text-right text-gray-700">$25-45</td>
                      <td className="py-3 text-right text-gray-700">Bank Rate (~2% margin)</td>
                      <td className="py-3 text-right text-gray-700">2-5 business days</td>
                    </tr>
                    <tr>
                      <td className="py-3 text-gray-700">Money Transfer Service</td>
                      <td className="py-3 text-right text-gray-700">$3.99-7.99</td>
                      <td className="py-3 text-right text-gray-700">Custom Rate (~1.5% margin)</td>
                      <td className="py-3 text-right text-gray-700">Minutes to hours</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                * PayEasy fees are network fees only, actual cost may vary slightly
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t">
          <p className="text-gray-600 text-sm">Built for Stellar Consensus & Midnight Hackathon 2025</p>
          <p className="text-gray-500 text-xs mt-1">
            This app runs on Stellar Testnet and Midnight Testnet-02 with enhanced privacy features
          </p>
        </div>
      </div>
    </div>
  );
};

// The original PayEasyPhase2 component now becomes the main export
const PayEasyPhase2 = () => {
  try {
    console.log("Inside PayEasyPhase2 component");
    
    // Directly render the full app instead of showing a loading screen
    return (
      <ErrorBoundary>
        <PayEasyApp />
      </ErrorBoundary>
    );
  } catch (err) {
    console.error("Error in PayEasyPhase2:", err);
    return <div className="p-6 bg-red-100 text-red-700 rounded" role="alert">Error loading app: {err.message}</div>;
  }
};

// Make PayEasyPhase2 globally available
window.PayEasyPhase2 = PayEasyPhase2;

// Make components globally available for diagnostics
window.ErrorBoundary = ErrorBoundary;
window.PayEasyApp = PayEasyApp;
window.PaymentScreen = PaymentScreen;
window.LoginScreen = LoginScreen;
window.Dashboard = Dashboard;

// Render the PayEasyPhase2 component to the DOM
ReactDOM.render(
  <PayEasyPhase2 />,
  document.getElementById('root')
); 