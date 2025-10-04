'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { Search, ExternalLink, Globe, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
  title: string;
  description: string;
  url: string;
  age?: string;
}

export default function RealSearchPage() {
  const [query, setQuery] = useState('งานประมูล ก่อสร้าง');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchInfo, setSearchInfo] = useState<any>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setSearchInfo(null);

    try {
      const response = await fetch('/api/search-real-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'ค้นหาไม่สำเร็จ');
      }

      setResults(data.results || []);
      setSearchInfo({
        total: data.total,
        source: data.source,
        timestamp: data.timestamp,
      });
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาดในการค้นหา');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const ResultSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-2" />
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="ค้นหางานประมูลจริงจากอินเทอร์เน็ต"
        description="ค้นหางานประมูลจากเว็บไซต์ภาครัฐและเอกชนด้วย Brave Search API"
        extra={
          <Button variant="outline" size="sm" asChild>
            <Link href="/procurement">
              <Sparkles className="mr-2 h-4 w-4" />
              ค้นหาแบบ AI
            </Link>
          </Button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        {/* Search Bar */}
        <div className="flex gap-2 mb-6">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="เช่น 'งานประมูล ก่อสร้าง โรงพยาบาล' หรือ 'e-GP ระบบไฟฟ้า'"
            className="flex-grow bg-card"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
          </Button>
        </div>

        {/* Info Banner */}
        <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Globe className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">ค้นหาจากแหล่งข้อมูลจริง</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>ระบบ e-Government Procurement (e-GP)</li>
                  <li>เว็บไซต์จัดซื้อจัดจ้างของหน่วยงานรัฐ</li>
                  <li>เว็บไซต์ประกาศประมูลภาคเอกชน</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <ResultSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-500">เกิดข้อผิดพลาด</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Info */}
        {searchInfo && !loading && (
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              พบ <strong className="text-foreground">{searchInfo.total}</strong> ผลลัพธ์
              จาก <Badge variant="secondary">{searchInfo.source}</Badge>
            </span>
            <span className="text-xs">
              {new Date(searchInfo.timestamp).toLocaleString('th-TH')}
            </span>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !loading && (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg leading-tight">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors flex items-start gap-2"
                      >
                        <span className="flex-1">{result.title}</span>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 mt-1" />
                      </a>
                    </CardTitle>
                  </div>
                  {result.age && (
                    <Badge variant="outline" className="w-fit text-xs">
                      {result.age}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.description}
                  </p>
                  <div className="mt-3 pt-3 border-t">
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline break-all"
                    >
                      {result.url}
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && !loading && !error && searchInfo && (
          <Card>
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                ไม่พบผลลัพธ์สำหรับ "{query}"
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                ลองใช้คำค้นหาอื่นหรือเปลี่ยนคำสำคัญ
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
