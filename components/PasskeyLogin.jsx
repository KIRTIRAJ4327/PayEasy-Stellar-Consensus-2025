// PasskeyLogin.jsx - A React component for Passkey authentication

function PasskeyLogin({ onLogin }) {
  const [username, setUsername] = React.useState('');
  const [isRegistering, setIsRegistering] = React.useState(true);
  const [status, setStatus] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [wallet, setWallet] = React.useState(null);
  
  const passkeyAuth = React.useMemo(() => new PasskeyAuth(), []);
  
  React.useEffect(() => {
    // Check if passkeys are supported
    const isSupported = passkeyAuth.checkAvailability();
    if (!isSupported) {
      setError('Your browser does not support passkeys. Please use a modern browser.');
    }
  }, [passkeyAuth]);
  
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username) {
      setError('Please enter a username');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setStatus('Creating your passkey...');
    
    try {
      const result = await passkeyAuth.registerUser(username);
      
      if (result.success) {
        setStatus('Passkey created successfully!');
        
        // Create a Stellar smart wallet
        setStatus('Creating your Stellar wallet...');
        const walletResult = await passkeyAuth.createStellarSmartWallet();
        
        if (walletResult.success) {
          setWallet(walletResult);
          setStatus('Wallet created successfully!');
          
          // Notify parent component
          if (onLogin) {
            onLogin({
              authenticated: true,
              username: walletResult.username,
              stellarAddress: walletResult.stellarAddress
            });
          }
        } else {
          setError(walletResult.error || 'Failed to create wallet');
        }
      } else {
        setError(result.error || 'Failed to create passkey');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    setStatus('Authenticating...');
    
    try {
      const result = await passkeyAuth.authenticateUser();
      
      if (result.success) {
        setStatus('Authentication successful!');
        
        // In a real app, you would get the user's wallet info from a server
        // For demo purposes, we'll simulate this
        setStatus('Retrieving your wallet...');
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockWallet = {
          success: true,
          stellarAddress: 'G...SIMULATED_ADDRESS_FOR_DEMO...',
          username: 'Demo User'
        };
        
        setWallet(mockWallet);
        setStatus('Welcome back!');
        
        // Notify parent component
        if (onLogin) {
          onLogin({
            authenticated: true,
            username: mockWallet.username,
            stellarAddress: mockWallet.stellarAddress
          });
        }
      } else {
        setError(result.error || 'Failed to authenticate');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isRegistering ? 'Create Account' : 'Login with Passkey'}
      </h2>
      
      {wallet ? (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-bold text-green-800">Wallet Created!</h3>
          <p className="text-green-700">Welcome, {wallet.username}</p>
          <p className="text-sm text-gray-600 mt-2 break-all">
            Your Stellar address: {wallet.stellarAddress}
          </p>
          <button 
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            onClick={() => setWallet(null)}
          >
            Continue
          </button>
        </div>
      ) : (
        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          {isRegistering && (
            <div className="mb-4">
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your username"
                required
              />
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 mb-4 flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <span>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              isRegistering ? 'Register with Passkey' : 'Login with Passkey'
            )}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              className="text-blue-500 hover:underline"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering 
                ? 'Already have an account? Login' 
                : 'Need an account? Register'}
            </button>
          </div>
          
          {status && (
            <div className="mt-4 p-2 bg-blue-50 text-blue-700 rounded">
              {status}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-2 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-600">
            <p>
              <strong>What are passkeys?</strong> Passkeys let you use your
              device's biometrics (like fingerprint or face recognition) 
              instead of passwords.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

// Export the component
export default PasskeyLogin; 