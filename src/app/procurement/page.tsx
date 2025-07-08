'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { Search, BrainCircuit, FileDown, Target, TrendingUp, Sparkles, Building2 } from 'lucide-react';
import { findBiddableProjects, FindBiddableProjectsOutput } from '@/ai/flows/find-biddable-projects';
import Link from 'next/link';
import './procurement.css';

export default function ProcurementPage() {
  const [query, setQuery] = useState('ก่อสร้าง'); // Changed default query to match mock data
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FindBiddableProjectsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await findBiddableProjects({ query });
      setResults(res);
    } catch (e) {
      setError('เกิดข้อผิดพลาดในการค้นหาโครงการ ขออภัยในความไม่สะดวก');
      console.error(e);
    }
    setLoading(false);
  };
  
  // Automatically run search on initial load
  useEffect(() => {
    handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ProjectCardSkeleton = () => (
    <Card className="flex flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex justify-between items-center pt-4">
            <div className="w-1/2">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-5 w-full" />
            </div>
            <div className="w-1/2 text-right">
                <Skeleton className="h-4 w-24 mb-1 ml-auto" />
                <Skeleton className="h-5 w-full" />
            </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="ค้นหางานประมูลอัจฉริยะ"
        description="ให้ AI ค้นหาและวิเคราะห์โครงการที่น่าสนใจสำหรับคุณ"
      />
      <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <div className="flex gap-2 mb-8">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="เช่น 'โครงการก่อสร้างโรงพยาบาลภาครัฐ' หรือ 'งานระบบไฟฟ้าในภาคตะวันออก'"
            className="flex-grow bg-card"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
          </Button>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        )}

        {error && <p className="text-destructive text-center">{error}</p>}
        
        {results && (
          <div className="procurement-results grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.projects.map((project, index) => (
              <Card key={index} className="flex flex-col project-card-procurement">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={project.type === 'ภาครัฐ' ? 'secondary' : 'outline'} className={project.type === 'ภาครัฐ' ? 'bg-cyan-900/50 text-cyan-300' : 'bg-amber-900/50 text-amber-300'}>{project.type}</Badge>
                  </div>
                  <CardDescription>{project.organization}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <Sparkles className="inline-block w-4 h-4 mr-1 text-primary/80" />
                    {project.analysis}
                  </p>
                  
                  <div className="space-y-2 text-sm pt-4 border-t border-border">
                    <div className="flex items-start gap-2 text-muted-foreground">
                        <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{project.address}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-4">
                    <div>
                      <div className="flex justify-between items-center text-sm mb-1">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Target className="w-4 h-4" />โอกาสชนะ</span>
                        <span className="font-semibold text-primary">{project.winProbability}%</span>
                      </div>
                      <Progress value={project.winProbability} indicatorClassName="bg-primary" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-sm mb-1">
                         <span className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-4 h-4" />กำไรคาดการณ์</span>
                         <span className="font-semibold text-green-400">{project.estimatedProfit}%</span>
                      </div>
                      <Progress value={project.estimatedProfit} indicatorClassName="bg-green-500" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2">
                    <div className="text-2xl font-bold text-center w-full pb-2">฿{project.budget}</div>
                    <div className="w-full grid grid-cols-2 gap-2">
                        <Button className="w-full" variant="outline" asChild>
                            <a href={project.documentUrl} target="_blank" rel="noopener noreferrer">
                                <FileDown className="mr-2 h-4 w-4" />
                                เอกสาร
                            </a>
                        </Button>
                        <Button className="w-full" asChild>
                            <Link href="/analysis">
                                <BrainCircuit className="mr-2 h-4 w-4" />
                                วิเคราะห์เชิงลึก
                            </Link>
                        </Button>
                    </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
