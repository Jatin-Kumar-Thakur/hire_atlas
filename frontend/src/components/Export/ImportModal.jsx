import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, FileText, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { importApplications } from '../../api/applicationService';

// Parse the first 5 data rows from a CSV string for a preview table
const parseCSVPreview = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 1) return { headers: [], rows: [] };

  const splitCSVLine = (line) =>
    line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));

  const headers = splitCSVLine(lines[0]);
  const rows    = lines.slice(1, 6).map(splitCSVLine);
  return { headers, rows };
};

const ImportModal = ({ isOpen, onClose, onImported }) => {
  const navigate   = useNavigate();
  const fileRef    = useRef(null);
  const dropRef    = useRef(null);

  const [step,          setStep]          = useState(1); // 1: upload, 2: preview, 3: results
  const [selectedFile,  setSelectedFile]  = useState(null);
  const [preview,       setPreview]       = useState({ headers: [], rows: [] });
  const [result,        setResult]        = useState(null);
  const [importing,     setImporting]     = useState(false);
  const [isDragOver,    setIsDragOver]    = useState(false);
  const [showErrors,    setShowErrors]    = useState(false);

  const reset = () => {
    setStep(1);
    setSelectedFile(null);
    setPreview({ headers: [], rows: [] });
    setResult(null);
    setImporting(false);
    setIsDragOver(false);
    setShowErrors(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => { reset(); onClose(); };

  const processFile = useCallback((file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Only .csv files are accepted');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB');
      return;
    }
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSVPreview(e.target.result);
      setPreview(parsed);
      setStep(2);
    };
    reader.readAsText(file);
  }, []);

  const handleFileInputChange = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setImporting(true);
    try {
      const { data } = await importApplications(selectedFile);
      setResult(data.data);
      setStep(3);
      if (data.data.imported > 0) {
        toast.success(`${data.data.imported} application${data.data.imported !== 1 ? 's' : ''} imported!`);
        if (onImported) onImported();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  const totalRows = preview.rows.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Upload size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Import Applications</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {step === 1 ? 'Upload a CSV file' : step === 2 ? 'Preview your data' : 'Import complete'}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <X size={17} />
          </button>
        </div>

        {/* ── Step 1: Upload ────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="px-6 py-6">
            <div
              ref={dropRef}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                isDragOver
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/40'
              }`}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText size={22} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                {isDragOver ? 'Drop your file here' : 'Drag & drop your CSV file'}
              </p>
              <p className="text-xs text-gray-400">or click to browse — max 5 MB</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <p className="text-xs text-gray-400 text-center mt-4">
              Need a template?{' '}
              <button
                onClick={(e) => { e.stopPropagation(); import('../../utils/csvTemplate').then(m => m.downloadCSVTemplate()); }}
                className="text-indigo-600 hover:underline"
              >
                Download it here
              </button>
            </p>
          </div>
        )}

        {/* ── Step 2: Preview ───────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={15} className="text-indigo-500 shrink-0" />
              <p className="text-sm text-gray-700 truncate max-w-[300px]">{selectedFile?.name}</p>
              <button onClick={reset} className="text-xs text-indigo-600 hover:underline ml-auto shrink-0">
                Choose different file
              </button>
            </div>

            {preview.headers.length > 0 ? (
              <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        {preview.headers.map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {preview.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {row.map((cell, j) => (
                            <td key={j} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[120px] truncate">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-xl px-4 py-3 text-sm text-yellow-700 mb-4">
                Could not parse file preview. Proceed with import anyway.
              </div>
            )}

            <p className="text-xs text-gray-400 mb-4">
              Showing first {totalRows} row{totalRows !== 1 ? 's' : ''}. The full file will be processed on import.
            </p>

            <div className="flex gap-3">
              <button onClick={reset} className="flex-1 py-2.5 text-sm border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition">
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-xl transition flex items-center justify-center gap-2"
              >
                {importing && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                {importing ? 'Importing…' : 'Import File'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Results ───────────────────────────────────────────────── */}
        {step === 3 && result && (
          <div className="px-6 py-6">
            {/* Success */}
            {result.imported > 0 && (
              <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 mb-3">
                <CheckCircle size={18} className="text-green-500 shrink-0" />
                <p className="text-sm text-green-700 font-medium">
                  {result.imported} application{result.imported !== 1 ? 's' : ''} imported successfully!
                </p>
              </div>
            )}

            {/* Skipped */}
            {result.skipped > 0 && (
              <div className="flex items-center gap-3 bg-yellow-50 rounded-xl px-4 py-3 mb-3">
                <AlertTriangle size={18} className="text-yellow-500 shrink-0" />
                <p className="text-sm text-yellow-700">{result.skipped} row{result.skipped !== 1 ? 's' : ''} skipped</p>
              </div>
            )}

            {/* Error details */}
            {result.errors?.length > 0 && (
              <div className="border border-gray-100 rounded-xl overflow-hidden mb-4">
                <button
                  onClick={() => setShowErrors((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  <span>Show {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}</span>
                  {showErrors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {showErrors && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50 max-h-36 overflow-y-auto">
                    {result.errors.map((e, i) => (
                      <div key={i} className="px-4 py-2 text-xs text-gray-600">
                        <span className="font-medium">Row {e.row}:</span> {e.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-2">
              <button onClick={handleClose} className="flex-1 py-2.5 text-sm border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition">
                Close
              </button>
              {result.imported > 0 && (
                <button
                  onClick={() => { handleClose(); navigate('/applications'); }}
                  className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition"
                >
                  View Applications
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
