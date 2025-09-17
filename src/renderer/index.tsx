import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.scss';
import './styles/App.scss';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('Renderer error boundary caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
          <h2>Something went wrong.</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#eee', padding: 12 }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log('🔥 React index.tsx is loading!');
console.log('🔍 Looking for root element:', document.getElementById('root'));

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="background: red; color: white; padding: 20px; font-size: 24px;">ERROR: Root element not found!</div>';
} else {
  console.log('✅ Root element found, creating React root...');
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('✅ React root created, rendering App...');
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('✅ App rendered successfully!');
  } catch (error) {
    console.error('❌ Error creating/rendering React app:', error);
    document.body.innerHTML = `<div style="background: red; color: white; padding: 20px; font-size: 18px;">ERROR: ${error}</div>`;
  }
}