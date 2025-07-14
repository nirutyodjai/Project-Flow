const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx and .ts files in a directory
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to add logger import if not present
function addLoggerImport(content, filePath) {
  // Skip if logger is already imported or if it's a test file
  if (content.includes("from '@/lib/logger'") || filePath.includes('.test.') || filePath.includes('__tests__')) {
    return content;
  }
  
  // Skip if no console statements found
  if (!content.includes('console.')) {
    return content;
  }
  
  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') && !lines[i].includes('//')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex !== -1) {
    lines.splice(lastImportIndex + 1, 0, "import { logger } from '@/lib/logger';");
    return lines.join('\n');
  }
  
  return content;
}

// Function to replace console statements
function replaceConsoleStatements(content) {
  // Skip if logger is not imported (will be added later if needed)
  if (!content.includes("from '@/lib/logger'") && content.includes('console.')) {
    return content;
  }
  
  const replacements = [
    // Replace console.error with logger.error
    {
      old: /console\.error\((['"`])([^'"`]+)\1,\s*([^)]+)\);/g,
      new: "logger.error('$2', $3);"
    },
    {
      old: /console\.error\(([^,)]+)\);/g,
      new: "logger.error('Error occurred', $1);"
    },
    // Replace console.log with logger.info for important logs, logger.debug for debug logs
    {
      old: /console\.log\((['"`])([^'"`]*(?:success|complete|finish|done)[^'"`]*)\1([^)]*)\);/gi,
      new: "logger.info('$2'$3);"
    },
    {
      old: /console\.log\(([^)]+)\);/g,
      new: "logger.debug($1);"
    },
    // Replace console.warn with logger.warn
    {
      old: /console\.warn\(([^)]+)\);/g,
      new: "logger.warn($1);"
    }
  ];
  
  let updatedContent = content;
  replacements.forEach(replacement => {
    updatedContent = updatedContent.replace(replacement.old, replacement.new);
  });
  
  return updatedContent;
}

// Main execution
const appDir = path.join(__dirname, 'src', 'app');
const files = findFiles(appDir);

let processedCount = 0;
let updatedCount = 0;

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Add logger import if needed
    content = addLoggerImport(content, filePath);
    
    // Replace console statements
    content = replaceConsoleStatements(content);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated: ${path.relative(__dirname, filePath)}`);
      updatedCount++;
    }
    
    processedCount++;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
});

console.log(`\nProcessed ${processedCount} files, updated ${updatedCount} files`);
console.log('Console statement replacement completed!');
