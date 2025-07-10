'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Eye,
  FileText,
  Trash2,
  FilePlus,
  Loader2
} from 'lucide-react';
import { getDocumentsFromCollection, deleteDocumentFromCollection } from '@/services/firestore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AnalysisItem {
  id: string;
  title: string;
  summary: string;
  status: string;
  createdAt: string;
}

export default function TORAnalysisList() {
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const { toast } = useToast();
  
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAnalyses();
  }, [currentPage]);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const data = await getDocumentsFromCollection('torAnalyses');
      
      // Sort by creation date (newest first)
      const sortedData = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setAnalyses(sortedData);
      setTotalPages(Math.ceil(sortedData.length / itemsPerPage));
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถโหลดรายการการวิเคราะห์ได้',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnalysis = (id: string) => {
    router.push(`/analysis/tor/${id}`);
  };

  const handleCreateBOQ = (id: string) => {
    router.push(`/procurement/boq/new?from=tor&id=${id}`);
  };

  const handleDeleteAnalysis = async (id: string) => {
    try {
      await deleteDocumentFromCollection('torAnalyses', id);
      setAnalyses(prevAnalyses => prevAnalyses.filter(item => item.id !== id));
      toast({
        title: 'ลบรายการสำเร็จ',
        description: 'ลบผลการวิเคราะห์เอกสาร TOR เรียบร้อยแล้ว',
      });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบรายการได้',
        variant: 'destructive',
      });
    }
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return analyses.slice(startIndex, endIndex);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'analyzed':
        return <Badge variant="outline" className="bg-blue-100/80 text-blue-700 border-blue-200">วิเคราะห์แล้ว</Badge>;
      case 'boq_created':
        return <Badge variant="outline" className="bg-green-100/80 text-green-700 border-green-200">สร้าง BOQ แล้ว</Badge>;
      case 'quotation_created':
        return <Badge variant="outline" className="bg-purple-100/80 text-purple-700 border-purple-200">สร้างใบเสนอราคาแล้ว</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">รายการวิเคราะห์เอกสาร TOR</CardTitle>
        <CardDescription>
          รายการเอกสาร TOR ที่ผ่านการวิเคราะห์ด้วย AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">ยังไม่มีการวิเคราะห์เอกสาร TOR</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => router.push('/analysis/tor/new')}
            >
              <FilePlus className="mr-2 h-4 w-4" />
              สร้างการวิเคราะห์ใหม่
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <TableCaption>รายการวิเคราะห์เอกสาร TOR ทั้งหมด {analyses.length} รายการ</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อโครงการ</TableHead>
                  <TableHead>วันที่สร้าง</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPageItems().map((analysis) => (
                  <TableRow key={analysis.id}>
                    <TableCell className="font-medium">{analysis.title}</TableCell>
                    <TableCell>{formatDate(analysis.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(analysis.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewAnalysis(analysis.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCreateBOQ(analysis.id)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการลบรายการ</AlertDialogTitle>
                              <AlertDialogDescription>
                                คุณต้องการลบผลการวิเคราะห์เอกสาร TOR นี้ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAnalysis(analysis.id)}>ลบรายการ</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Show first page, current page, last page, and pages adjacent to current
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            isActive={page === currentPage}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    
                    // Show ellipsis instead of many pages
                    if (page === 2 && currentPage > 3) {
                      return (
                        <PaginationItem key="ellipsis-start">
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    if (page === totalPages - 1 && currentPage < totalPages - 2) {
                      return (
                        <PaginationItem key="ellipsis-end">
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={fetchAnalyses}
        >
          รีเฟรช
        </Button>
        <Button onClick={() => router.push('/analysis/tor/new')}>
          <FilePlus className="mr-2 h-4 w-4" />
          วิเคราะห์เอกสาร TOR ใหม่
        </Button>
      </CardFooter>
    </Card>
  );
}
