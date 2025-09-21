'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function GoogleAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          return;
        }

        // Exchange code for tokens
        const response = await fetch('/api/google-sheets/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage('Successfully connected to Google Sheets!');
          
          // Store tokens in localStorage
          localStorage.setItem('google_sheets_tokens', JSON.stringify(data.tokens));
          
          // Redirect back to data sources page
          setTimeout(() => {
            router.push('/data-sources');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to authenticate with Google Sheets');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred during authentication');
        console.error('Auth callback error:', error);
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Google Sheets Authentication</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Processing authentication...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="w-8 h-8 mx-auto text-green-600" />
              <p className="text-green-600 font-medium">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to data sources...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
              <p className="text-red-600 font-medium">{message}</p>
              <button
                onClick={() => router.push('/data-sources')}
                className="text-blue-600 hover:text-blue-700 text-sm underline"
              >
                Return to Data Sources
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
