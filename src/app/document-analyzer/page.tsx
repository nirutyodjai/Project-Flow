''''use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';
import { FinalAnalysisOutputSchema } from '@/ai/flows/summarize-document-flow';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileDown, Link as LinkIcon, Save, UploadCloud } from 'lucide-react';

// Type for the full response from our analysis API	ype AnalysisResponse = {
  analysis: z.infer<typeof FinalAnalysisOutputSchema>;
  source: {
    sourceType: 'url' | 'text' | 'file';
    content: string; // URL or original file name
  };
};

export default function DocumentAnalyzerPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      toast({ title: 'File selected', description: acceptedFiles[0].name });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    const formData = new FormData();
    let hasInput = false;

    if (activeTab === 'url' && url) {
      formData.append('sourceType', 'url');
      formData.append('content', url);
      hasInput = true;
    } else if (activeTab === 'text' && text) {
      formData.append('sourceType', 'text');
      formData.append('content', text);
      hasInput = true;
    } else if (activeTab === 'file' && file) {
      formData.append('sourceType', 'file');
      formData.append('file', file);
      hasInput = true;
    }

    if (!hasInput) {
      toast({ title: 'Error', description: 'Please provide input before analyzing.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const result: AnalysisResponse = await response.json();
      setAnalysisResult(result);
      toast({ title: 'Analysis Complete', description: `Successfully analyzed: ${result.analysis.projectName}` });

    } catch (error) {
      console.error('Analysis error:', error);
      toast({ title: 'Analysis Failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!analysisResult) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/save-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisResult: analysisResult.analysis,
          source: analysisResult.source,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Save failed');
      }

      const saveData = await response.json();
      toast({ title: 'Project Saved', description: `Project analysis saved with ID: ${saveData.savedId}` });

    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Save Failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSourceButton = () => {
    if (!analysisResult) return null;

    const { sourceType, content } = analysisResult.source;

    if (sourceType === 'url') {
      return (
        <Button asChild variant="outline">
          <a href={content} target="_blank" rel="noopener noreferrer">
            <LinkIcon className="mr-2 h-4 w-4" />
            Open Source URL
          </a>
        </Button>
      );
    }

    if (sourceType === 'file' && file) {
        const downloadUrl = URL.createObjectURL(file);
        return (
            <Button asChild variant="outline">
                <a href={downloadUrl} download={file.name}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Original File
                </a>
            </Button>
        );
    }

    return null;
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Document Analyzer</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Leverage AI to extract key insights from your project documents.
        </p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>1. Provide Document Source</CardTitle>
          <CardDescription>Choose a method to provide the document for analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="file">File</TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="mt-4">
              <Input
                type="url"
                placeholder="https://example.com/document.pdf"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </TabsContent>
            <TabsContent value="text" className="mt-4">
              <Textarea
                placeholder="Paste the full text of the document here..."
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
              />
            </TabsContent>
            <TabsContent value="file" className="mt-4">
              <div
                {...getRootProps()}
                className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors 
                  ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
              >
                <input {...getInputProps()} disabled={isLoading} />
                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                {file ? (
                  <p className="mt-2 text-sm font-semibold">{file.name}</p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isDragActive ? 'Drop the file here ...' : 'Drag & drop a file here, or click to select'}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
          <Button onClick={handleAnalyze} disabled={isLoading} className="w-full mt-6">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Analyzing...' : 'Analyze Document'}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card className="max-w-3xl mx-auto mt-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{analysisResult.analysis.projectName}</CardTitle>
                <CardDescription>
                  {analysisResult.analysis.projectType} - Budget: {analysisResult.analysis.budget || 'N/A'}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                {renderSourceButton()}
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Overall Summary</h3>
                <p className="text-muted-foreground text-sm">{analysisResult.analysis.overallSummary}</p>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="scope">
                  <AccordionTrigger>Scope of Work</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-1">
                      {analysisResult.analysis.scopeOfWork.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="requirements">
                  <AccordionTrigger>Key Requirements</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-1">
                      {analysisResult.analysis.keyRequirements.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="risks">
                  <AccordionTrigger>Risks & Opportunities</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-1">
                      {analysisResult.analysis.risksAndOpportunities.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="deadlines">
                  <AccordionTrigger>Deadlines</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-6 space-y-1">
                      {analysisResult.analysis.deadlines.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
'''