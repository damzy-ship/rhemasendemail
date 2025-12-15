import React, { useState } from 'react';
import { Mail, Shield, Users, Database, FileText } from 'lucide-react';
import { JsonInput } from './components/JsonInput';
import { EmailPreview } from './components/EmailPreview';
import { EmailSender } from './components/EmailSender';
import { ChildrenList } from './components/ChildrenList';
import { ParentData } from './types';
import { ChildWithParent } from './lib/supabase';
import { SupabaseService } from './services/supabaseService';

function App() {
  const [parentData, setParentData] = useState<ParentData[] | null>(null);
  const [activeTab, setActiveTab] = useState<'database' | 'manual'>('database');
  const supabaseService = new SupabaseService();

  const handleBulkEmailFromDatabase = (children: ChildWithParent[]) => {
    const parentDataFromChildren = children
      .map(child => supabaseService.childToParentData(child))
      .filter((data): data is NonNullable<typeof data> => data !== null);
    
    setParentData(parentDataFromChildren);
    setActiveTab('manual'); // Switch to manual tab to show preview and send
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Rhema Youth Camp 2025
              </h1>
              <p className="text-gray-600 mt-1">Bulk Email Sender for Parent Communications</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('database')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'database'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Database className="w-4 h-4" />
                Database Mode
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'manual'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                Manual JSON Mode
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Bulk Sending</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Send personalized emails to multiple parents with QR codes for camp check-in and pick-up.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Secure Delivery</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Uses Gmail via Pica API for reliable and secure email delivery with proper rate limiting.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Template-Based</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Professional email template with embedded QR codes and camp information.
              </p>
            </div>
          </div>

          {activeTab === 'database' ? (
            /* Database Mode */
            <ChildrenList onSendBulkEmails={handleBulkEmailFromDatabase} />
          ) : (
            /* Manual JSON Mode */
            <JsonInput onDataChange={setParentData} />
          )}

          {/* Preview and Send Sections */}
          {parentData && parentData.length > 0 && activeTab === 'manual' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <EmailPreview parents={parentData} />
              <EmailSender parents={parentData} />
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Setup Instructions</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <p>Configure your Pica API and Supabase credentials in the <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <p>Use Database Mode to send emails to all children's parents, or Manual Mode for custom JSON data</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <p>Select children or paste JSON data, preview the emails, and send them to parents</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;