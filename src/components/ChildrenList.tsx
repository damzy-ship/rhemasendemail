import React, { useState, useEffect } from 'react';
import { Search, Users, Mail, User, Calendar, MapPin, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ChildWithParent } from '../lib/supabase';
import { SupabaseService } from '../services/supabaseService';
import { EmailService } from '../services/emailService';
import { EmailStatus } from '../types';

interface ChildrenListProps {
  onSendBulkEmails: (children: ChildWithParent[]) => void;
}

export function ChildrenList({ onSendBulkEmails }: ChildrenListProps) {
  const [children, setChildren] = useState<ChildWithParent[]>([]);
  const [filteredChildren, setFilteredChildren] = useState<ChildWithParent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChildren, setSelectedChildren] = useState<Set<string>>(new Set());
  const [sendingStatus, setSendingStatus] = useState<Record<string, EmailStatus>>({});
  const [isSending, setIsSending] = useState(false);

  const supabaseService = new SupabaseService();

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = children.filter(child => {
        const childName = child.name || `${child.first_name || ''} ${child.last_name || ''}`.trim();
        const parentName = child.parent?.name || '';
        const parentEmail = child.parent?.email || '';
        
        return (
          childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          parentEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredChildren(filtered);
    } else {
      setFilteredChildren(children);
    }
  }, [searchTerm, children]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supabaseService.getChildrenWithParents();
      setChildren(data);
      setFilteredChildren(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedChildren.size === filteredChildren.length) {
      setSelectedChildren(new Set());
    } else {
      setSelectedChildren(new Set(filteredChildren.map(child => child.id)));
    }
  };

  const handleSelectChild = (childId: string) => {
    const newSelected = new Set(selectedChildren);
    if (newSelected.has(childId)) {
      newSelected.delete(childId);
    } else {
      newSelected.add(childId);
    }
    setSelectedChildren(newSelected);
  };

  const sendIndividualEmail = async (child: ChildWithParent) => {
    if (!child.parent?.email || !child.qr_code_url) {
      return;
    }

    const parentData = supabaseService.childToParentData(child);
    if (!parentData) return;

    setSendingStatus(prev => ({
      ...prev,
      [child.id]: {
        parentEmail: parentData.parentEmail,
        parentName: parentData.parentName,
        status: 'sending'
      }
    }));

    try {
      const emailService = new EmailService();
      await emailService.sendEmail(parentData);
      
      await supabaseService.logEmail(child.id, parentData.parentEmail, 'sent');
      
      setSendingStatus(prev => ({
        ...prev,
        [child.id]: {
          parentEmail: parentData.parentEmail,
          parentName: parentData.parentName,
          status: 'success'
        }
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await supabaseService.logEmail(child.id, parentData.parentEmail, 'failed', errorMessage);
      
      setSendingStatus(prev => ({
        ...prev,
        [child.id]: {
          parentEmail: parentData.parentEmail,
          parentName: parentData.parentName,
          status: 'error',
          error: errorMessage
        }
      }));
    }
  };

  const sendBulkEmails = async () => {
    const selectedChildrenData = filteredChildren.filter(child => selectedChildren.has(child.id));
    const validChildren = selectedChildrenData.filter(child => child.parent?.email && child.qr_code_url);
    
    if (validChildren.length === 0) {
      alert('No valid children selected with parent emails and QR codes');
      return;
    }

    setIsSending(true);
    
    try {
      const emailService = new EmailService();
      
      for (const child of validChildren) {
        const parentData = supabaseService.childToParentData(child);
        if (!parentData) continue;

        setSendingStatus(prev => ({
          ...prev,
          [child.id]: {
            parentEmail: parentData.parentEmail,
            parentName: parentData.parentName,
            status: 'sending'
          }
        }));

        try {
          await emailService.sendEmail(parentData);
          await supabaseService.logEmail(child.id, parentData.parentEmail, 'sent');
          
          setSendingStatus(prev => ({
            ...prev,
            [child.id]: {
              parentEmail: parentData.parentEmail,
              parentName: parentData.parentName,
              status: 'success'
            }
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await supabaseService.logEmail(child.id, parentData.parentEmail, 'failed', errorMessage);
          
          setSendingStatus(prev => ({
            ...prev,
            [child.id]: {
              parentEmail: parentData.parentEmail,
              parentName: parentData.parentName,
              status: 'error',
              error: errorMessage
            }
          }));
        }

        // Add delay between emails
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } finally {
      setIsSending(false);
    }
  };

  const getChildDisplayName = (child: ChildWithParent) => {
    return child.name || 
      [child.first_name, child.middle_name, child.last_name]
        .filter(Boolean)
        .join(' ') || 
      'Unknown Child';
  };

  const validChildrenCount = filteredChildren.filter(child => child.parent?.email && child.qr_code_url).length;
  const selectedValidCount = filteredChildren.filter(child => 
    selectedChildren.has(child.id) && child.parent?.email && child.qr_code_url
  ).length;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading children...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <XCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-semibold text-red-900">Error Loading Data</h2>
        </div>
        <p className="text-red-800 mb-4">{error}</p>
        <button
          onClick={loadChildren}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Children Database</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{filteredChildren.length} children</span>
            <span>{validChildrenCount} with valid email & QR</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by child name, parent name, or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedChildren.size === filteredChildren.length && filteredChildren.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All ({selectedChildren.size} selected)
              </span>
            </label>
          </div>
          
          {selectedChildren.size > 0 && (
            <button
              onClick={sendBulkEmails}
              disabled={isSending || selectedValidCount === 0}
              className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send to {selectedValidCount} Parents
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Children List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredChildren.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No children found matching your search.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChildren.map((child) => {
              const childName = getChildDisplayName(child);
              const hasValidData = child.parent?.email && child.qr_code_url;
              const status = sendingStatus[child.id];
              
              return (
                <div
                  key={child.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !hasValidData ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={selectedChildren.has(child.id)}
                        onChange={() => handleSelectChild(child.id)}
                        disabled={!hasValidData}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{childName}</h3>
                          {child.age && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Age {child.age}
                            </span>
                          )}
                          {child.gender && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              {child.gender}
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{child.parent?.name || 'No parent assigned'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{child.parent?.email || 'No email'}</span>
                          </div>
                          {child.parent?.phone_number && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{child.parent.phone_number}</span>
                            </div>
                          )}
                          {child.created_at && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Registered {new Date(child.created_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {status && (
                        <div className="flex items-center gap-2">
                          {status.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {status.status === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                          {status.status === 'sending' && <Clock className="w-4 h-4 text-blue-600 animate-spin" />}
                          <span className={`text-xs ${
                            status.status === 'success' ? 'text-green-600' :
                            status.status === 'error' ? 'text-red-600' :
                            'text-blue-600'
                          }`}>
                            {status.status === 'success' ? 'Sent' :
                             status.status === 'error' ? 'Failed' :
                             'Sending...'}
                          </span>
                        </div>
                      )}
                      
                      {hasValidData && !status && (
                        <button
                          onClick={() => sendIndividualEmail(child)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          Send Email
                        </button>
                      )}
                      
                      {!hasValidData && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          Missing {!child.parent?.email ? 'email' : 'QR code'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}