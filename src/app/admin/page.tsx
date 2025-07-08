'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardAnalytics } from '@/components/dashboard-analytics';
import { AdminPerformancePanel } from '@/components/admin-performance-panel';
import { Button } from '@/components/ui/button';
import './admin.css';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileSpreadsheet, Filter, Plus, SquarePen, Trash2, Loader2, Search, SlidersHorizontal, RefreshCw, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { addAdminProject, updateAdminProject, deleteAdminProject, listAdminProjects, addTask, updateTask, deleteTask, listTasks } from '@/services/firestore';
import { AdminProject, Task } from '@/services/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns";

export default function AdminPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<AdminProject[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const { toast } = useToast();
    
    const [isProjectDialogOpen, setProjectDialogOpen] = useState(false);
    const [isTaskDialogOpen, setTaskDialogOpen] = useState(false);
    const [isViewProjectDialogOpen, setViewProjectDialogOpen] = useState(false);
    const [isViewTaskDialogOpen, setViewTaskDialogOpen] = useState(false);
    
    const [currentProject, setCurrentProject] = useState<AdminProject | null>(null);
    const [currentTask, setCurrentTask] = useState<Task | null>(null);
    const [viewingProject, setViewingProject] = useState<AdminProject | null>(null);
    const [viewingTask, setViewingTask] = useState<Task | null>(null);
    
    const [isLoadingProjects, setIsLoadingProjects] = useState(false);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    
    // Search and filter states
    const [projectSearch, setProjectSearch] = useState('');
    const [projectStatusFilter, setProjectStatusFilter] = useState<string>('all');
    const [projectSortField, setProjectSortField] = useState<'name' | 'status' | 'progress' | 'dueDate'>('name');
    const [projectSortDirection, setProjectSortDirection] = useState<'asc' | 'desc'>('asc');
    
    const [taskSearch, setTaskSearch] = useState('');
    const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
    const [taskSortField, setTaskSortField] = useState<'title' | 'priority' | 'time'>('time');
    const [taskSortDirection, setTaskSortDirection] = useState<'asc' | 'desc'>('asc');
    
    // Statistics
    const [stats, setStats] = useState({
        totalProjects: 0,
        completedProjects: 0,
        inProgressProjects: 0,
        pendingProjects: 0,
        issueProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        highPriorityTasks: 0
    });
    
    // Load data on component mount
    useEffect(() => {
        loadProjects();
        loadTasks();
    }, []);
    
    // Update statistics whenever projects or tasks change
    useEffect(() => {
        updateStatistics();
    }, [projects, tasks]);
    
    // Function to update statistics
    const updateStatistics = () => {
        setStats({
            totalProjects: projects.length,
            completedProjects: projects.filter(p => p.status === 'เสร็จสิ้น').length,
            inProgressProjects: projects.filter(p => p.status === 'กำลังดำเนินการ').length,
            pendingProjects: projects.filter(p => p.status === 'รอดำเนินการ').length,
            issueProjects: projects.filter(p => p.status === 'มีปัญหา').length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.checked).length,
            highPriorityTasks: tasks.filter(t => t.priority === 'สูง' && !t.checked).length
        });
    };
    
    // Function to load projects from Firestore
    const loadProjects = async () => {
        setIsLoadingProjects(true);
        try {
            const projectList = await listAdminProjects();
            setProjects(projectList);
        } catch (error) {
            console.error('Failed to load projects:', error);
            toast({
                title: 'Error',
                description: 'Failed to load projects. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingProjects(false);
        }
    };
    
    // Function to load tasks from Firestore
    const loadTasks = async () => {
        setIsLoadingTasks(true);
        try {
            const taskList = await listTasks();
            setTasks(taskList);
        } catch (error) {
            console.error('Failed to load tasks:', error);
            toast({
                title: 'Error',
                description: 'Failed to load tasks. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoadingTasks(false);
        }
    };

    // Delete a project
    const handleDeleteProject = async (id: string) => {
        try {
            await deleteAdminProject(id);
            setProjects(projects.filter(p => p.id !== id));
            toast({
                title: 'Success',
                description: 'Project deleted successfully',
            });
        } catch (error) {
            console.error('Failed to delete project:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete project. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Delete a task
    const handleDeleteTask = async (id: string) => {
        try {
            await deleteTask(id);
            setTasks(tasks.filter(t => t.id !== id));
            toast({
                title: 'Success',
                description: 'Task deleted successfully',
            });
        } catch (error) {
            console.error('Failed to delete task:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete task. Please try again.',
                variant: 'destructive',
            });
        }
    };
    
    // Open the edit project dialog
    const handleEditProject = (project: AdminProject) => {
        setCurrentProject(project);
        setProjectDialogOpen(true);
    }
    
    // Open the edit task dialog
    const handleEditTask = (task: Task) => {
        setCurrentTask(task);
        setTaskDialogOpen(true);
    }
    
    // Open the view project dialog
    const handleViewProject = (project: AdminProject) => {
        setViewingProject(project);
        setViewProjectDialogOpen(true);
    }
    
    // Open the view task dialog
    const handleViewTask = (task: Task) => {
        setViewingTask(task);
        setViewTaskDialogOpen(true);
    }
    
    // Submit the project form (create or update)
    const handleProjectFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const projectData = {
            name: formData.get('project-name') as string,
            desc: formData.get('project-desc') as string,
            status: formData.get('project-status') as string,
            progress: Number(formData.get('project-progress')),
            dueDate: formData.get('project-dueDate') as string,
        };
        
        try {
            if (currentProject) {
                // Update existing project
                await updateAdminProject(currentProject.id, projectData);
                
                // Update local state
                setProjects(projects.map(p => 
                    p.id === currentProject.id 
                        ? { ...p, ...projectData } 
                        : p
                ));
                
                toast({
                    title: 'Success',
                    description: 'Project updated successfully',
                });
            } else {
                // Create new project
                const newProject = await addAdminProject(projectData);
                
                // Update local state
                setProjects([newProject, ...projects]);
                
                toast({
                    title: 'Success',
                    description: 'Project created successfully',
                });
            }
            
            // Reset and close dialog
            setCurrentProject(null);
            setProjectDialogOpen(false);
        } catch (error) {
            console.error('Failed to save project:', error);
            toast({
                title: 'Error',
                description: 'Failed to save project. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Submit the task form (create or update)
    const handleTaskFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const priority = formData.get('task-priority') as string;
        const priorityColorMap: Record<string, string> = {
            "สูง": "bg-red-900/30 text-red-200",
            "ปานกลาง": "bg-yellow-900/30 text-yellow-200",
            "ต่ำ": "bg-blue-900/30 text-blue-200",
            "เสร็จสิ้น": "bg-green-900/30 text-green-200"
        };
        
        const taskData = {
            title: formData.get('task-title') as string,
            priority: priority,
            priorityColor: priorityColorMap[priority] || priorityColorMap["ปานกลาง"],
            time: formData.get('task-due-date') as string,
            checked: currentTask ? currentTask.checked : false,
        };
        
        try {
            if (currentTask) {
                // Update existing task
                await updateTask(currentTask.id, taskData);
                
                // Update local state
                setTasks(tasks.map(t => 
                    t.id === currentTask.id 
                        ? { ...t, ...taskData } 
                        : t
                ));
                
                toast({
                    title: 'Success',
                    description: 'Task updated successfully',
                });
            } else {
                // Create new task
                const newTask = await addTask(taskData);
                
                // Update local state
                setTasks([newTask, ...tasks]);
                
                toast({
                    title: 'Success',
                    description: 'Task created successfully',
                });
            }
            
            // Reset and close dialog
            setCurrentTask(null);
            setTaskDialogOpen(false);
        } catch (error) {
            console.error('Failed to save task:', error);
            toast({
                title: 'Error',
                description: 'Failed to save task. Please try again.',
                variant: 'destructive',
            });
        }
    };
    
    // Toggle task completion status
    const handleToggleTaskComplete = async (task: Task) => {
        try {
            const updatedTask = { ...task, checked: !task.checked };
            
            // If task is now checked, change priority to "เสร็จสิ้น"
            if (updatedTask.checked) {
                updatedTask.priority = "เสร็จสิ้น";
                updatedTask.priorityColor = "bg-green-900/30 text-green-200";
            }
            
            await updateTask(task.id, {
                checked: updatedTask.checked,
                priority: updatedTask.priority,
                priorityColor: updatedTask.priorityColor
            });
            
            // Update local state
            setTasks(tasks.map(t => 
                t.id === task.id 
                    ? updatedTask 
                    : t
            ));
        } catch (error) {
            console.error('Failed to update task status:', error);
            toast({
                title: 'Error',
                description: 'Failed to update task status. Please try again.',
                variant: 'destructive',
            });
        }
    };
    
    // Export projects to CSV
    const handleExportProjects = () => {
        if (!projects.length) return;
        
        // Create CSV content
        const headers = "ID,Name,Description,Status,Progress,Due Date\n";
        const csvContent = projects.reduce((acc, project) => {
            return acc + `${project.id},"${project.name}","${project.desc}","${project.status}",${project.progress},"${project.dueDate}"\n`;
        }, headers);
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `projects-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };
    
    // Export tasks to CSV
    const handleExportTasks = () => {
        if (!tasks.length) return;
        
        // Create CSV content
        const headers = "ID,Title,Priority,Due Date,Completed\n";
        const csvContent = tasks.reduce((acc, task) => {
            return acc + `${task.id},"${task.title}","${task.priority}","${task.time}",${task.checked}\n`;
        }, headers);
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `tasks-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };
    
    // Apply filters and sorting to projects
    const filteredProjects = useMemo(() => {
        let result = [...projects];
        
        // Apply search filter
        if (projectSearch) {
            const searchLower = projectSearch.toLowerCase();
            result = result.filter(p => 
                p.name.toLowerCase().includes(searchLower) || 
                p.desc.toLowerCase().includes(searchLower)
            );
        }
        
        // Apply status filter
        if (projectStatusFilter !== 'all') {
            result = result.filter(p => p.status === projectStatusFilter);
        }
        
        // Apply sorting
        result.sort((a, b) => {
            let comparison = 0;
            
            if (projectSortField === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (projectSortField === 'status') {
                comparison = a.status.localeCompare(b.status);
            } else if (projectSortField === 'progress') {
                comparison = a.progress - b.progress;
            } else if (projectSortField === 'dueDate') {
                comparison = a.dueDate.localeCompare(b.dueDate);
            }
            
            return projectSortDirection === 'asc' ? comparison : -comparison;
        });
        
        return result;
    }, [projects, projectSearch, projectStatusFilter, projectSortField, projectSortDirection]);
    
    // Apply filters and sorting to tasks
    const filteredTasks = useMemo(() => {
        let result = [...tasks];
        
        // Apply search filter
        if (taskSearch) {
            const searchLower = taskSearch.toLowerCase();
            result = result.filter(t => t.title.toLowerCase().includes(searchLower));
        }
        
        // Apply status filter
        if (taskStatusFilter !== 'all') {
            if (taskStatusFilter === 'completed') {
                result = result.filter(t => t.checked);
            } else {
                result = result.filter(t => t.priority === taskStatusFilter && !t.checked);
            }
        }
        
        // Apply sorting
        result.sort((a, b) => {
            let comparison = 0;
            
            if (taskSortField === 'title') {
                comparison = a.title.localeCompare(b.title);
            } else if (taskSortField === 'priority') {
                // Custom priority sort order: High, Medium, Low, Completed
                const priorityOrder: Record<string, number> = {
                    "สูง": 1,
                    "ปานกลาง": 2,
                    "ต่ำ": 3,
                    "เสร็จสิ้น": 4
                };
                comparison = (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
            } else if (taskSortField === 'time') {
                comparison = a.time.localeCompare(b.time);
            }
            
            return taskSortDirection === 'asc' ? comparison : -comparison;
        });
        
        return result;
    }, [tasks, taskSearch, taskStatusFilter, taskSortField, taskSortDirection]);

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
      <h1 className="text-3xl font-headline font-bold">แผงควบคุมผู้ดูแล</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">โครงการทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalProjects}</div>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-primary">{stats.completedProjects}</span> เสร็จสิ้น,{' '}
              <span className="font-medium text-yellow-400">{stats.pendingProjects}</span> รอดำเนินการ
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">โครงการมีปัญหา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.issueProjects}</div>
            <div className="text-sm text-muted-foreground mt-1">
              คิดเป็น {stats.totalProjects ? Math.round((stats.issueProjects / stats.totalProjects) * 100) : 0}% ของโครงการทั้งหมด
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">งานทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalTasks}</div>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-primary">{stats.completedTasks}</span> เสร็จสิ้น,{' '}
              <span className="font-medium text-red-400">{stats.highPriorityTasks}</span> ความสำคัญสูง
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">อัตราความสำเร็จ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalProjects ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-green-400">{stats.completedProjects}</span> โครงการสำเร็จ
            </div>
          </CardContent>
        </Card>
      </div>

      <DashboardAnalytics />
      
      <Card>
        <CardHeader>
            <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <CardTitle>จัดการโครงการ</CardTitle>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleExportProjects}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={loadProjects}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            รีเฟรช
                        </Button>
                        <Dialog open={isProjectDialogOpen} onOpenChange={setProjectDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setCurrentProject(null)}>
                                    <Plus className="mr-2 h-4 w-4" /> เพิ่มโครงการ
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleProjectFormSubmit}>
                                    <DialogHeader>
                                        <DialogTitle>{currentProject ? 'แก้ไขโครงการ' : 'เพิ่มโครงการใหม่'}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="project-name" className="text-right">ชื่อ</Label>
                                            <Input id="project-name" name="project-name" defaultValue={currentProject?.name} className="col-span-3" required />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="project-desc" className="text-right">คำอธิบาย</Label>
                                            <Input id="project-desc" name="project-desc" defaultValue={currentProject?.desc} className="col-span-3" required />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="project-status" className="text-right">สถานะ</Label>
                                            <Select name="project-status" defaultValue={currentProject?.status || "รอดำเนินการ"}>
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="รอดำเนินการ">รอดำเนินการ</SelectItem>
                                                    <SelectItem value="กำลังดำเนินการ">กำลังดำเนินการ</SelectItem>
                                                    <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
                                                    <SelectItem value="มีปัญหา">มีปัญหา</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="project-progress" className="text-right">ความคืบหน้า (%)</Label>
                                            <Input id="project-progress" name="project-progress" type="number" defaultValue={currentProject?.progress} className="col-span-3" min="0" max="100" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="project-dueDate" className="text-right">กำหนดส่ง</Label>
                                            <div className="col-span-3 flex">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !currentProject?.dueDate && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {currentProject?.dueDate || "เลือกวันที่"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            initialFocus
                                                            mode="single"
                                                            onSelect={(date) => {
                                                                const formatted = date ? format(date, 'dd MMM yyyy') : '';
                                                                document.getElementById('project-dueDate')?.setAttribute('value', formatted);
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <Input 
                                                    id="project-dueDate"
                                                    name="project-dueDate"
                                                    type="hidden"
                                                    defaultValue={currentProject?.dueDate}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">บันทึก</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหาโครงการ..."
                            value={projectSearch}
                            onChange={(e) => setProjectSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select 
                        value={projectStatusFilter} 
                        onValueChange={setProjectStatusFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="กรองตามสถานะ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกสถานะ</SelectItem>
                            <SelectItem value="รอดำเนินการ">รอดำเนินการ</SelectItem>
                            <SelectItem value="กำลังดำเนินการ">กำลังดำเนินการ</SelectItem>
                            <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
                            <SelectItem value="มีปัญหา">มีปัญหา</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                        <Select
                            value={projectSortField}
                            onValueChange={(val) => setProjectSortField(val as 'name' | 'status' | 'progress' | 'dueDate')}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="เรียงลำดับตาม" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">ชื่อ</SelectItem>
                                <SelectItem value="status">สถานะ</SelectItem>
                                <SelectItem value="progress">ความคืบหน้า</SelectItem>
                                <SelectItem value="dueDate">กำหนดส่ง</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setProjectSortDirection(projectSortDirection === 'asc' ? 'desc' : 'asc')}
                            title={projectSortDirection === 'asc' ? 'จากน้อยไปมาก' : 'จากมากไปน้อย'}
                        >
                            <SlidersHorizontal className={cn("h-4 w-4", projectSortDirection === 'desc' && "rotate-180")} />
                        </Button>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {isLoadingProjects ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">กำลังโหลดโครงการ...</span>
            </div>
          ) : filteredProjects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อโครงการ</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>ความคืบหน้า</TableHead>
                  <TableHead>กำหนดส่ง</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        project.status === 'เสร็จสิ้น' ? 'bg-green-900/30 text-green-200' : 
                        project.status === 'มีปัญหา' ? 'bg-red-900/30 text-red-200' : 
                        project.status === 'กำลังดำเนินการ' ? 'bg-blue-900/30 text-blue-200' :
                        'bg-yellow-900/30 text-yellow-200'
                      }>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            project.status === 'เสร็จสิ้น' ? 'bg-green-500' : 
                            project.status === 'มีปัญหา' ? 'bg-red-500' : 
                            'bg-primary'
                          } progress-bar-width-${Math.min(Math.max(Math.round(project.progress / 5) * 5, 0), 100)}`} 
                        />
                      </div>
                      <span className="text-xs ml-1">{project.progress}%</span>
                    </TableCell>
                    <TableCell>{project.dueDate}</TableCell>
                    <TableCell className="admin-table-actions">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleViewProject(project)} 
                        title="ดูรายละเอียดแบบป๊อปอัพ"
                      >
                        <Eye className="h-4 w-4 text-primary" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => router.push(`/admin/project-detail/${project.id}`)}
                        title="ดูรายละเอียดแบบเต็มหน้า"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditProject(project)}>
                        <SquarePen className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              {projectSearch || projectStatusFilter !== 'all' ? 
                'ไม่พบโครงการที่ตรงกับการค้นหาหรือตัวกรอง' : 
                'ไม่มีโครงการ โปรดเพิ่มโครงการใหม่'}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
           <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                    <CardTitle>จัดการงาน</CardTitle>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleExportTasks}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={loadTasks}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            รีเฟรช
                        </Button>
                        <Dialog open={isTaskDialogOpen} onOpenChange={setTaskDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={() => setCurrentTask(null)}>
                                    <Plus className="mr-2 h-4 w-4" /> เพิ่มงาน
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleTaskFormSubmit}>
                                    <DialogHeader>
                                        <DialogTitle>{currentTask ? 'แก้ไขงาน' : 'เพิ่มงานใหม่'}</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="task-title" className="text-right">ชื่องาน</Label>
                                            <Input id="task-title" name="task-title" defaultValue={currentTask?.title} className="col-span-3" required />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="task-priority" className="text-right">ความสำคัญ</Label>
                                            <Select name="task-priority" defaultValue={currentTask?.priority || "ปานกลาง"}>
                                                <SelectTrigger className="col-span-3">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="สูง">สูง</SelectItem>
                                                    <SelectItem value="ปานกลาง">ปานกลาง</SelectItem>
                                                    <SelectItem value="ต่ำ">ต่ำ</SelectItem>
                                                    <SelectItem value="เสร็จสิ้น">เสร็จสิ้น</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="task-due-date" className="text-right">กำหนดส่ง</Label>
                                            <div className="col-span-3 flex">
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !currentTask?.time && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {currentTask?.time || "เลือกวันที่"}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            initialFocus
                                                            mode="single"
                                                            onSelect={(date) => {
                                                                const formatted = date ? format(date, 'dd MMM yyyy') : '';
                                                                document.getElementById('task-due-date')?.setAttribute('value', formatted);
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                                <Input 
                                                    id="task-due-date"
                                                    name="task-due-date"
                                                    type="hidden"
                                                    defaultValue={currentTask?.time}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">บันทึก</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="ค้นหางาน..."
                            value={taskSearch}
                            onChange={(e) => setTaskSearch(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select 
                        value={taskStatusFilter} 
                        onValueChange={setTaskStatusFilter}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="กรองตามสถานะ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">ทุกสถานะ</SelectItem>
                            <SelectItem value="สูง">ความสำคัญสูง</SelectItem>
                            <SelectItem value="ปานกลาง">ความสำคัญปานกลาง</SelectItem>
                            <SelectItem value="ต่ำ">ความสำคัญต่ำ</SelectItem>
                            <SelectItem value="completed">เสร็จสิ้นแล้ว</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                        <Select
                            value={taskSortField}
                            onValueChange={(val) => setTaskSortField(val as 'title' | 'priority' | 'time')}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="เรียงลำดับตาม" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="title">ชื่อ</SelectItem>
                                <SelectItem value="priority">ความสำคัญ</SelectItem>
                                <SelectItem value="time">กำหนดส่ง</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setTaskSortDirection(taskSortDirection === 'asc' ? 'desc' : 'asc')}
                            title={taskSortDirection === 'asc' ? 'จากน้อยไปมาก' : 'จากมากไปน้อย'}
                        >
                            <SlidersHorizontal className={cn("h-4 w-4", taskSortDirection === 'desc' && "rotate-180")} />
                        </Button>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {isLoadingTasks ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">กำลังโหลดงาน...</span>
            </div>
          ) : filteredTasks.length > 0 ? (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[40px]"></TableHead>
                    <TableHead>ชื่องาน</TableHead>
                    <TableHead>ความสำคัญ</TableHead>
                    <TableHead>กำหนดส่ง</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredTasks.map((task) => (
                    <TableRow key={task.id} className={cn(task.checked && "text-muted-foreground")}>
                    <TableCell><Checkbox checked={task.checked} onCheckedChange={() => handleToggleTaskComplete(task)} /></TableCell>
                    <TableCell className={cn("font-medium", task.checked && "line-through")}>{task.title}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className={task.priorityColor}>
                        {task.priority}
                        </Badge>
                    </TableCell>
                    <TableCell>{task.time}</TableCell>
                    <TableCell className="admin-table-actions">
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleViewTask(task)} 
                            title="ดูรายละเอียดแบบป๊อปอัพ"
                         >
                            <Eye className="h-4 w-4 text-primary" />
                         </Button>
                         <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => router.push(`/admin/task-detail/${task.id}`)}
                            title="ดูรายละเอียดแบบเต็มหน้า"
                         >
                            <Eye className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)}>
                            <SquarePen className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                {taskSearch || taskStatusFilter !== 'all' ? 
                  'ไม่พบงานที่ตรงกับการค้นหาหรือตัวกรอง' : 
                  'ไม่มีงาน โปรดเพิ่มงานใหม่'}
              </div>
            )}
        </CardContent>
      </Card>
      
      {/* Project Detail View Dialog */}
      <Dialog open={isViewProjectDialogOpen} onOpenChange={setViewProjectDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">รายละเอียดโครงการ</DialogTitle>
          </DialogHeader>
          
          {viewingProject && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{viewingProject.name}</h3>
                <Badge variant="outline" className={
                  viewingProject.status === 'เสร็จสิ้น' ? 'bg-green-900/30 text-green-200' : 
                  viewingProject.status === 'มีปัญหา' ? 'bg-red-900/30 text-red-200' : 
                  viewingProject.status === 'กำลังดำเนินการ' ? 'bg-blue-900/30 text-blue-200' :
                  'bg-yellow-900/30 text-yellow-200'
                }>
                  {viewingProject.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">คำอธิบาย</h4>
                  <p className="text-foreground">{viewingProject.desc}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">กำหนดส่ง</h4>
                  <p className="text-foreground">{viewingProject.dueDate}</p>
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">ความคืบหน้า</h4>
                <div className="flex items-center space-x-4">
                  <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        viewingProject.status === 'เสร็จสิ้น' ? 'bg-green-500' : 
                        viewingProject.status === 'มีปัญหา' ? 'bg-red-500' : 
                        'bg-primary'
                      } progress-bar-width-${Math.min(Math.max(Math.round(viewingProject.progress / 5) * 5, 0), 100)}`} 
                    />
                  </div>
                  <span className="font-semibold">{viewingProject.progress}%</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">วันที่สร้าง</h4>
                  <p className="text-foreground">{viewingProject.createdAt ? format(new Date(viewingProject.createdAt), 'dd MMM yyyy, HH:mm') : 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">อัพเดทล่าสุด</h4>
                  <p className="text-foreground">{viewingProject.updatedAt ? format(new Date(viewingProject.updatedAt), 'dd MMM yyyy, HH:mm') : 'ไม่ระบุ'}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewProjectDialogOpen(false)}>ปิด</Button>
            {viewingProject && (
              <Button onClick={() => {
                setViewProjectDialogOpen(false);
                setCurrentProject(viewingProject);
                setProjectDialogOpen(true);
              }}>แก้ไขโครงการ</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Task Detail View Dialog */}
      <Dialog open={isViewTaskDialogOpen} onOpenChange={setViewTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl">รายละเอียดงาน</DialogTitle>
          </DialogHeader>
          
          {viewingTask && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{viewingTask.title}</h3>
                <Badge variant="outline" className={viewingTask.priorityColor}>
                  {viewingTask.priority}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">สถานะ</h4>
                  <Badge variant={viewingTask.checked ? "success" : "outline"} className="mt-1">
                    {viewingTask.checked ? "เสร็จสิ้น" : "ยังไม่เสร็จ"}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">กำหนดส่ง</h4>
                  <p className="text-foreground">{viewingTask.time}</p>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">วันที่สร้าง</h4>
                  <p className="text-foreground">{viewingTask.createdAt ? format(new Date(viewingTask.createdAt), 'dd MMM yyyy, HH:mm') : 'ไม่ระบุ'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">อัพเดทล่าสุด</h4>
                  <p className="text-foreground">{viewingTask.updatedAt ? format(new Date(viewingTask.updatedAt), 'dd MMM yyyy, HH:mm') : 'ไม่ระบุ'}</p>
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline"
                    className={viewingTask.checked ? "bg-green-900/20" : ""}
                    onClick={() => {
                      handleToggleTaskComplete(viewingTask);
                      setViewTaskDialogOpen(false);
                    }}
                  >
                    <Checkbox 
                      checked={viewingTask.checked} 
                      className="mr-2" 
                    /> 
                    {viewingTask.checked ? "ทำเครื่องหมายว่ายังไม่เสร็จ" : "ทำเครื่องหมายว่าเสร็จสิ้น"}
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewTaskDialogOpen(false)}>ปิด</Button>
            {viewingTask && (
              <Button onClick={() => {
                setViewTaskDialogOpen(false);
                setCurrentTask(viewingTask);
                setTaskDialogOpen(true);
              }}>แก้ไขงาน</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AdminPerformancePanel />
    </div>
  );
}
