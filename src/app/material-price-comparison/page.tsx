'use client';

import { useState } from 'react';
import { Search, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface MaterialResult {
  supplier: string;
  price: number;
  unit: string;
  discount: number;
  netPrice: number;
  stock: string;
  delivery: string;
  rating: number;
}

export default function MaterialPriceComparisonPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<MaterialResult[]>([]);

  const searchPrices = async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`http://localhost:8000/api/materials/compare?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      // Sort results by netPrice, lowest first
      data.sort((a: MaterialResult, b: MaterialResult) => a.netPrice - b.netPrice);
      setResults(data);
    } catch (error) {
      console.error('Failed to fetch material prices:', error);
      alert('เกิดข้อผิดพลาดในการค้นหาข้อมูล');
    } finally {
      setSearching(false);
    }
  };

  const loadExample = () => {
    setSearchTerm('สายไฟ THW 2.5 sq.mm');
  };

  const lowestPrice = results.length > 0 ? Math.min(...results.map(r => r.netPrice)) : 0;
  const savings = results.length > 0 ? Math.max(...results.map(r => r.netPrice)) - lowestPrice : 0;
  const savingsPercent = results.length > 0 ? (savings / Math.max(...results.map(r => r.netPrice))) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Store className="w-12 h-12 text-green-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              เปรียบเทียบราคาวัสดุ
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            ค้นหาราคาถูกที่สุด ประหยัดต้นทุน เพิ่มกำไร
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาวัสดุ เช่น สายไฟ THW 2.5, ท่อ PVC 2 นิ้ว"
                onKeyPress={(e) => e.key === 'Enter' && searchPrices()}
                className="text-lg"
              />
              <Button onClick={searchPrices} disabled={searching} size="lg">
                <Search className="mr-2 h-4 w-4" />
                {searching ? 'กำลังค้นหา...' : 'ค้นหา'}
              </Button>
              <Button onClick={loadExample} variant="outline" size="lg">
                ตัวอย่าง
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Savings Summary */}
        {results.length > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-sm opacity-90 mb-2">ประหยัดได้สูงสุด</div>
                <div className="text-5xl font-bold mb-2">
                  {savings.toFixed(2)} บาท/{results[0]?.unit}
                </div>
                <div className="text-lg opacity-90">
                  ({savingsPercent.toFixed(1)}% ถูกกว่า)
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">
              ผลการค้นหา ({results.length} ร้าน)
            </h2>
            
            {results.map((result, index) => {
              const isLowest = result.netPrice === lowestPrice;
              
              return (
                <Card
                  key={index}
                  className={`${
                    isLowest
                      ? 'border-2 border-green-500 bg-green-50'
                      : ''
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{result.supplier}</h3>
                          {isLowest && (
                            <Badge className="bg-green-600">
                              ⭐ ถูกที่สุด
                            </Badge>
                          )}
                          <Badge variant="outline">
                            ⭐ {result.rating}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">ราคาตั้ง</div>
                            <div className="font-semibold line-through text-gray-400">
                              {result.price} บาท/{result.unit}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-muted-foreground">ส่วนลด</div>
                            <div className="font-semibold text-orange-600">
                              -{result.discount}%
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-muted-foreground">สต็อก</div>
                            <div className="font-semibold">
                              {result.stock}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-muted-foreground">จัดส่ง</div>
                            <div className="font-semibold">
                              {result.delivery}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="text-3xl font-bold text-green-600">
                          {result.netPrice}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          บาท/{result.unit}
                        </div>
                        
                        {!isLowest && (
                          <div className="text-xs text-red-600 mt-1">
                            +{(result.netPrice - lowestPrice).toFixed(2)} บาท
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Popular Materials */}
        {results.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>วัสดุยอดนิยม</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['สายไฟ THW', 'ท่อ PVC', 'เต้ารับ', 'สวิตช์', 'คอนกรีต', 'เหล็กเส้น', 'อิฐ', 'ปูนซีเมนต์'].map((material) => (
                  <Button
                    key={material}
                    variant="outline"
                    onClick={() => {
                      setSearchTerm(material);
                      setTimeout(searchPrices, 100);
                    }}
                    className="justify-start"
                  >
                    {material}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
