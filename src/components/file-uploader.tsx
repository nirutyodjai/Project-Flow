'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { X, FileIcon, Upload, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedFile {
  file: File;
  url?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  preview?: string;
}

interface FileUploaderProps {
  onUploadSuccess?: (urls: string[]) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  acceptedFileTypes?: string[];
  maxSize?: number; // in bytes
}

export function FileUploader({ 
  onUploadSuccess, 
  onUploadError,
  maxFiles = 5,
  acceptedFileTypes,
  maxSize = 10 * 1024 * 1024, // 10MB default
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = (acceptedFiles: File[]) => {
    const remainingSlots = maxFiles - files.length;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    
    const newFiles: UploadedFile[] = filesToAdd.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }));

    setFiles(prev => [...prev, ...newFiles]);

    if (acceptedFiles.length > remainingSlots) {
      toast({
        title: 'ไฟล์เกินจำนวนที่กำหนด',
        description: `สามารถอัพโหลดได้สูงสุด ${maxFiles} ไฟล์`,
        variant: 'destructive',
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize,
    accept: acceptedFileTypes ? acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}) : undefined,
  });

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      // Revoke preview URL if exists
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFile = async (fileData: UploadedFile, index: number) => {
    const formData = new FormData();
    formData.append('file', fileData.file);

    try {
      // Simulate progress
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress <= 90) {
          setFiles(prev => {
            const newFiles = [...prev];
            newFiles[index] = { ...newFiles[index], progress: currentProgress, status: 'uploading' };
            return newFiles;
          });
        } else {
          clearInterval(interval);
        }
      }, 200);

      const response = await fetch('/api/upload-analyze', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (response.ok) {
        const data = await response.json();
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[index] = { 
            ...newFiles[index], 
            progress: 100, 
            status: 'success',
            url: data.file.url,
            error: undefined,
          };
          return newFiles;
        });

        // แสดงผลการวิเคราะห์
        if (data.analysis && data.analysis.suggestions) {
          toast({
            title: `วิเคราะห์ไฟล์: ${data.file.name}`,
            description: data.analysis.suggestions[0] || 'อัพโหลดสำเร็จ',
          });
        }
      } else {
        const errorData = await response.json();
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[index] = { 
            ...newFiles[index], 
            status: 'error',
            error: errorData.error || 'อัพโหลดล้มเหลว' 
          };
          return newFiles;
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[index] = { 
          ...newFiles[index], 
          status: 'error',
          error: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์' 
        };
        return newFiles;
      });
    }
  };

  const handleUploadAll = async () => {
    if (files.length === 0) {
      toast({
        title: 'ไม่มีไฟล์ที่เลือก',
        description: 'กรุณาเลือกไฟล์ก่อนอัพโหลด',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    const pendingFiles = files
      .map((file, index) => ({ file, index }))
      .filter(({ file }) => file.status === 'pending');

    await Promise.all(
      pendingFiles.map(({ file, index }) => uploadFile(file, index))
    );

    setUploading(false);

    const successFiles = files.filter(f => f.status === 'success' && f.url);
    if (successFiles.length > 0) {
      toast({
        title: 'อัพโหลดสำเร็จ',
        description: `อัพโหลดไฟล์สำเร็จ ${successFiles.length} ไฟล์`,
      });
      onUploadSuccess?.(successFiles.map(f => f.url!));
    }

    const errorFiles = files.filter(f => f.status === 'error');
    if (errorFiles.length > 0) {
      toast({
        title: 'อัพโหลดล้มเหลว',
        description: `อัพโหลดล้มเหลว ${errorFiles.length} ไฟล์`,
        variant: 'destructive',
      });
      onUploadError?.(`${errorFiles.length} files failed to upload`);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          files.length >= maxFiles && "opacity-50 cursor-not-allowed"
        )}
      >
        <Input {...getInputProps()} disabled={files.length >= maxFiles} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-10 w-10 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm text-primary">วางไฟล์ที่นี่...</p>
          ) : (
            <>
              <p className="text-sm font-medium">ลากและวางไฟล์ที่นี่ หรือคลิกเพื่อเลือกไฟล์</p>
              <p className="text-xs text-muted-foreground">
                อัพโหลดได้สูงสุด {maxFiles} ไฟล์ (ขนาดไม่เกิน {formatFileSize(maxSize)} ต่อไฟล์)
              </p>
            </>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">ไฟล์ที่เลือก ({files.length}/{maxFiles})</p>
            <Button 
              onClick={handleUploadAll} 
              disabled={uploading || files.every(f => f.status !== 'pending')}
              size="sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลดทั้งหมด'}
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((fileData, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                {fileData.preview ? (
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                    <img 
                      src={fileData.preview} 
                      alt={fileData.file.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-muted">
                    <FileIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{fileData.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(fileData.file.size)}
                  </p>
                  
                  {fileData.status === 'uploading' && (
                    <Progress value={fileData.progress} className="mt-2 h-1" />
                  )}
                  
                  {fileData.status === 'error' && (
                    <p className="text-xs text-destructive mt-1">{fileData.error}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {fileData.status === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  
                  {fileData.status !== 'uploading' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
