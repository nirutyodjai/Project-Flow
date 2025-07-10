'use server';
import { getDb } from './firebase';
import { collection, getDocs, doc, deleteDoc, DocumentData, addDoc, updateDoc, getDoc, serverTimestamp, query, orderBy, Timestamp, where } from 'firebase/firestore';
import type { Contact, Project } from './mock-data';

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
});

// Helper to convert Firestore document data to our Contact type
const mapDocToContact = (doc: DocumentData): Contact => ({
    id: doc.id,
    type: doc.type || null,
    name: doc.name || '',
    email: doc.email || null,
    phone: doc.phone || null,
    address: doc.address || null,
    contactPerson: doc.contactPerson || null,
});

// Helper to convert Firestore document data to AdminProject type
const mapDocToAdminProject = (doc: DocumentData): AdminProject => {
    // Convert Firestore Timestamps to ISO strings
    let createdAtString = null;
    let updatedAtString = null;
    
    if (doc.createdAt && typeof doc.createdAt.toDate === 'function') {
        createdAtString = doc.createdAt.toDate().toISOString();
    }
    
    if (doc.updatedAt && typeof doc.updatedAt.toDate === 'function') {
        updatedAtString = doc.updatedAt.toDate().toISOString();
    }
    
    return {
        id: doc.id,
        name: doc.name || '',
        desc: doc.desc || '',
        status: doc.status || 'รอดำเนินการ',
        progress: doc.progress || 0,
        dueDate: doc.dueDate || '',
        createdAt: createdAtString,
        updatedAt: updatedAtString,
    };
};

// Helper to convert Firestore document data to Task type
const mapDocToTask = (doc: DocumentData): Task => {
    // Convert Firestore Timestamps to ISO strings
    let createdAtString = null;
    let updatedAtString = null;
    
    if (doc.createdAt && typeof doc.createdAt.toDate === 'function') {
        createdAtString = doc.createdAt.toDate().toISOString();
    }
    
    if (doc.updatedAt && typeof doc.updatedAt.toDate === 'function') {
        updatedAtString = doc.updatedAt.toDate().toISOString();
    }
    
    return {
        id: doc.id,
        title: doc.title || '',
        priority: doc.priority || 'ปานกลาง',
        priorityColor: doc.priorityColor || 'bg-yellow-900/30 text-yellow-200',
        time: doc.time || '',
        checked: doc.checked || false,
        createdAt: createdAtString,
        updatedAt: updatedAtString,
    };
};

/**
 * Fetches projects from Firestore.
 * @param args Contains an optional query string for filtering.
 * @returns A promise that resolves to an array of projects.
 */
export async function listProjects(args: { query?: string | null }): Promise<Project[] | null> {
    console.log(`Searching Firestore for projects with query: ${args.query}`);
    try {
        const db = getDb();
        if (!db) {
            console.warn('Firestore not initialized');
            return [];
        }
        
        const projectsCol = collection(db, 'projects');
        const projectSnapshot = await getDocs(projectsCol);
        const projectList = projectSnapshot.docs.map(doc => mapDocToProject({ id: doc.id, ...doc.data() }));

        if (!args.query) {
            return projectList;
        }

        const queryLower = args.query.toLowerCase();
        return projectList.filter(project =>
            project.name.toLowerCase().includes(queryLower) ||
            (project.organization && project.organization.toLowerCase().includes(queryLower))
        );
    } catch (error) {
        console.error("Error fetching projects from Firestore: ", error);
        return [];
    }
}

/**
 * Fetches all contacts from Firestore.
 * @returns A promise that resolves to an array of contacts.
 */
export async function listContacts(): Promise<Contact[] | null> {
    console.log('Fetching all contacts from Firestore');
    try {
        const db = getDb();
        if (!db) {
            console.warn('Firestore not initialized');
            return [];
        }
        
        const contactsCol = collection(db, 'contacts');
        const contactSnapshot = await getDocs(contactsCol);
        const contactList = contactSnapshot.docs.map(doc => mapDocToContact({ id: doc.id, ...doc.data() }));
        return contactList;
    } catch (error) {
        console.error("Error fetching contacts from Firestore: ", error);
        return [];
    }
}

/**
 * Fetches contacts by type from Firestore.
 * @param type The type of contacts to fetch, e.g., 'ลูกค้า', 'ซัพพลายเออร์', etc.
 * @param searchTerm Optional search term to filter contacts by name.
 * @param limitCount Optional limit on the number of results.
 * @returns A promise that resolves to an array of contacts of the specified type.
 */
