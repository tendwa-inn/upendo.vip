import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Filter out external script errors (browser extensions, analytics, etc.)
    const errorMessage = error?.message || '';
    const stackTrace = errorInfo?.componentStack || '';
    
    // Common external script error patterns to ignore
    const externalErrorPatterns = [
      'addListener',
      'chrome',
      'extension',
      'browser.runtime',
      'content-script',
      'web-accessible',
      'undefined is not an object'
    ];
    
    const isExternalError = externalErrorPatterns.some(pattern => 
      errorMessage.includes(pattern) || stackTrace.includes(pattern)
    );
    
    if (isExternalError) {
      console.warn('External script error (likely browser extension):', errorMessage);
      // Don't treat external script errors as critical
      return;
    }
    
    console.error("App error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || '';
      
      // Check if it's an external script error
      const isExternalError = errorMessage.includes('addListener') || 
                             errorMessage.includes('chrome') ||
                             errorMessage.includes('extension');
      
      if (isExternalError) {
        // Silently recover from external script errors
        return this.props.children;
      }
      
      // Show proper error UI for actual app errors
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Oops! Something went wrong</h2>
          <p>We're working on fixing this issue.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 20px', 
              marginTop: '10px',
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

export default ErrorBoundary;
