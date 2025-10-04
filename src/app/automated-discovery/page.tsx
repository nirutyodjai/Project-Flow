'use client';

import { useState } from 'react';
import { z } from 'zod';
import { AutomatedProjectDiscoveryOutputSchema } from '@/ai/flows/automated-project-discovery';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Type for the output of our new automated flow
type AutomatedDiscoveryOutput = z.infer<typeof AutomatedProjectDiscoveryOutputSchema>;

export default function AutomatedDiscoveryPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AutomatedDiscoveryOutput | null>(null);

  const handleSearch = async () => {
    if (!query) {
      toast({ title: 'Error', description: 'Please enter a search query.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/automated-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data: AutomatedDiscoveryOutput = await response.json();
      setResults(data);
      toast({ title: 'Discovery Complete', description: `Found and analyzed ${data.projects.length} projects.` });

    } catch (error) {
      console.error('Automated discovery error:', error);
      toast({ title: 'Discovery Failed', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderDetailedAnalysis = (project: AutomatedDiscoveryOutput['projects'][0]) => {
    if (project.analysisError) {
      return (
        <div className="text-red-500 flex items-center">
          <AlertTriangle className="mr-2 h-4 w-4" />
          <p><strong>Analysis Failed:</strong> {project.analysisError}</p>
        </div>
      );
    }

    if (!project.detailedAnalysis) {
      return <p className="text-muted-foreground">No detailed analysis available.</p>;
    }

    const { detailedAnalysis } = project;

    return (
      <div className="space-y-4 text-sm">
        <div>
          <h4 className="font-semibold">Overall Summary</h4>
          <p className="text-muted-foreground">{detailedAnalysis.overallSummary}</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="scope">
            <AccordionTrigger>Scope of Work</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-1">
                {detailedAnalysis.scopeOfWork.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="requirements">
            <AccordionTrigger>Key Requirements</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-1">
                {detailedAnalysis.keyRequirements.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="risks">
            <AccordionTrigger>Risks & Opportunities</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-1">
                {detailedAnalysis.risksAndOpportunities.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="deadlines">
            <AccordionTrigger>Deadlines</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-1">
                {detailedAnalysis.deadlines.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Automated Project Discovery</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Find and analyze biddable projects in a single step.
        </p>
      </div>

      <div className="max-w-2xl mx-auto flex items-center space-x-2 mb-8">
        <Input
          type="search"
          placeholder="e.g., 'งานก่อสร้างถนน กรุงเทพ'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={isLoading}
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Search
        </Button>
      </div>

      {isLoading && (
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Searching and analyzing... this may take a moment.</p>
        </div>
      )}

      {results && (
        <div className="space-y-4">
          {results.projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>{project.organization} - Budget: {project.budget || 'N/A'}</CardDescription>
                    </div>
                    {project.detailedAnalysis && !project.analysisError ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Analyzed
                        </Badge>
                    ) : (
                        <Badge variant="destructive">
                            <AlertTriangle className="mr-2 h-4 w-4" /> Analysis Failed
                        </Badge>
                    )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                    <h4 className="font-semibold text-sm">Initial Analysis</h4>
                    <p className="text-muted-foreground text-sm mt-1">{project.analysis}</p>
                    <div className="flex space-x-4 mt-2 text-xs">
                        <span>Win Chance: <strong>{project.winProbability.toFixed(1)}%</strong></span>
                        <span>Est. Profit: <strong>{project.estimatedProfit.toFixed(1)}%</strong></span>
                    </div>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="detailed-analysis">
                    <AccordionTrigger>
                        <div className="flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            View Detailed Document Analysis
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {renderDetailedAnalysis(project)}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
