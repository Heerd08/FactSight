import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, X, FileCheck } from 'lucide-react';
import Button from '../common/Button';

export default function ImageUpload({ onAnalyze, isLoading }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    onAnalyze({ type: 'image', file, preview, fileName: file.name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
        className="hidden"
      />

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
              : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70 bg-white'
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-2xs">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-slate-800 mb-1">
            Upload a screenshot for analysis
          </h4>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Drag & drop an image here or choose a file
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={ImageIcon}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Choose Image
          </Button>
          <p className="text-[11px] text-slate-400 mt-4">
            Supports PNG, JPG, WEBP screenshots up to 10MB (OCR text extraction & manipulated asset detection)
          </p>
        </div>
      ) : (
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-xs">{file?.name}</p>
                <p className="text-[11px] text-slate-400">{(file?.size / (1024 * 1024)).toFixed(2)} MB • Image Ready</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          <div className="mt-4 flex justify-center bg-slate-50 rounded-xl p-3 border border-slate-100 max-h-72 overflow-hidden">
            <img
              src={preview}
              alt="Screenshot preview"
              className="max-h-64 object-contain rounded-lg shadow-sm"
            />
          </div>
        </div>
      )}

      {preview && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <span className="text-xs text-slate-400">
            FactSight will perform OCR text extraction, visual artifact inspection, and reverse claim lookups.
          </span>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={Sparkles}
            iconPosition="left"
            isLoading={isLoading}
            className="w-full sm:w-auto shadow-md shadow-indigo-500/20"
          >
            Analyze Image
          </Button>
        </div>
      )}
    </form>
  );
}
