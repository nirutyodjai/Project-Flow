'use client';

import React, { useState } from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
  showFilters?: boolean;
}

export interface SearchFilters {
  category?: string;
  status?: string;
  dateRange?: string;
  sortBy?: string;
}

/**
 * 🔍 Advanced Search Component
 * ค้นหาแบบขั้นสูงพร้อม Filters
 */
export function AdvancedSearch({ 
  onSearch, 
  placeholder = 'ค้นหา...', 
  showFilters = true 
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'อาคารสำนักงาน',
    'โรงพยาบาล',
    'ระบบไฟฟ้า',
  ]);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, filters);
      
      // Add to recent searches
      if (!recentSearches.includes(query)) {
        setRecentSearches([query, ...recentSearches.slice(0, 4)]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({});
    onSearch('', {});
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(query, newFilters);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="pl-10 pr-24 h-12 text-lg"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          {(query || activeFilterCount > 0) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearSearch}
              className="h-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {showFilters && (
            <Button
              size="sm"
              variant={showFilterPanel ? 'default' : 'outline'}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="h-8"
            >
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1 min-w-[20px] h-5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">ค้นหาล่าสุด:</span>
          {recentSearches.map((search, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => {
                setQuery(search);
                onSearch(search, filters);
              }}
            >
              {search}
            </Badge>
          ))}
        </div>
      )}

      {/* Filter Panel */}
      {showFilterPanel && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h3 className="font-semibold">ตัวกรอง</h3>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setFilters({});
                onSearch(query, {});
              }}
            >
              ล้างทั้งหมด
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">หมวดหมู่</label>
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilter('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="construction">ก่อสร้าง</SelectItem>
                  <SelectItem value="electrical">ไฟฟ้า</SelectItem>
                  <SelectItem value="plumbing">ประปา</SelectItem>
                  <SelectItem value="hvac">ปรับอากาศ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">สถานะ</label>
              <Select
                value={filters.status}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">กำลังดำเนินการ</SelectItem>
                  <SelectItem value="pending">รอดำเนินการ</SelectItem>
                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                  <SelectItem value="cancelled">ยกเลิก</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">ช่วงเวลา</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => updateFilter('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">วันนี้</SelectItem>
                  <SelectItem value="week">สัปดาห์นี้</SelectItem>
                  <SelectItem value="month">เดือนนี้</SelectItem>
                  <SelectItem value="year">ปีนี้</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">เรียงตาม</label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilter('sortBy', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ล่าสุด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">ล่าสุด</SelectItem>
                  <SelectItem value="oldest">เก่าสุด</SelectItem>
                  <SelectItem value="name">ชื่อ (A-Z)</SelectItem>
                  <SelectItem value="budget">งบประมาณ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
