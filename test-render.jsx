// Simple test component
const TestComponent = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>React Test Component</h1>
      <p>If you can see this, React is working correctly!</p>
      <button 
        style={{ 
          backgroundColor: 'blue', 
          color: 'white', 
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        onClick={() => alert('Button clicked!')}
      >
        Test Button
      </button>
    </div>
  );
}; 