export async function getContactsByType(
    type: string,
    searchTerm?: string,
    limitCount: number = 20
): Promise<Contact[] | null> {
    console.log(`Fetching contacts of type "${type}" from Firestore`);
    try {
        const db = getDb();
        if (!db) {
            console.warn('Firestore not initialized');
            return [];
        }
        
        const contactsCol = collection(db, 'contacts');
        
        let conditions: any[] = [where('type', '==', type)];
        
        if (searchTerm) {
            conditions.push(where('name', '>=', searchTerm));
            conditions.push(where('name', '<=', searchTerm + '\uf8ff'));
        }
        
        const q = query(
            contactsCol,
            ...conditions,
            orderBy('name'),
            limit(limitCount)
        );
        
        const querySnapshot = await getDocs(q);
        const contactList = querySnapshot.docs.map(doc => mapDocToContact({ id: doc.id, ...doc.data() }));
        return contactList;
    } catch (error) {
        console.error(`Error fetching contacts of type "${type}" from Firestore:`, error);
        return [];
    }
}

/**
 * Adds a new contact to Firestore.
 * @param contact The contact data to add.
 * @returns A promise that resolves to the created contact with its ID.
 */
export async function addContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    console.log('Adding new contact to Firestore');
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const contactData = {
            ...contact,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'contacts'), contactData);
        return { id: docRef.id, ...contact };
    } catch (error) {
        console.error("Error adding contact to Firestore: ", error);
        throw new Error("Failed to add contact");
    }
}

/**
 * Gets a contact from Firestore by ID.
 * @param id The ID of the contact to get.
 * @returns A promise that resolves to the contact with the specified ID, or null if not found.
 */
export async function getContact(id: string): Promise<Contact | null> {
    console.log(`Getting contact with id: ${id}`);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const docRef = doc(db, 'contacts', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            return null;
        }
        
        return mapDocToContact({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
        console.error("Error getting contact from Firestore: ", error);
        throw new Error("Failed to get contact");
    }
}

/**
 * Updates a contact in Firestore by ID.
 * @param id The ID of the contact to update.
 * @param contact The updated contact data.
 * @returns A promise that resolves to the updated contact with its ID.
 */
export async function updateContact(id: string, contact: Partial<Omit<Contact, 'id'>>): Promise<Contact> {
    console.log(`Updating contact with id: ${id}`);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        // Get existing contact to merge with updates
        const docRef = doc(db, 'contacts', id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            throw new Error(`Contact with ID ${id} not found`);
        }
        
        const existingContact = docSnap.data();
        
        const updateData = {
            ...contact,
            updatedAt: serverTimestamp()
        };
        
        await updateDoc(docRef, updateData);
        
        // Return the updated contact
        return {
            id,
            ...existingContact,
            ...contact
        } as Contact;
    } catch (error) {
        console.error("Error updating contact in Firestore: ", error);
        throw new Error("Failed to update contact");
    }
}

/**
 * Deletes a contact from Firestore by ID.
 * @param id The ID of the contact to delete.
 */
export async function deleteContact(id: string): Promise<void> {
    console.log(`Deleting contact with id: ${id}`);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        await deleteDoc(doc(db, 'contacts', id));
    } catch (error) {
        console.error("Error deleting contact from Firestore: ", error);
        throw new Error("Failed to delete contact");
    }
}

/**
 * Fetches all admin projects from Firestore.
 * @returns A promise that resolves to an array of admin projects.
 */
export async function listAdminProjects(): Promise<AdminProject[]> {
    console.log('Fetching all admin projects from Firestore');
    try {
        const db = getDb();
        if (!db) {
            console.warn('Firestore not initialized');
            return [];
        }
        
        const projectsCol = collection(db, 'adminProjects');
        const projectQuery = query(projectsCol, orderBy('createdAt', 'desc'));
        const projectSnapshot = await getDocs(projectQuery);
        const projectList = projectSnapshot.docs.map(doc => mapDocToAdminProject({ id: doc.id, ...doc.data() }));
        return projectList;
    } catch (error) {
        console.error("Error fetching admin projects from Firestore: ", error);
        return [];
    }
}

/**
 * Adds a new admin project to Firestore.
 * @param project The project to add.
 * @returns A promise that resolves to the created project.
 */
export async function addAdminProject(project: Omit<AdminProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminProject> {
    console.log('Adding new admin project to Firestore');
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const projectData = {
            ...project,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'adminProjects'), projectData);
        // Convert Timestamp to ISO string
        const now = new Date().toISOString();
        return { id: docRef.id, ...project, createdAt: now, updatedAt: now };
    } catch (error) {
        console.error("Error adding admin project to Firestore: ", error);
        throw new Error("Failed to add project");
    }
}

