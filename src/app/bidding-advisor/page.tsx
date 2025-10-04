

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { z } from 'zod';
import { BiddingStrategyOutputSchema } from '@/ai/flows/strategic-bidding-advisor';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, FileText, Building, Users, Swords, BrainCircuit, ThumbsUp, ThumbsDown, Target, BarChart, Sparkles, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Type for the output of our new automated flow
type BiddingAdvisorOutput = z.infer<typeof BiddingStrategyOutputSchema>;

const SectionCard = ({ icon, title, description, children }: { icon: React.ReactNode, title: string, description: string, children: React.ReactNode }) => (
    <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
            <div className="flex-1">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

const FileDropzone = ({ file, setFile, title }: { file: File | null, setFile: (f: File | null) => void, title: string }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
    }, [setFile]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 });

    return (
        <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors 
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">{title}</p>
            {file && <p className="mt-1 text-xs font-semibold">Selected: {file.name}</p>}
        </div>
    );
};

export default function BiddingAdvisorPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<BiddingAdvisorOutput | null>(null);

    // State for all inputs
    const [projectName, setProjectName] = useState('');
    const [documentUrl, setDocumentUrl] = useState('');
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
    const [boqFile, setBoqFile] = useState<File | null>(null); // NEW: BOQ File
    const [companyCapabilities, setCompanyCapabilities] = useState({ expertise: '', pastProjects: '', resources: '' });
    const [competitors, setCompetitors] = useState([{ name: '', strengths: '', pastWins: '0', pricing: 'standard' }]);

    const handleAddCompetitor = () => {
        setCompetitors([...competitors, { name: '', strengths: '', pastWins: '0', pricing: 'standard' }]);
    };

    const handleGetAdvice = async () => {
        const formData = new FormData();

        // --- Validation and Form Data Assembly ---
        if (!projectName) { toast({ title: 'Project Name is required', variant: 'destructive' }); return; }
        formData.append('projectName', projectName);

        if (documentUrl) {
            formData.append('documentSourceType', 'url');
            formData.append('documentContent', documentUrl);
        } else if (documentFile) {
            formData.append('documentSourceType', 'file');
            formData.append('documentFile', documentFile);
        } else {
            toast({ title: 'Document Source (TOR/Specs) is required', description: 'Please provide a URL or a file for the TOR.', variant: 'destructive' });
            return;
        }

        if (blueprintFile) {
            formData.append('blueprintFile', blueprintFile);
        }
        if (boqFile) { // NEW: Append BOQ file
            formData.append('boqFile', boqFile);
        }

        formData.append('companyCapabilities', JSON.stringify({
            expertise: companyCapabilities.expertise.split(',').map(s => s.trim()),
            pastProjects: companyCapabilities.pastProjects.split(',').map(s => s.trim()),
            resources: companyCapabilities.resources.split(',').map(s => s.trim()),
        }));

        formData.append('competitors', JSON.stringify(competitors.filter(c => c.name).map(c => ({
            ...c,
            pastWins: parseInt(c.pastWins, 10) || 0,
            strengths: c.strengths.split(',').map(s => s.trim()),
        }))));

        setIsLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/bidding-advisor', { method: 'POST', body: formData });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to get advice.');
            }
            const data = await response.json();
            setResult(data);
            toast({ title: "The God of Bidding has spoken!", description: "Strategic advice has been rendered." });
        } catch (error) {
            toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold tracking-tight">The God of Bidding</h1>
                <p className="text-lg text-muted-foreground mt-2">Your Ultimate Strategic Bidding Advisor</p>
            </div>

            {!result && (
                <div className="max-w-4xl mx-auto space-y-6">
                    <SectionCard icon={<FileText />} title="Project Documents" description="Provide the main TOR/Specification, Blueprint, and BOQ.">
                        <div className="space-y-4">
                            <Input placeholder="Project Name (e.g., 'Construction of Rama 9 Tower')" value={projectName} onChange={e => setProjectName(e.target.value)} />
                            <Input placeholder="TOR/Specification URL (Optional if uploading a file)" value={documentUrl} onChange={e => setDocumentUrl(e.target.value)} />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FileDropzone file={documentFile} setFile={setDocumentFile} title="Drag & drop TOR/Spec file here" />
                                <FileDropzone file={blueprintFile} setFile={setBlueprintFile} title="Drag & drop Blueprint file here" />
                                <FileDropzone file={boqFile} setFile={setBoqFile} title="Drag & drop BOQ file here" />
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard icon={<Building />} title="Our Company's Capabilities" description="Be honest about our strengths and experience. Use comma-separated values.">
                        <div className="space-y-2">
                            <Textarea placeholder="Expertise (e.g., high-rise construction, electrical systems)" value={companyCapabilities.expertise} onChange={e => setCompanyCapabilities({ ...companyCapabilities, expertise: e.target.value })} />
                            <Textarea placeholder="Past Projects (e.g., Siam Paragon, Suvarnabhumi Airport)" value={companyCapabilities.pastProjects} onChange={e => setCompanyCapabilities({ ...companyCapabilities, pastProjects: e.target.value })} />
                            <Textarea placeholder="Resources (e.g., 50 engineers, heavy machinery)" value={companyCapabilities.resources} onChange={e => setCompanyCapabilities({ ...companyCapabilities, resources: e.target.value })} />
                        </div>
                    </SectionCard>

                    <SectionCard icon={<Swords />} title="Competitor Intelligence" description="Information about potential competitors. Add as many as you know.">
                        {competitors.map((c, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 p-2 border rounded-lg">
                                <Input placeholder="Competitor Name" value={c.name} onChange={e => { const newComps = [...competitors]; newComps[i].name = e.target.value; setCompetitors(newComps); }} />
                                <Input placeholder="Strengths (comma-separated)" value={c.strengths} onChange={e => { const newComps = [...competitors]; newComps[i].strengths = e.target.value; setCompetitors(newComps); }} />
                                <Input type="number" placeholder="Past Wins" value={c.pastWins} onChange={e => { const newComps = [...competitors]; newComps[i].pastWins = e.target.value; setCompetitors(newComps); }} />
                                <select value={c.pricing} onChange={e => { const newComps = [...competitors]; newComps[i].pricing = e.target.value; setCompetitors(newComps); }} className="w-full p-2 border rounded-md bg-background">
                                    <option value="standard">Standard Pricing</option>
                                    <option value="aggressive">Aggressive Pricing</option>
                                    <option value="premium">Premium Pricing</option>
                                </select>
                            </div>
                        ))}
                        <Button onClick={handleAddCompetitor} variant="outline" size="sm">Add Competitor</Button>
                    </SectionCard>

                    <div className="text-center pt-4">
                        <Button onClick={handleGetAdvice} disabled={isLoading} size="lg">
                            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BrainCircuit className="mr-2 h-5 w-5" />}
                            Render Divine Judgement
                        </Button>
                    </div>
                </div>
            )}

            {result && (
                <div className="max-w-4xl mx-auto space-y-6">
                    <Card className={`border-2 ${result.goNoGoRecommendation === 'GO' ? 'border-green-500' : 'border-red-500'}`}>
                        <CardHeader className="text-center">
                            <div className="flex items-center justify-center gap-4">
                                {result.goNoGoRecommendation === 'GO' ? <ThumbsUp className="h-12 w-12 text-green-500" /> : <ThumbsDown className="h-12 w-12 text-red-500" />}
                                <div>
                                    <CardTitle className="text-3xl">Final Recommendation: {result.goNoGoRecommendation}</CardTitle>
                                    <CardDescription className="text-lg">Confidence Score: {result.confidenceScore.toFixed(1)}%</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {result.forensicCheckReport && (
                        <SectionCard icon={<AlertTriangle className="text-orange-500" />} title="Forensic Document Check Report" description="Discrepancies and inconsistencies found across documents.">
                            <p className="text-muted-foreground mb-4">Overall Assessment: {result.forensicCheckReport.overallAssessment}</p>
                            {result.forensicCheckReport.discrepancyReport.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                    {result.forensicCheckReport.discrepancyReport.map((item, i) => (
                                        <AccordionItem key={i} value={`discrepancy-${i}`}>
                                            <AccordionTrigger>
                                                <Badge variant={item.severity === 'High' ? 'destructive' : item.severity === 'Medium' ? 'secondary' : 'outline'}>
                                                    {item.severity}
                                                </Badge>
                                                <span className="ml-2">{item.itemDescription} ({item.discrepancyType})</span>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <p className="text-sm text-muted-foreground"><strong>Details:</strong> {item.details}</p>
                                                <p className="text-sm text-muted-foreground mt-1"><strong>Recommendation:</strong> {item.recommendation}</p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <p className="text-green-500">No significant discrepancies found. Documents appear consistent.</p>
                            )}
                        </SectionCard>
                    )}

                    <SectionCard icon={<Target className="text-primary" />} title="Winning Rationale & Bid Price" description="The core strategy for victory.">
                        <p className="font-bold text-lg mb-2">Optimal Bid Price: <span className="text-primary">{result.optimalBidPrice}</span></p>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                            {result.winningRationale.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                    </SectionCard>

                    <SectionCard icon={<Sparkles className="text-primary" />} title="Key Proposal Themes" description="Focus your proposal on these key selling points.">
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                            {result.keyProposalThemes.map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                    </SectionCard>

                    <SectionCard icon={<BarChart className="text-primary" />} title="Strategic SWOT Analysis" description="A synthesis of all data points.">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">Strengths</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">{result.strategicSwotAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Weaknesses</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">{result.strategicSwotAnalysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Opportunities</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">{result.strategicSwotAnalysis.opportunities.map((o, i) => <li key={i}>{o}</li>)}</ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Threats</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">{result.strategicSwotAnalysis.threats.map((t, i) => <li key={i}>{t}</li>)}</ul>
                            </div>
                        </div>
                    </SectionCard>

                    <div className="text-center pt-4">
                        <Button onClick={() => setResult(null)} variant="outline">Analyze Another Project</Button>
                    </div>
                </div>
            )}
        </div>
    );
}