'use server';
import { getDb } from './firebase';
import { collection, getDocs, doc, deleteDoc, DocumentData, addDoc, updateDoc, getDoc, serverTimestamp, query, orderBy, Timestamp, where } from 'firebase/firestore';
import type { Contact, Project } from './mock-data';
import { logger } from '@/lib/logger';

// Re-export types for use in other parts of the application
export type { Project, Contact };

// Define Task type for our admin dashboard
export interface Task {
  id: string;
  title: string;
  priority: string;
  priorityColor: string;
  time: string;
  checked: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// Define AdminProject type that matches what we use in the admin dashboard
export interface AdminProject {
  id: string;
  name: string;
  desc: string;
  status: string;
  progress: number;
  dueDate: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// Helper to convert Firestore document data to our Project type
const mapDocToProject = (doc: DocumentData): Project => ({
    id: doc.id,
    name: doc.name || '',
    organization: doc.organization || null,
    type: doc.type || null,
    budget: doc.budget || null,
    address: doc.address || null,
    contactPerson: doc.contactPerson || null,
    phone: doc.phone || null,
    documentUrl: doc.documentUrl || null,
    bidSubmissionDeadline: doc.bidSubmissionDeadline || null,
});

// Helper to convert Firestore document data to our Contact type
const mapDocToContact = (doc: DocumentData): Contact => ({
    id: doc.id,
    type: doc.type || '',
    name: doc.name || '',
    email: doc.email || null,
    phone: doc.phone || null,
    address: doc.address || null,
    contactPerson: doc.contactPerson || null,
});

// Helper to convert Firestore timestamp to string
const timestampToString = (timestamp: any): string | null => {
    if (!timestamp) return null;
    if (timestamp.toDate) {
        return timestamp.toDate().toISOString();
    }
    return null;
};

/**
 * Deletes a contact from Firestore by ID.
 * @param id - The ID of the contact to delete.
 */
export async function deleteContact(id: string): Promise<void> {
    logger.firestore.operation("deleting", "contacts");
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        await deleteDoc(doc(db, 'contacts', id));
        logger.firestore.operation("deleted", "contacts", id);
    } catch (error) {
        logger.firestore.error("deleting", "contacts", error);
        throw new Error("Failed to delete contact");
    }
}

/**
 * Adds a new contact to Firestore.
 * @param contact - The contact data to add.
 * @returns A promise that resolves to the created contact with ID.
 */
export async function addContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    logger.firestore.operation("adding", "contacts");
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const contactsCol = collection(db, 'contacts');
        const docRef = await addDoc(contactsCol, {
            ...contact,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        
        const newContact: Contact = {
            id: docRef.id,
            ...contact,
        };
        
        logger.firestore.operation("added", "contacts", newContact.id);
        return newContact;
    } catch (error) {
        logger.firestore.error("adding", "contacts", error);
        throw new Error("Failed to add contact");
    }
}

/**
 * Updates an existing contact in Firestore.
 * @param id - The ID of the contact to update.
 * @param contact - The contact data to update.
 */
export async function updateContact(id: string, contact: Partial<Omit<Contact, 'id'>>): Promise<void> {
    logger.firestore.operation("updating", "contacts", id);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const contactRef = doc(db, 'contacts', id);
        await updateDoc(contactRef, {
            ...contact,
            updatedAt: serverTimestamp(),
        });
        
        logger.firestore.operation("updated", "contacts", id);
    } catch (error) {
        logger.firestore.error("updating", "contacts", error, id);
        throw new Error("Failed to update contact");
    }
}

/**
 * Retrieves a contact from Firestore by ID.
 * @param id - The ID of the contact to retrieve.
 * @returns A promise that resolves to the contact or null if not found.
 */
export async function getContact(id: string): Promise<Contact | null> {
    logger.firestore.operation("getting", "contacts", id);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const contactRef = doc(db, 'contacts', id);
        const contactSnap = await getDoc(contactRef);
        
        if (!contactSnap.exists()) {
            return null;
        }
        
        const data = contactSnap.data();
        const contact = mapDocToContact({ id: contactSnap.id, ...data });
        
        logger.firestore.operation("got", "contacts", id);
        return contact;
    } catch (error) {
        logger.firestore.error("getting", "contacts", error, id);
        throw new Error("Failed to get contact");
    }
}

