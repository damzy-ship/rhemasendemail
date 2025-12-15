import React, { useState } from 'react';
import { Send, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ParentData, EmailStatus, EmailProgress } from '../types';
import { EmailService } from '../services/emailService';

interface EmailSenderProps {
  parents: ParentData[];
}

export function EmailSender({ parents }: EmailSenderProps) {
  const [isConfigured, setIsConfigured] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState<EmailProgress>({ total: 0, sent: 0, failed: 0 });
  const [emailStatuses, setEmailStatuses] = useState<EmailStatus[]>([]);
  const [delaySeconds, setDelaySeconds] = useState(2);

  React.useEffect(() => {
    try {
      new EmailService();
      setIsConfigured(true);
    } catch (error) {
      setIsConfigured(false);
    }
  }, []);

  const handleSendEmails = async () => {
    if (!isConfigured) return;

    setIsSending(true);
    setProgress({ total: parents.length, sent: 0, failed: 0 });
    setEmailStatuses([]);

    try {
      const emailService = new EmailService();
      
      await emailService.sendBulkEmails(
        parents,
        (status) => {
          setEmailStatuses(prev => {
            const updated = [...prev];
            const existingIndex = updated.findIndex(s => s.parentEmail === status.parentEmail);
            
            if (existingIndex >= 0) {
              updated[existingIndex] = status;
            } else {
              updated.push(status);
            }
            
            const sent = updated.filter(s => s.status === 'success').length;
            const failed = updated.filter(s => s.status === 'error').length;
            
            setProgress({
              total: parents.length,
              sent,
              failed,
              current: status.status === 'sending' ? status.parentName : undefined
            });
            
            return updated;
          });
        },
        delaySeconds * 1000
      );
    } catch (error) {
      console.error('Bulk email sending failed:', error);
    } finally {
      setIsSending(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-semibold text-red-900">Configuration Required</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 mb-3">
            Missing required environment variables. Please add the following to your <code className="bg-red-100 px-2 py-1 rounded">.env</code> file:
          </p>
          <pre className="text-sm bg-red-100 p-3 rounded border overflow-x-auto text-red-800">
{`VITE_PICA_SECRET_KEY=your_pica_secret_key_here
VITE_PICA_GMAIL_CONNECTION_KEY=your_pica_gmail_connection_key_here`}
          </pre>
          <p className="text-red-700 text-sm mt-3">
            Restart the development server after adding these variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-50 rounded-lg">
          <Send className="w-5 h-5 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Send Emails</h2>
      </div>

      <div className="space-y-6">
        {/* Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Send Settings</h3>
            <span className="text-sm text-gray-600">{parents.length} recipients</span>
          </div>
          
          <div className="flex items-center gap-4">
            <label htmlFor="delay" className="text-sm font-medium text-gray-700">
              Delay between emails:
            </label>
            <select
              id="delay"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(parseInt(e.target.value))}
              disabled={isSending}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value={1}>1 second</option>
              <option value={2}>2 seconds</option>
              <option value={3}>3 seconds</option>
              <option value={5}>5 seconds</option>
            </select>
          </div>
        </div>

        {/* Progress */}
        {(isSending || emailStatuses.length > 0) && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-900 font-medium">
                  {isSending ? 'Sending emails...' : 'Sending complete'}
                </span>
                <span className="text-blue-700 text-sm">
                  {progress.sent + progress.failed} / {progress.total}
                </span>
              </div>
              
              <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((progress.sent + progress.failed) / progress.total) * 100}%` }}
                />
              </div>
              
              {progress.current && (
                <p className="text-blue-800 text-sm">Currently sending to: {progress.current}</p>
              )}
              
              <div className="flex gap-4 text-sm mt-2">
                <span className="text-green-700">✓ {progress.sent} sent</span>
                {progress.failed > 0 && <span className="text-red-700">✗ {progress.failed} failed</span>}
              </div>
            </div>

            {/* Status List */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {emailStatuses.map((status, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 ${
                    status.status === 'success' ? 'bg-green-50' :
                    status.status === 'error' ? 'bg-red-50' :
                    status.status === 'sending' ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {status.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {status.status === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                    {status.status === 'sending' && <Clock className="w-4 h-4 text-blue-600 animate-spin" />}
                    {status.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                    
                    <div>
                      <p className="font-medium text-sm text-gray-900">{status.parentName}</p>
                      <p className="text-xs text-gray-600">{status.parentEmail}</p>
                    </div>
                  </div>
                  
                  {status.error && (
                    <span className="text-xs text-red-600 max-w-xs truncate" title={status.error}>
                      {status.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleSendEmails}
          disabled={isSending}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isSending ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              Sending {progress.sent + progress.failed + 1} of {progress.total}...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send {parents.length} Emails
            </>
          )}
        </button>
      </div>
    </div>
  );
}