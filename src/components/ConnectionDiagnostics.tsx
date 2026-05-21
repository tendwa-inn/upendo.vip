import React, { useState, useEffect } from 'react';
import { checkSupabaseHealth, testTableAccess } from '../lib/supabaseHealth';

interface ConnectionDiagnosticsProps {
  onClose?: () => void;
}

export const ConnectionDiagnostics: React.FC<ConnectionDiagnosticsProps> = ({ onClose }) => {
  const [results, setResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    
    const newResults = [];
    
    try {
      // Test 1: Basic connection health
      newResults.push({
        test: 'Basic Connection Health',
        result: 'Running...',
        status: 'info'
      });
      setResults([...newResults]);
      
      const health = await checkSupabaseHealth();
      newResults[newResults.length - 1] = {
        test: 'Basic Connection Health',
        result: health.healthy ? `Connected (${health.responseTime}ms)` : `Failed: ${health.error?.message}`,
        status: health.healthy ? 'success' : 'error',
        details: health.error
      };
      setResults([...newResults]);
      
      if (!health.healthy) {
        setIsRunning(false);
        return;
      }
      
      // Test 2: App settings table access
      newResults.push({
        test: 'App Settings Table Access',
        result: 'Running...',
        status: 'info'
      });
      setResults([...newResults]);
      
      const tableAccess = await testTableAccess('app_settings');
      newResults[newResults.length - 1] = {
        test: 'App Settings Table Access',
        result: tableAccess.healthy ? `Access successful (${tableAccess.responseTime}ms)` : `Failed: ${tableAccess.error?.message}`,
        status: tableAccess.healthy ? 'success' : 'error',
        details: tableAccess.error
      };
      setResults([...newResults]);
      
      // Test 3: Profiles table access
      newResults.push({
        test: 'Profiles Table Access',
        result: 'Running...',
        status: 'info'
      });
      setResults([...newResults]);
      
      const profilesAccess = await testTableAccess('profiles');
      newResults[newResults.length - 1] = {
        test: 'Profiles Table Access',
        result: profilesAccess.healthy ? `Access successful (${profilesAccess.responseTime}ms)` : `Failed: ${profilesAccess.error?.message}`,
        status: profilesAccess.healthy ? 'success' : 'error',
        details: profilesAccess.error
      };
      setResults([...newResults]);
      
    } catch (error) {
      newResults.push({
        test: 'Diagnostics Error',
        result: `Unexpected error: ${error}`,
        status: 'error',
        details: error
      });
      setResults([...newResults]);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <h3>Connection Diagnostics</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: isRunning ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? 'Running Tests...' : 'Run Diagnostics'}
        </button>
        
        {onClose && (
          <button 
            onClick={onClose}
            style={{ 
              marginLeft: '10px',
              padding: '8px 16px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        )}
      </div>
      
      <div>
        {results.map((result, index) => (
          <div key={index} style={{ 
            padding: '10px', 
            marginBottom: '10px', 
            backgroundColor: 'white', 
            borderRadius: '4px',
            borderLeft: `4px solid ${
              result.status === 'success' ? '#28a745' : 
              result.status === 'error' ? '#dc3545' : '#ffc107'
            }`
          }}>
            <strong>{result.test}:</strong> {result.result}
            {result.details && (
              <details style={{ marginTop: '10px' }}>
                <summary>Details</summary>
                <pre style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
        
        {results.length === 0 && !isRunning && (
          <p>No tests run yet. Click "Run Diagnostics" to start.</p>
        )}
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <h4>Troubleshooting Tips:</h4>
        <ul>
          <li>Check your internet connection</li>
          <li>Verify Supabase URL and API key in environment variables</li>
          <li>Check browser console for detailed error messages</li>
          <li>Ensure CORS is properly configured in Supabase dashboard</li>
          <li>Verify that the app_settings table exists and has proper RLS policies</li>
        </ul>
      </div>
    </div>
  );
};