/**
 * Searches for projects based on a query string.
 * @param args - Object containing optional query string.
 * @returns A promise that resolves to an array of projects or null.
 */
export async function listProjects(args: { query?: string | null }): Promise<Project[] | null> {
    logger.firestore.operation("listing", "projects");
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const projectsCol = collection(db, 'projects');
        let q = query(projectsCol, orderBy('name'));
        
        // If there's a search query, we'll filter the results after fetching
        // Firebase doesn't support case-insensitive text search natively
        const querySnapshot = await getDocs(q);
        let projects: Project[] = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const project = mapDocToProject({ id: doc.id, ...data });
            projects.push(project);
        });
        
        // Apply search filter if query is provided
        if (args.query && args.query.trim()) {
            const searchTerm = args.query.toLowerCase().trim();
            projects = projects.filter(project => 
                project.name.toLowerCase().includes(searchTerm) ||
                (project.organization && project.organization.toLowerCase().includes(searchTerm)) ||
                (project.type && project.type.toLowerCase().includes(searchTerm))
            );
        }
        
        logger.firestore.operation("listed", "projects");
        return projects;
    } catch (error) {
        logger.firestore.error("listing", "projects", error);
        return null;
    }
}

/**
 * Retrieves all contacts from Firestore.
 * @returns A promise that resolves to an array of contacts or null.
 */
export async function listContacts(): Promise<Contact[] | null> {
    logger.firestore.operation("listing", "contacts");
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const contactsCol = collection(db, 'contacts');
        const q = query(contactsCol, orderBy('name'));
        const querySnapshot = await getDocs(q);
        
        const contacts: Contact[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const contact = mapDocToContact({ id: doc.id, ...data });
            contacts.push(contact);
        });
        
        logger.firestore.operation("listed", "contacts");
        return contacts;
    } catch (error) {
        logger.firestore.error("listing", "contacts", error);
        return null;
    }
}

// ==================== ADMIN PROJECT FUNCTIONS ====================

/**
 * Lists all admin projects from Firestore.
 */
export async function listAdminProjects(): Promise<AdminProject[]> {
    logger.firestore.operation("listing", "adminProjects");
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const projectsCol = collection(db, 'adminProjects');
        const q = query(projectsCol, orderBy('name'));
        const querySnapshot = await getDocs(q);
        
        const projects: AdminProject[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            projects.push({
                id: doc.id,
                name: data.name || '',
                desc: data.desc || '',
                status: data.status || '',
                progress: data.progress || 0,
                dueDate: data.dueDate || '',
                createdAt: timestampToString(data.createdAt),
                updatedAt: timestampToString(data.updatedAt),
            });
        });
        
        logger.firestore.operation("listed", "adminProjects");
        return projects;
    } catch (error) {
        logger.firestore.error("listing", "adminProjects", error);
        throw new Error("Failed to list admin projects");
    }
}

/**
 * Adds a new admin project to Firestore.
 */
export async function addAdminProject(project: Omit<AdminProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminProject> {
    logger.firestore.operation("adding", "adminProjects");
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const projectsCol = collection(db, 'adminProjects');
        const docRef = await addDoc(projectsCol, {
            ...project,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        
        const newProject: AdminProject = {
            id: docRef.id,
            ...project,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        logger.firestore.operation("added", "adminProjects", newProject.id);
        return newProject;
    } catch (error) {
        logger.firestore.error("adding", "adminProjects", error);
        throw new Error("Failed to add admin project");
    }
}

/**
 * Updates an existing admin project in Firestore.
 */
export async function updateAdminProject(id: string, project: Partial<Omit<AdminProject, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    logger.firestore.operation("updating", "adminProjects", id);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const projectRef = doc(db, 'adminProjects', id);
        await updateDoc(projectRef, {
            ...project,
            updatedAt: serverTimestamp(),
        });
        
        logger.firestore.operation("updated", "adminProjects", id);
    } catch (error) {
        logger.firestore.error("updating", "adminProjects", error, id);
        throw new Error("Failed to update admin project");
    }
}

/**
 * Deletes an admin project from Firestore.
 */
export async function deleteAdminProject(id: string): Promise<void> {
    logger.firestore.operation("deleting", "adminProjects", id);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        await deleteDoc(doc(db, 'adminProjects', id));
        logger.firestore.operation("deleted", "adminProjects", id);
    } catch (error) {
        logger.firestore.error("deleting", "adminProjects", error, id);
        throw new Error("Failed to delete admin project");
    }
}

// ==================== TASK FUNCTIONS ====================

/**
 * Lists all tasks from Firestore.
 */
export async function listTasks(): Promise<Task[]> {
    logger.firestore.operation("listing", "tasks");
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const tasksCol = collection(db, 'tasks');
        const q = query(tasksCol, orderBy('time'));
        const querySnapshot = await getDocs(q);
        
        const tasks: Task[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            tasks.push({
                id: doc.id,
                title: data.title || '',
                priority: data.priority || '',
                priorityColor: data.priorityColor || '',
                time: data.time || '',
                checked: data.checked || false,
                createdAt: timestampToString(data.createdAt),
                updatedAt: timestampToString(data.updatedAt),
            });
        });
        
        logger.firestore.operation("listed", "tasks");
        return tasks;
    } catch (error) {
        logger.firestore.error("listing", "tasks", error);
        throw new Error("Failed to list tasks");
    }
}

