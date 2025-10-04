# ProjectFlow AI - Copilot Instructions

## Architecture Overview

**Project Type**: Next.js 14 with App Router + Firebase/Firestore + AI (Google Genkit)
**Language**: Thai/English bilingual project with Thai-first UI

### Core Data Flow Pattern
- **Server Actions**: All Firestore operations use `'use server'` directives (`src/services/firestore.ts`)
- **Type-Safe Data Layer**: Firestore documents mapped to TypeScript interfaces (AdminProject, Task, Project, Contact)
- **Timestamp Handling**: Firestore Timestamps converted to ISO strings before client components via `timestampToString()`

## Key Service Boundaries

### 1. Firestore Service (`src/services/firestore.ts`)
Primary data layer with standardized CRUD patterns:
```typescript
// Standard pattern for all entities
export async function list{Entity}(): Promise<{Entity}[]>
export async function add{Entity}(data): Promise<{Entity}>
export async function update{Entity}(id, data): Promise<void>
export async function delete{Entity}(id): Promise<void>
export async function get{Entity}(id): Promise<{Entity} | null>
```

Core entities: `AdminProject`, `Task`, `Project` (procurement), `Contact`

### 2. AI Service (`src/ai/genkit.ts`)
Three specialized Genkit configurations:
- `ai`: General purpose (temp: 0.3, tokens: 2048)
- `procurementAI`: High-precision analysis (temp: 0.2, tokens: 4096) 
- `marketAI`: Financial analysis (temp: 0.25, tokens: 3072)

### 3. Logger (`src/lib/logger.ts`)
Structured logging with firestore-specific helpers:
```typescript
logger.firestore.operation("adding", "adminProjects", id);
logger.firestore.error("fetching", "projects", error);
```

## Critical Patterns

### Thai Status System
Project/Task statuses use Thai strings:
- `เสร็จสิ้น` (Complete), `กำลังดำเนินการ` (In Progress)
- `รอดำเนินการ` (Pending), `มีปัญหา` (Issues)
- Priority: `สูง` (High), `ปานกลาง` (Medium), `ต่ำ` (Low)

### Component Architecture
- **Admin Dashboard**: `src/app/admin/page.tsx` - Full-featured CRUD with filtering/sorting/export
- **Layout System**: `src/components/layout/app-layout.tsx` with sidebar navigation
- **Real-time Features**: Performance monitoring (`AdminPerformancePanel`), notifications

### State Management Pattern
Local state + optimistic updates:
```typescript
// Update Firestore first, then local state
await updateAdminProject(id, data);
setProjects(projects.map(p => p.id === id ? {...p, ...data} : p));
```

## Developer Workflows

### Environment Setup
Required env vars (see `.env.example`):
```bash
NEXT_PUBLIC_FIREBASE_* # Firebase config
GOOGLE_GENAI_API_KEY   # For AI features
```

### Build Commands
```bash
npm run dev          # Development server
npm run genkit:dev   # AI development mode
npm run build        # Production build
npm run typecheck    # TypeScript validation
```

### Database Seeding
Use `/admin/seed` or `/admin/data-management` pages for populating Firestore with sample data.

## AI Integration Points

### Procurement Search (`src/ai/flows/find-biddable-projects.ts`)
- Bypasses AI in debugging mode, queries Firestore directly
- Uses `procurementAI` configuration for production analysis
- Supports Thai/English keyword enhancement

### Project Analysis
- Material cost analysis with `MaterialAnalysisSchema`
- Budget forecasting with three-tier pricing (budget/standard/premium)
- Risk assessment and timeline prediction

## Cross-Component Communication

### Toast System
Consistent success/error messaging:
```typescript
import { useToast } from '@/hooks/use-toast';
toast({ title: 'Success', description: 'Operation completed' });
```

### Navigation Structure
- `/admin` - Main dashboard with project/task management
- `/procurement` - AI-powered project search
- `/reports` - Analytics and KPI dashboard
- `/admin/seed` - Database initialization

## Firebase Patterns

### Document Structure
Collections: `adminProjects`, `tasks`, `projects`, `contacts`
All documents include `createdAt`/`updatedAt` serverTimestamps

### Query Patterns
```typescript
const q = query(collection(db, 'adminProjects'), orderBy('name'));
// Always handle Firestore initialization checks
const db = getDb();
if (!db) throw new Error('Firestore not initialized');
```

When contributing to this codebase:
1. **Use Thai for UI text** - Follow existing bilingual pattern
2. **Handle Firestore Timestamps** - Convert to ISO strings for client components  
3. **Follow CRUD patterns** - Use established service layer conventions
4. **Add proper logging** - Use structured logging with context
5. **Test with sample data** - Use seeding utilities for development
