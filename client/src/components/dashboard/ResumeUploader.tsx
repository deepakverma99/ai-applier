'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { resumeService } from '@/services/resumeService';
import { cn } from '@/lib/utils';

interface ResumeUploaderProps {
  onSuccess?: (parsedData: any) => void;
}

export function ResumeUploader({ onSuccess }: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setStatus('error');
      setErrorMessage('Please upload a PDF file');
      return;
    }

    setFileName(file.name);
    setStatus('uploading');
    setErrorMessage(null);

    try {
      // Step 2: Transition to parsing
      // Note: In reality, we could show granular progress, but for simplicity:
      const result = await resumeService.uploadAndParse(file);
      setStatus('parsing');
      
      // Simulate/Wait for backend parsing
      setStatus('success');
      if (onSuccess) onSuccess(result.profile);
    } catch (err: any) {
      console.error('Upload error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to process resume');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center text-center",
          isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border bg-card/50",
          status === 'error' ? "border-destructive/50 bg-destructive/5" : ""
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          disabled={status === 'uploading' || status === 'parsing'}
        />

        {status === 'idle' && (
          <>
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload your Resume</h3>
            <p className="text-muted-foreground mb-6">
              Drag and drop your PDF here, or click to browse
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <FileText className="h-3 w-3" />
              <span>PDF up to 10MB</span>
            </div>
          </>
        )}

        {(status === 'uploading' || status === 'parsing') && (
          <div className="flex flex-col items-center">
            <div className="relative h-20 w-20 mb-6">
              <Loader2 className="h-20 w-20 text-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary/50" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {status === 'uploading' ? 'Uploading PDF...' : 'AI is Parsing Resume...'}
            </h3>
            <p className="text-muted-foreground">
              {status === 'uploading' ? `Sending ${fileName} to storage` : 'Extracting skills and experience'}
            </p>
            {/* Pulsing Scan Line Effect */}
            <div className="mt-8 w-48 h-1 bg-muted relative overflow-hidden rounded-full">
              <div className="absolute inset-0 bg-primary animate-ping" />
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in zoom-in duration-300">
            <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analysis Complete!</h3>
            <p className="text-muted-foreground mb-6">
              We&apos;ve extracted your profile data from {fileName}
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="text-sm font-medium text-primary hover:underline"
            >
              Upload another version
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-destructive">Upload Failed</h3>
            <p className="text-muted-foreground mb-6">{errorMessage}</p>
            <button
              onClick={() => setStatus('idle')}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
        <div className="flex flex-col gap-1 p-3 border rounded-lg">
          <span className="font-semibold text-foreground">AI Scanning</span>
          <span>Automatic parsing of education & work history.</span>
        </div>
        <div className="flex flex-col gap-1 p-3 border rounded-lg">
          <span className="font-semibold text-foreground">Privacy First</span>
          <span>Files are encrypted and stored securely.</span>
        </div>
        <div className="flex flex-col gap-1 p-3 border rounded-lg">
          <span className="font-semibold text-foreground">Format Agnostic</span>
          <span>Best results with clean, standard PDF layouts.</span>
        </div>
      </div>
    </div>
  );
}
