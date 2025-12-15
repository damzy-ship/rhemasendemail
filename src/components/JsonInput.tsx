import React, { useState, useEffect } from 'react';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { ParentData } from '../types';
import { validateParentData } from '../utils/emailUtils';

interface JsonInputProps {
  onDataChange: (data: ParentData[] | null) => void;
}

export function JsonInput({ onDataChange }: JsonInputProps) {
  const [jsonText, setJsonText] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!jsonText.trim()) {
      setValidationErrors([]);
      setIsValid(false);
      onDataChange(null);
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const validation = validateParentData(parsed);
      
      setValidationErrors(validation.errors);
      setIsValid(validation.isValid);
      
      if (validation.isValid) {
        onDataChange(parsed as ParentData[]);
      } else {
        onDataChange(null);
      }
    } catch (error) {
      setValidationErrors(['Invalid JSON format']);
      setIsValid(false);
      onDataChange(null);
    }
  }, [jsonText, onDataChange]);

  const exampleData = `[
  {
    "parentEmail": "john.smith@example.com",
    "parentName": "John Smith",
    "childNames": "Emma Smith, Liam Smith",
    "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CHILD_001"
  },
  {
    "parentEmail": "jane.doe@example.com",
    "parentName": "Jane Doe",
    "childNames": "Sophie Doe",
    "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=CHILD_002"
  }
]`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Parent Data Input</h2>
        {isValid && (
          <div className="flex items-center gap-1 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Valid JSON</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="json-input" className="block text-sm font-medium text-gray-700 mb-2">
            Paste your JSON array of parent data:
          </label>
          <textarea
            id="json-input"
            className={`w-full h-48 px-4 py-3 rounded-lg border-2 font-mono text-sm transition-colors ${
              jsonText && !isValid
                ? 'border-red-300 focus:border-red-500 bg-red-50'
                : jsonText && isValid
                ? 'border-green-300 focus:border-green-500 bg-green-50'
                : 'border-gray-300 focus:border-blue-500'
            } focus:outline-none resize-none`}
            placeholder="Paste your JSON array here..."
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
          />
        </div>

        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
              <AlertCircle className="w-4 h-4" />
              Validation Errors:
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <details className="bg-gray-50 rounded-lg border border-gray-200">
          <summary className="cursor-pointer p-4 text-sm font-medium text-gray-700 hover:text-gray-900">
            Show example JSON format
          </summary>
          <div className="px-4 pb-4">
            <pre className="text-xs bg-gray-100 p-3 rounded border overflow-x-auto">
              <code>{exampleData}</code>
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}