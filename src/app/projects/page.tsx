'use client';

import React, { useEffect, useState } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataManager, type Project } from '@/lib/data-manager';
import { ProjectCard } from '@/components/project-card';
import { AdvancedSearch, type SearchFilters } from '@/components/advanced-search';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const data = DataManager.getProjects();
    setProjects(data);
    setFilteredProjects(data);
  };

  const handleSearch = (query: string, filters: SearchFilters) => {
    let results = [...projects];

    // Text search
    if (query) {
      results = DataManager.searchProjects(query);
    }

    // Apply filters
    if (filters.status) {
      results = results.filter(p => p.status === filters.status);
    }

    if (filters.category) {
      results = results.filter(p => 
        p.type.toLowerCase().includes(filters.category?.toLowerCase() || '')
      );
    }

    // Sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          results.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case 'oldest':
          results.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        case 'name':
          results.sort((a, b) => a.name.localeCompare(b.name, 'th'));
          break;
        case 'budget':
          results.sort((a, b) => {
            const budgetA = Number(a.budget.replace(/,/g, ''));
            const budgetB = Number(b.budget.replace(/,/g, ''));
            return budgetB - budgetA;
          });
          break;
      }
    }

    setFilteredProjects(results);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="pb-5 border-b border-border flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-headline font-bold leading-7">
              จัดการโครงการ
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              โครงการทั้งหมด {filteredProjects.length} รายการ
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button>
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              เพิ่มโครงการ
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-6">
          <AdvancedSearch
            onSearch={handleSearch}
            placeholder="ค้นหาโครงการ..."
            showFilters={true}
          />
        </div>

        {/* Projects Grid/List */}
        <div className={cn(
          "mt-6",
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
        )}>
          {filteredProjects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">ไม่พบโครงการ</p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => console.log('View project:', project.id)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