/**
 * Adds a new task to Firestore.
 */
export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    logger.firestore.operation("adding", "tasks");
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const tasksCol = collection(db, 'tasks');
        const docRef = await addDoc(tasksCol, {
            ...task,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        
        const newTask: Task = {
            id: docRef.id,
            ...task,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        
        logger.firestore.operation("added", "tasks", newTask.id);
        return newTask;
    } catch (error) {
        logger.firestore.error("adding", "tasks", error);
        throw new Error("Failed to add task");
    }
}

/**
 * Updates an existing task in Firestore.
 */
export async function updateTask(id: string, task: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    logger.firestore.operation("updating", "tasks", id);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const taskRef = doc(db, 'tasks', id);
        await updateDoc(taskRef, {
            ...task,
            updatedAt: serverTimestamp(),
        });
        
        logger.firestore.operation("updated", "tasks", id);
    } catch (error) {
        logger.firestore.error("updating", "tasks", error, id);
        throw new Error("Failed to update task");
    }
}

/**
 * Deletes a task from Firestore.
 */
export async function deleteTask(id: string): Promise<void> {
    logger.firestore.operation("deleting", "tasks", id);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        await deleteDoc(doc(db, 'tasks', id));
        logger.firestore.operation("deleted", "tasks", id);
    } catch (error) {
        logger.firestore.error("deleting", "tasks", error, id);
        throw new Error("Failed to delete task");
    }
}

/**
 * Retrieves an admin project from Firestore by ID.
 */
export async function getAdminProject(id: string): Promise<AdminProject | null> {
    logger.firestore.operation("getting", "adminProjects", id);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const projectRef = doc(db, 'adminProjects', id);
        const projectSnap = await getDoc(projectRef);
        
        if (!projectSnap.exists()) {
            return null;
        }
        
        const data = projectSnap.data();
        const project: AdminProject = {
            id: projectSnap.id,
            name: data.name || '',
            desc: data.desc || '',
            status: data.status || '',
            progress: data.progress || 0,
            dueDate: data.dueDate || '',
            createdAt: timestampToString(data.createdAt),
            updatedAt: timestampToString(data.updatedAt),
        };
        
        logger.firestore.operation("got", "adminProjects", id);
        return project;
    } catch (error) {
        logger.firestore.error("getting", "adminProjects", error, id);
        throw new Error("Failed to get admin project");
    }
}

/**
 * Retrieves a task from Firestore by ID.
 */
export async function getTask(id: string): Promise<Task | null> {
    logger.firestore.operation("getting", "tasks", id);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const taskRef = doc(db, 'tasks', id);
        const taskSnap = await getDoc(taskRef);
        
        if (!taskSnap.exists()) {
            return null;
        }
        
        const data = taskSnap.data();
        const task: Task = {
            id: taskSnap.id,
            title: data.title || '',
            priority: data.priority || '',
            priorityColor: data.priorityColor || '',
            time: data.time || '',
            checked: data.checked || false,
            createdAt: timestampToString(data.createdAt),
            updatedAt: timestampToString(data.updatedAt),
        };
        
        logger.firestore.operation("got", "tasks", id);
        return task;
    } catch (error) {
        logger.firestore.error("getting", "tasks", error, id);
        throw new Error("Failed to get task");
    }
}