/**
 * Updates an existing admin project in Firestore.
 * @param id The ID of the project to update.
 * @param project The updated project data.
 */
export async function updateAdminProject(id: string, project: Partial<Omit<AdminProject, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    console.log(`Updating admin project with id: ${id}`);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const projectRef = doc(db, 'adminProjects', id);
        
        await updateDoc(projectRef, {
            ...project,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating admin project in Firestore: ", error);
        throw new Error("Failed to update project");
    }
}

/**
 * Deletes an admin project from Firestore by ID.
 * @param id The ID of the project to delete.
 */
export async function deleteAdminProject(id: string): Promise<void> {
    console.log(`Deleting admin project with id: ${id}`);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        await deleteDoc(doc(db, 'adminProjects', id));
    } catch (error) {
        console.error("Error deleting admin project from Firestore: ", error);
        throw new Error("Failed to delete project");
    }
}

/**
 * Fetches all tasks from Firestore.
 * @returns A promise that resolves to an array of tasks.
 */
export async function listTasks(): Promise<Task[]> {
    console.log('Fetching all tasks from Firestore');
    try {
        const db = getDb();
        if (!db) {
            console.warn('Firestore not initialized');
            return [];
        }
        
        const tasksCol = collection(db, 'tasks');
        const taskQuery = query(tasksCol, orderBy('createdAt', 'desc'));
        const taskSnapshot = await getDocs(taskQuery);
        const taskList = taskSnapshot.docs.map(doc => mapDocToTask({ id: doc.id, ...doc.data() }));
        return taskList;
    } catch (error) {
        console.error("Error fetching tasks from Firestore: ", error);
        return [];
    }
}

/**
 * Adds a new task to Firestore.
 * @param task The task to add.
 * @returns A promise that resolves to the created task.
 */
export async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    console.log('Adding new task to Firestore');
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const taskData = {
            ...task,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'tasks'), taskData);
        // Convert Timestamp to ISO string
        const now = new Date().toISOString();
        return { id: docRef.id, ...task, createdAt: now, updatedAt: now };
    } catch (error) {
        console.error("Error adding task to Firestore: ", error);
        throw new Error("Failed to add task");
    }
}

/**
 * Updates an existing task in Firestore.
 * @param id The ID of the task to update.
 * @param task The updated task data.
 */
export async function updateTask(id: string, task: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    console.log(`Updating task with id: ${id}`);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const taskRef = doc(db, 'tasks', id);
        
        await updateDoc(taskRef, {
            ...task,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error updating task in Firestore: ", error);
        throw new Error("Failed to update task");
    }
}

/**
 * Deletes a task from Firestore by ID.
 * @param id The ID of the task to delete.
 */
export async function deleteTask(id: string): Promise<void> {
    console.log(`Deleting task with id: ${id}`);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
        console.error("Error deleting task from Firestore: ", error);
        throw new Error("Failed to delete task");
    }
}

/**
 * Fetches a single admin project by ID from Firestore.
 * @param id The ID of the admin project to fetch.
 * @returns A promise that resolves to the admin project or null if not found.
 */
export async function getAdminProject(id: string): Promise<AdminProject | null> {
    console.log(`Fetching admin project with id: ${id} from Firestore`);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const projectDoc = await getDoc(doc(db, 'adminProjects', id));
        
        if (!projectDoc.exists()) {
            console.warn(`No admin project found with id: ${id}`);
            return null;
        }
        
        return mapDocToAdminProject({ id: projectDoc.id, ...projectDoc.data() });
    } catch (error) {
        console.error(`Error fetching admin project with id: ${id} from Firestore:`, error);
        throw new Error("Failed to fetch project details");
    }
}

/**
 * Fetches a single task by ID from Firestore.
 * @param id The ID of the task to fetch.
 * @returns A promise that resolves to the task or null if not found.
 */
export async function getTask(id: string): Promise<Task | null> {
    console.log(`Fetching task with id: ${id} from Firestore`);
    try {
        const db = getDb();
        if (!db) throw new Error('Firestore not initialized');
        
        const taskDoc = await getDoc(doc(db, 'tasks', id));
        
        if (!taskDoc.exists()) {
            console.warn(`No task found with id: ${id}`);
            return null;
        }
        
        return mapDocToTask({ id: taskDoc.id, ...taskDoc.data() });
    } catch (error) {
        console.error(`Error fetching task with id: ${id} from Firestore:`, error);
        throw new Error("Failed to fetch task details");
    }
}
