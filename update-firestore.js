const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/services/firestore.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace console.log statements with logger calls
const replacements = [
  {
    old: /console\.log\(`Searching Firestore for projects with query: \$\{args\.query\}`\);/g,
    new: 'logger.firestore.operation("fetching", "projects");'
  },
  {
    old: /console\.log\('Fetching all contacts from Firestore'\);/g,
    new: 'logger.firestore.operation("fetching", "contacts");'
  },
  {
    old: /console\.log\(`Deleting contact with id: \$\{id\}`\);/g,
    new: 'logger.firestore.operation("deleting", "contacts", id);'
  },
  {
    old: /console\.log\('Fetching all admin projects from Firestore'\);/g,
    new: 'logger.firestore.operation("fetching", "adminProjects");'
  },
  {
    old: /console\.log\('Adding new admin project to Firestore'\);/g,
    new: 'logger.firestore.operation("adding", "adminProjects");'
  },
  {
    old: /console\.log\(`Updating admin project with id: \$\{id\}`\);/g,
    new: 'logger.firestore.operation("updating", "adminProjects", id);'
  },
  {
    old: /console\.log\(`Deleting admin project with id: \$\{id\}`\);/g,
    new: 'logger.firestore.operation("deleting", "adminProjects", id);'
  },
  {
    old: /console\.log\('Fetching all tasks from Firestore'\);/g,
    new: 'logger.firestore.operation("fetching", "tasks");'
  },
  {
    old: /console\.log\('Adding new task to Firestore'\);/g,
    new: 'logger.firestore.operation("adding", "tasks");'
  },
  {
    old: /console\.log\(`Updating task with id: \$\{id\}`\);/g,
    new: 'logger.firestore.operation("updating", "tasks", id);'
  },
  {
    old: /console\.log\(`Deleting task with id: \$\{id\}`\);/g,
    new: 'logger.firestore.operation("deleting", "tasks", id);'
  },
  {
    old: /console\.log\(`Fetching admin project with id: \$\{id\} from Firestore`\);/g,
    new: 'logger.firestore.operation("fetching", "adminProjects", id);'
  },
  {
    old: /console\.log\(`Fetching task with id: \$\{id\} from Firestore`\);/g,
    new: 'logger.firestore.operation("fetching", "tasks", id);'
  },
  {
    old: /console\.warn\('Firestore not initialized'\);/g,
    new: 'logger.firestore.warning("Firestore not initialized");'
  },
  {
    old: /console\.warn\(`No admin project found with id: \$\{id\}`\);/g,
    new: 'logger.firestore.warning(`No admin project found with id: ${id}`);'
  },
  {
    old: /console\.warn\(`No task found with id: \$\{id\}`\);/g,
    new: 'logger.firestore.warning(`No task found with id: ${id}`);'
  },
  {
    old: /console\.error\("Error fetching projects from Firestore: ", error\);/g,
    new: 'logger.firestore.error("fetching", "projects", error);'
  },
  {
    old: /console\.error\("Error fetching contacts from Firestore: ", error\);/g,
    new: 'logger.firestore.error("fetching", "contacts", error);'
  },
  {
    old: /console\.error\("Error deleting contact from Firestore: ", error\);/g,
    new: 'logger.firestore.error("deleting", "contacts", error);'
  },
  {
    old: /console\.error\("Error fetching admin projects from Firestore: ", error\);/g,
    new: 'logger.firestore.error("fetching", "adminProjects", error);'
  },
  {
    old: /console\.error\("Error adding admin project to Firestore: ", error\);/g,
    new: 'logger.firestore.error("adding", "adminProjects", error);'
  },
  {
    old: /console\.error\("Error updating admin project in Firestore: ", error\);/g,
    new: 'logger.firestore.error("updating", "adminProjects", error);'
  },
  {
    old: /console\.error\("Error deleting admin project from Firestore: ", error\);/g,
    new: 'logger.firestore.error("deleting", "adminProjects", error);'
  },
  {
    old: /console\.error\("Error fetching tasks from Firestore: ", error\);/g,
    new: 'logger.firestore.error("fetching", "tasks", error);'
  },
  {
    old: /console\.error\("Error adding task to Firestore: ", error\);/g,
    new: 'logger.firestore.error("adding", "tasks", error);'
  },
  {
    old: /console\.error\("Error updating task in Firestore: ", error\);/g,
    new: 'logger.firestore.error("updating", "tasks", error);'
  },
  {
    old: /console\.error\("Error deleting task from Firestore: ", error\);/g,
    new: 'logger.firestore.error("deleting", "tasks", error);'
  },
  {
    old: /console\.error\(`Error fetching admin project with id: \$\{id\} from Firestore:`, error\);/g,
    new: 'logger.firestore.error("fetching", "adminProjects", error, id);'
  },
  {
    old: /console\.error\(`Error fetching task with id: \$\{id\} from Firestore:`, error\);/g,
    new: 'logger.firestore.error("fetching", "tasks", error, id);'
  }
];

// Apply all replacements
replacements.forEach(replacement => {
  content = content.replace(replacement.old, replacement.new);
});

fs.writeFileSync(filePath, content);
console.log('Successfully updated firestore.ts with logger calls');
