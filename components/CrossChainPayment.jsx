// CrossChainPayment.jsx - A React component for demonstrating cross-chain payments

function CrossChainPayment({ user }) {
  const [amount, setAmount] = React.useState('');
  const [recipient, setRecipient] = React.useState('');
  const [memo, setMemo] = React.useState('');
  const [currency, setCurrency] = React.useState('XLM');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(null);
  const [txStep, setTxStep] = React.useState(0);
  
  // Initialize services
  const stellarPayment = React.useMemo(() => new window.StellarPaymentContract(), []);
  const polkadotPayment = React.useMemo(() => new window.PolkadotPaymentHandler(), []);
  const launchtube = React.useMemo(() => new window.LaunchtubeService(), []);
  
  // Validate form
  const validateForm = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return false;
    }
    
    if (!recipient) {
      setError('Please enter a recipient address');
      return false;
    }
    
    // Validate recipient based on currency
    if (currency === 'XLM' && !recipient.startsWith('G')) {
      setError('Invalid Stellar address. Stellar addresses start with G');
      return false;
    } else if (currency === 'DOT' && !recipient.match(/^[15]/)) {
      setError('Invalid Polkadot address. Polkadot addresses typically start with 1 or 5');
      return false;
    }
    
    setError('');
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setSuccess(null);
    setTxStep(0);
    
    try {
      // Choose the correct payment flow based on currency
      if (currency === 'XLM') {
        await processXlmPayment();
      } else {
        await processDotPayment();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An unexpected error occurred');
      setIsLoading(false);
    }
  };
  
  // Process XLM payment
  const processXlmPayment = async () => {
    // Step 1: Create transaction
    setTxStep(1);
    await simulateDelay(1000);
    
    // Step 2: Request passkey signature
    setTxStep(2);
    await simulateDelay(1500);
    
    // Step 3: Sponsor gas fees with Launchtube
    setTxStep(3);
    const sponsorResult = await launchtube.initialize();
    if (!sponsorResult.success) {
      throw new Error(sponsorResult.error || 'Failed to initialize Launchtube');
    }
    await simulateDelay(1000);
    
    // Step 4: Submit transaction
    setTxStep(4);
    const txResult = {
      success: true,
      txHash: generateRandomHash(),
      ledger: Math.floor(Math.random() * 1000000) + 40000000
    };
    await simulateDelay(1500);
    
    // Complete
    setSuccess({
      currency: 'XLM',
      amount: parseFloat(amount),
      recipient,
      memo,
      txHash: txResult.txHash,
      ledger: txResult.ledger,
      timestamp: new Date().toISOString()
    });
    setIsLoading(false);
  };
  
  // Process DOT payment
  const processDotPayment = async () => {
    // Step 1: Connect to Polkadot network
    setTxStep(1);
    const connectResult = await polkadotPayment.connect();
    if (!connectResult.success) {
      throw new Error(connectResult.error || 'Failed to connect to Polkadot network');
    }
    await simulateDelay(1000);
    
    // Step 2: Request passkey signature
    setTxStep(2);
    await simulateDelay(1500);
    
    // Step 3: Prepare transaction
    setTxStep(3);
    await simulateDelay(1000);
    
    // Step 4: Submit transaction
    setTxStep(4);
    const txResult = {
      success: true,
      txHash: generateRandomHash(),
      blockHash: generateRandomHash()
    };
    await simulateDelay(1500);
    
    // Complete
    setSuccess({
      currency: 'DOT',
      amount: parseFloat(amount),
      recipient,
      memo,
      txHash: txResult.txHash,
      blockHash: txResult.blockHash,
      timestamp: new Date().toISOString()
    });
    setIsLoading(false);
  };
  
  // Helper functions
  const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const generateRandomHash = () => Array.from(Array(64), () => Math.floor(Math.random() * 16).toString(16)).join('');

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Send Payment
      </h2>
      
      {!success ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Currency</label>
            <div className="flex space-x-4">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-md border ${currency === 'XLM' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setCurrency('XLM')}
              >
                Stellar (XLM)
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-md border ${currency === 'DOT' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setCurrency('DOT')}
              >
                Polkadot (DOT)
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Amount</label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter amount in ${currency}`}
                required
              />
              <span className="absolute right-3 top-2 text-gray-500">
                {currency}
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Recipient Address</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={currency === 'XLM' ? 'G...' : '1... or 5...'}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Memo (Optional)</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a note to your payment"
              maxLength={28}
            />
          </div>
          
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
              `Send ${currency}`
            )}
          </button>
          
          {isLoading && (
            <div className="mt-4 mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${(txStep / 4) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {txStep === 1 && 'Preparing transaction...'}
                {txStep === 2 && 'Requesting passkey signature...'}
                {txStep === 3 && currency === 'XLM' ? 'Sponsoring gas fees with Launchtube...' : 'Preparing transaction...'}
                {txStep === 4 && 'Submitting transaction...'}
              </p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-2 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}
        </form>
      ) : (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <h3 className="font-bold text-green-800 text-center text-xl mb-4">Payment Successful!</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{success.amount} {success.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Recipient:</span>
              <span className="font-medium truncate max-w-[200px]">{success.recipient}</span>
            </div>
            {success.memo && (
              <div className="flex justify-between">
                <span className="text-gray-600">Memo:</span>
                <span className="font-medium">{success.memo}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction Hash:</span>
              <span className="font-medium truncate max-w-[200px]">{success.txHash}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">
                {success.currency === 'XLM' ? 'Ledger:' : 'Block Hash:'}
              </span>
              <span className="font-medium">
                {success.currency === 'XLM' ? success.ledger : success.blockHash.substring(0, 10) + '...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{new Date(success.timestamp).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">
              {success.currency === 'XLM' 
                ? 'Gas fees sponsored by Launchtube' 
                : 'Transaction confirmed on Polkadot Hub'}
            </span>
          </div>
          
          <button 
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            onClick={() => {
              setSuccess(null);
              setAmount('');
              setRecipient('');
              setMemo('');
            }}
          >
            Send Another Payment
          </button>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p className="font-semibold">Benefits of {currency === 'XLM' ? 'Stellar' : 'Polkadot'} payments:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {currency === 'XLM' ? (
            <>
              <li>No gas fees (sponsored by Launchtube)</li>
              <li>Transactions settle in 3-5 seconds</li>
              <li>Secure authentication with passkeys</li>
              <li>Simple memo field for payment descriptions</li>
            </>
          ) : (
            <>
              <li>Cross-chain interoperability</li>
              <li>Smart contract functionality</li>
              <li>Secure authentication with passkeys</li>
              <li>Transaction history stored on Polkadot Hub</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

// Export the component
export default CrossChainPayment; 