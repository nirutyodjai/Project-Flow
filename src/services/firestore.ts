'use server';
import { getDb } from './firebase';
import { collection, getDocs, doc, deleteDoc, DocumentData } from 'firebase/firestore';
import type { Contact, Project } from './mock-data';

// Re-export types for use in other parts of the application
export type { Project, Contact };

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

/**
 * Fetches projects from Firestore.
 * @param args Contains an optional query string for filtering.
 * @returns A promise that resolves to an array of projects.
 */
export async function listProjects(args: { query?: string | null }): Promise<Project[] | null> {
    console.log(`Searching Firestore for projects with query: ${args.query}`);
    try {
        const db = getDb();
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
 * Deletes a contact from Firestore by ID.
 * @param id The ID of the contact to delete.
 */
export async function deleteContact(id: string): Promise<void> {
    console.log(`Deleting contact with id: ${id}`);
    try {
        const db = getDb();
        await deleteDoc(doc(db, 'contacts', id));
    } catch (error) {
        console.error("Error deleting contact from Firestore: ", error);
        throw new Error("Failed to delete contact");
    }
}
