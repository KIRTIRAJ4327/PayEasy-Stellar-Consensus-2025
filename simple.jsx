// Simple version of PayEasy app for debugging
// This version avoids dependencies on HashRouter and other components

// Simple error boundary component
class SimpleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Error caught by SimpleErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          border: '1px solid red', 
          borderRadius: '5px',
          background: '#fff1f0' 
        }}>
          <h3 style={{ color: 'red' }}>Something went wrong</h3>
          <p>{this.state.error?.message || 'An error occurred'}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              background: '#ff4d4f', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple Login component
const SimpleLogin = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>PayEasy Login</h2>
      <p>Simple login screen works!</p>
      <input 
        type="text" 
        placeholder="Stellar Address"
        style={{ 
          width: '100%', 
          padding: '10px', 
          margin: '10px 0', 
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
      <button
        style={{ 
          background: '#1890ff',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Login
      </button>
    </div>
  );
};

// Simple version of PayEasy app
const SimplePayEasy = () => {
  // Use a basic state instead of router
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  
  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '0 auto', 
      background: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div style={{ 
        background: '#1890ff', 
        color: 'white', 
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1>PayEasy</h1>
        <p>Simple version for testing</p>
      </div>
      
      <SimpleLogin />
      
      <div style={{ padding: '20px', textAlign: 'center', borderTop: '1px solid #eee' }}>
        <p style={{ fontSize: '12px', color: '#888' }}>
          Stellar Testnet & Polkadot Assethub Test App
        </p>
      </div>
    </div>
  );
};

// Export the simple app for testing
window.SimplePayEasy = SimplePayEasy; 