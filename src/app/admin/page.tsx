'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { Plus, SquarePen, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const initialProjects = [
    {id:"proj1",name:"เว็บไซต์บริษัท ABC",desc:"เว็บไซต์องค์กร",status:"เสร็จสิ้น",progress:100,dueDate:"15 ก.ย. 2023"},
    {id:"proj2",name:"แอปพลิเคชันมือถือ",desc:"แอปสำหรับลูกค้า",status:"กำลังดำเนินการ",progress:75,dueDate:"30 ก.ย. 2023"},
    {id:"proj3",name:"ระบบ CRM",desc:"ระบบจัดการลูกค้า",status:"รอดำเนินการ",progress:30,dueDate:"15 ต.ค. 2023"},
    {id:"proj4",name:"ระบบจัดการโรงแรม",desc:"ระบบจองห้องพัก",status:"มีปัญหา",progress:60,dueDate:"5 ต.ค. 2023"},
    {id:"proj5",name:"ระบบจัดการคลังสินค้า",desc:"ระบบติดตามสินค้า",status:"กำลังดำเนินการ",progress:10,dueDate:"30 พ.ย. 2023"}
];

const initialTasks = [
  {id:"task1",title:"ประชุมทีมพัฒนาโปรเจค ABC",priority:"สูง",priorityColor:"bg-red-900/30 text-red-200",time:"วันนี้ 14:00",checked:false},
  {id:"task2",title:"ส่งรายงานความคืบหน้าประจำเดือน",priority:"ปานกลาง",priorityColor:"bg-yellow-900/30 text-yellow-200",time:"พรุ่งนี้ 17:00",checked:false},
  {id:"task3",title:"ตรวจสอบข้อผิดพลาดในระบบ C",priority:"เสร็จสิ้น",priorityColor:"bg-green-900/30 text-green-200",time:"เสร็จเมื่อ 2 ชั่วโมงที่แล้ว",checked:true},
  {id:"task4",title:"เตรียมเอกสารสำหรับการประมูลโครงการใหม่",priority:"ต่ำ",priorityColor:"bg-blue-900/30 text-blue-200",time:"30 ต.ค. 2023",checked:false}
];


export default function AdminPage() {
    const [projects, setProjects] = useState(initialProjects);
    const [tasks, setTasks] = useState(initialTasks);
    
    const [isProjectDialogOpen, setProjectDialogOpen] = useState(false);
    const [isTaskDialogOpen, setTaskDialogOpen] = useState(false);

    const [currentProject, setCurrentProject] = useState(null);
    const [currentTask, setCurrentTask] = useState(null);

    const handleDeleteProject = (id: string) => {
        setProjects(projects.filter(p => p.id !== id));
    };

    const handleDeleteTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id));
    };
    
    const handleEditProject = (project: any) => {
        setCurrentProject(project);
        setProjectDialogOpen(true);
    }
    
    const handleEditTask = (task: any) => {
        setCurrentTask(task);
        setTaskDialogOpen(true);
    }
    
    const handleProjectFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newProjectData = {
            id: currentProject ? currentProject.id : `proj${Date.now()}`,
            name: formData.get('project-name') as string,
            desc: formData.get('project-desc') as string,
            status: formData.get('project-status') as string,
            progress: Number(formData.get('project-progress')),
            dueDate: formData.get('project-dueDate') as string,
        };
        
        if (currentProject) {
            setProjects(projects.map(p => p.id === currentProject.id ? newProjectData : p));
        } else {
            setProjects([newProjectData, ...projects]);
        }
        
        setCurrentProject(null);
        setProjectDialogOpen(false);
    };

    const handleTaskFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const priority = formData.get('task-priority') as string;
        const priorityColorMap = {
            "สูง": "bg-red-900/30 text-red-200",
            "ปานกลาง": "bg-yellow-900/30 text-yellow-200",
            "ต่ำ": "bg-blue-900/30 text-blue-200"
        }
        
        const newTaskData = {
            id: currentTask ? currentTask.id : `task${Date.now()}`,
            title: formData.get('task-title') as string,
            priority: priority,
            priorityColor: priorityColorMap[priority as keyof typeof priorityColorMap],
            time: formData.get('task-due-date') as string,
            checked: !!currentTask && currentTask.checked,
        };
        
        if (currentTask) {
            setTasks(tasks.map(t => t.id === currentTask.id ? newTaskData : t));
        } else {
            setTasks([newTaskData, ...tasks]);
        }
        
        setCurrentTask(null);
        setTaskDialogOpen(false);
    }

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
      <h1 className="text-3xl font-headline font-bold">แผงควบคุมผู้ดูแล</h1>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>จัดการโครงการ</CardTitle>
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
                                    <Input id="project-progress" name="project-progress" type="number" defaultValue={currentProject?.progress} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="project-dueDate" className="text-right">กำหนดส่ง</Label>
                                    <Input id="project-dueDate" name="project-dueDate" type="text" defaultValue={currentProject?.dueDate} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">บันทึก</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </CardHeader>
        <CardContent>
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
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell><Badge variant="outline">{project.status}</Badge></TableCell>
                  <TableCell>{project.progress}%</TableCell>
                  <TableCell>{project.dueDate}</TableCell>
                  <TableCell className="admin-table-actions">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
           <div className="flex justify-between items-center">
            <CardTitle>จัดการงาน</CardTitle>
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
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="task-due-date" className="text-right">กำหนดส่ง</Label>
                                    <Input id="task-due-date" name="task-due-date" defaultValue={currentTask?.time} className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">บันทึก</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[40px]"><Checkbox /></TableHead>
                    <TableHead>ชื่องาน</TableHead>
                    <TableHead>ความสำคัญ</TableHead>
                    <TableHead>กำหนดส่ง</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {tasks.map((task) => (
                    <TableRow key={task.id} className={cn(task.checked && "text-muted-foreground")}>
                    <TableCell><Checkbox checked={task.checked} onCheckedChange={() => setTasks(tasks.map(t => t.id === task.id ? {...t, checked: !t.checked} : t))} /></TableCell>
                    <TableCell className={cn("font-medium", task.checked && "line-through")}>{task.title}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className={task.priorityColor}>
                        {task.priority}
                        </Badge>
                    </TableCell>
                    <TableCell>{task.time}</TableCell>
                    <TableCell className="admin-table-actions">
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
        </CardContent>
      </Card>
    </div>
  );
}
