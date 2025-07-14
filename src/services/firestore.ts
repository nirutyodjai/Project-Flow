
'use server';
import { getDb } from './firebase';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  deleteDoc, 
  addDoc,
  updateDoc,
  serverTimestamp,
  DocumentData,
  Timestamp,
  Query,
  query,
  orderBy,
  where,
  limit,
  setDoc
} from 'firebase/firestore';
import type { Project, Contact } from './mock-data';

// Re-export types for use in other parts of the application
export type { Project, Contact };

// AdminProject type
export interface AdminProject {
  id: string;
  name: string;
  desc: string;
  status: string;
  progress: number;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
}

// Task type
export interface Task {
  id: string;
  title: string;
  priority: string;
  priorityColor: string;
  time: string;
  checked: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const mapDocToProject = (doc: DocumentData): Project => ({
    id: doc.id,
    name: doc.data().name || '',
    organization: doc.data().organization || null,
    type: doc.data().type || null,
    budget: doc.data().budget || null,
    address: doc.data().address || null,
    contactPerson: doc.data().contactPerson || null,
    phone: doc.data().phone || null,
    documentUrl: doc.data().documentUrl || null,
    bidSubmissionDeadline: doc.data().bidSubmissionDeadline || null,
});

const mapDocToContact = (doc: DocumentData): Contact => ({
    id: doc.id,
    type: doc.data().type || null,
    name: doc.data().name || '',
    email: doc.data().email || null,
    phone: doc.data().phone || null,
    address: doc.data().address || null,
    contactPerson: doc.data().contactPerson || null,
});

const mapDocToAdminProject = (doc: DocumentData): AdminProject => ({
  id: doc.id,
  name: doc.data().name,
  desc: doc.data().desc,
  status: doc.data().status,
  progress: doc.data().progress,
  dueDate: doc.data().dueDate,
  createdAt: doc.data().createdAt?.toDate()?.toISOString(),
  updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
});

const mapDocToTask = (doc: DocumentData): Task => ({
  id: doc.id,
  title: doc.data().title,
  priority: doc.data().priority,
  priorityColor: doc.data().priorityColor,
  time: doc.data().time,
  checked: doc.data().checked,
  createdAt: doc.data().createdAt?.toDate()?.toISOString(),
  updatedAt: doc.data().updatedAt?.toDate()?.toISOString(),
});


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
        const projectList = projectSnapshot.docs.map(doc => mapDocToProject({ id: doc.id, data: () => doc.data() }));

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
export async function listContacts(): Promise<Contact[]> {
    console.log('Fetching all contacts from Firestore');
    try {
        const db = getDb();
        if (!db) {
            console.warn('Firestore not initialized');
            return [];
        }
        
        const contactsCol = collection(db, 'contacts');
        const contactSnapshot = await getDocs(contactsCol);
        const contactList = contactSnapshot.docs.map(doc => mapDocToContact({ id: doc.id, data: () => doc.data() }));
        return contactList;
    } catch (error) {
        console.error("Error fetching contacts from Firestore: ", error);
        return [];
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
        if (!db) {
            console.warn('Firestore not initialized');
            return;
        }
        await deleteDoc(doc(db, 'contacts', id));
    } catch (error) {
        console.error("Error deleting contact from Firestore: ", error);
    }
}

/**
 * Functions for Admin Page
 */

// List all admin projects
export async function listAdminProjects(): Promise<AdminProject[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(collection(db, "adminProjects"), orderBy("updatedAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => mapDocToAdminProject({ id: doc.id, data: () => doc.data() }));
}

// Get a single admin project by ID
export async function getAdminProject(id: string): Promise<AdminProject | null> {
  const db = getDb();
  if (!db) return null;
  const docRef = doc(db, "adminProjects", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return mapDocToAdminProject({ id: docSnap.id, data: () => docSnap.data() });
  } else {
    return null;
  }
}

// Add a new admin project
export async function addAdminProject(project: Omit<AdminProject, 'id'>): Promise<AdminProject> {
  const db = getDb();
  if (!db) throw new Error("Firestore not initialized");
  const docRef = await addDoc(collection(db, "adminProjects"), {
    ...project,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const newDoc = await getDoc(docRef);
  return mapDocToAdminProject({ id: newDoc.id, data: () => newDoc.data() });
}

// Update an admin project
export async function updateAdminProject(id: string, updates: Partial<AdminProject>): Promise<void> {
  const db = getDb();
  if (!db) return;
  const docRef = doc(db, "adminProjects", id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
}

// Delete an admin project
export async function deleteAdminProject(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, "adminProjects", id));
}

// List all tasks
export async function listTasks(): Promise<Task[]> {
  const db = getDb();
  if (!db) return [];
  const q = query(collection(db, "tasks"), orderBy("updatedAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => mapDocToTask({ id: doc.id, data: () => doc.data() }));
}

// Get a single task by ID
export async function getTask(id: string): Promise<Task | null> {
  const db = getDb();
  if (!db) return null;
  const docRef = doc(db, "tasks", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return mapDocToTask({ id: docSnap.id, data: () => docSnap.data() });
  } else {
    return null;
  }
}

// Add a new task
export async function addTask(task: Omit<Task, 'id'>): Promise<Task> {
  const db = getDb();
  if (!db) throw new Error("Firestore not initialized");
  const docRef = await addDoc(collection(db, "tasks"), {
    ...task,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const newDoc = await getDoc(docRef);
  return mapDocToTask({ id: newDoc.id, data: () => newDoc.data() });
}

// Update a task
export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const db = getDb();
  if (!db) return;
  const docRef = doc(db, "tasks", id);
  await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
}

// Delete a task
export async function deleteTask(id: string): Promise<void> {
  const db = getDb();
  if (!db) return;
  await deleteDoc(doc(db, "tasks", id));
}


// Get a single contact by ID
export async function getContact(id: string): Promise<Contact | null> {
    const db = getDb();
    if (!db) return null;
    const docRef = doc(db, "contacts", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return mapDocToContact({ id: docSnap.id, data: () => docSnap.data() });
    } else {
        return null;
    }
}

// Get contacts by type
export async function getContactsByType(type: string, searchTerm: string = '', limitNum: number = 20): Promise<Contact[]> {
    const db = getDb();
    if (!db) return [];

    let q: Query<DocumentData> = query(collection(db, "contacts"), where('type', '==', type), limit(limitNum));

    const querySnapshot = await getDocs(q);
    let contacts = querySnapshot.docs.map(doc => mapDocToContact({ id: doc.id, data: () => doc.data() }));

    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        contacts = contacts.filter(contact =>
            contact.name.toLowerCase().includes(lowercasedTerm) ||
            (contact.email && contact.email.toLowerCase().includes(lowercasedTerm))
        );
    }
    return contacts;
}

// Add a new contact
export async function addContact(contactData: Omit<Contact, 'id'>): Promise<Contact> {
    const db = getDb();
    if (!db) throw new Error("Firestore not initialized");
    const docRef = await addDoc(collection(db, 'contacts'), {
        ...contactData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    const newDoc = await getDoc(docRef);
    return mapDocToContact({ id: newDoc.id, data: () => newDoc.data() });
}


// Update a contact
export async function updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const db = getDb();
    if (!db) throw new Error("Firestore not initialized");

    const docRef = doc(db, 'contacts', id);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
    
    const updatedDoc = await getDoc(docRef);
    return mapDocToContact({ id: updatedDoc.id, data: () => updatedDoc.data() });
}

// Functions to get documents from a collection by ID
export async function getDocumentsFromCollection(collectionName: string) {
    const db = getDb();
    if (!db) return [];
    
    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getDocumentById(collectionName: string, id: string) {
    const db = getDb();
    if (!db) return null;
    
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
}

export async function addDocumentToCollection(collectionName: string, docId: string, data: any) {
    const db = getDb();
    if (!db) throw new Error("Firestore not initialized");
    
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
    return docId;
}

export async function deleteDocumentFromCollection(collectionName: string, docId: string) {
    const db = getDb();
    if (!db) throw new Error("Firestore not initialized");
    
    await deleteDoc(doc(db, collectionName, docId));
}
