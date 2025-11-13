import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';

interface BatchImportFormProps {
  onImport: (entries: Array<{ mandarin: string; english: string }>) => void;
}

export function BatchImportForm({ onImport }: BatchImportFormProps) {
  const [csvText, setCsvText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const parseCSV = (text: string): Array<{ mandarin: string; english: string }> => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const entries: Array<{ mandarin: string; english: string }> = [];
    
    lines.forEach((line, index) => {
      // Skip header row if it looks like headers
      if (index === 0 && (line.toLowerCase().includes('mandarin') || line.toLowerCase().includes('english'))) {
        return;
      }
      
      // Handle CSV parsing - split by comma, but handle quoted values
      const parts: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.trim());
      
      if (parts.length >= 2) {
        const mandarin = parts[0].replace(/^"|"$/g, '');
        const english = parts.slice(1).join(',').replace(/^"|"$/g, '');
        if (mandarin && english) {
          entries.push({ mandarin, english });
        }
      }
    });
    
    return entries;
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        showToast('error', 'Failed to read file');
        return;
      }
      
      const entries = parseCSV(text);
      if (entries.length === 0) {
        showToast('error', 'No valid entries found in CSV file');
        return;
      }
      
      onImport(entries);
      setCsvText('');
    };
    reader.onerror = () => {
      showToast('error', 'Error reading file');
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      showToast('error', 'Please select a CSV file');
      return;
    }
    
    handleFileRead(file);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      showToast('error', 'Please drop a CSV file');
      return;
    }
    
    handleFileRead(file);
  };

  const handleTextareaImport = () => {
    if (!csvText.trim()) {
      showToast('error', 'Please enter CSV data');
      return;
    }
    
    const entries = parseCSV(csvText);
    if (entries.length === 0) {
      showToast('error', 'No valid entries found in CSV text');
      return;
    }
    
    onImport(entries);
    setCsvText('');
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Upload CSV File
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-300 hover:border-primary-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-file-input"
          />
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-neutral-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 8M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-neutral-600">
              Drag and drop a CSV file here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-neutral-500">
              CSV format: mandarin,english (one entry per line)
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-surface text-neutral-500">or</span>
        </div>
      </div>

      {/* Textarea Section */}
      <div>
        <label htmlFor="csv-textarea" className="block text-sm font-medium text-neutral-700 mb-2">
          Paste CSV Data
        </label>
        <textarea
          id="csv-textarea"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder="mandarin,english&#10;你好,Hello&#10;谢谢,Thank you"
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-colors duration-200 font-mono text-sm min-h-[120px]"
          rows={6}
        />
        <p className="mt-1 text-xs text-neutral-500">
          Format: mandarin,english (one entry per line)
        </p>
        <Button
          type="button"
          variant="primary"
          onClick={handleTextareaImport}
          className="w-full mt-3 py-2"
          disabled={!csvText.trim()}
        >
          Import from Text
        </Button>
      </div>
    </div>
  );
}
