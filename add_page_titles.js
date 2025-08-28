const fs = require('fs');
const path = require('path');

// Mapping of page paths to their titles
const pageTitles = {
  // User pages
  'src/app/(root)/(user)/reminder/page.tsx': 'Reminder',
  'src/app/(root)/(user)/suggestion/page.tsx': 'Suggestion',
  'src/app/(root)/(user)/markup/page.tsx': 'Markup',
  'src/app/(root)/(user)/markup/add/page.tsx': 'Add Markup',
  'src/app/(root)/(user)/personalized/page.tsx': 'Personalized Learning',
  'src/app/(root)/(user)/personalized/create-module/page.tsx': 'Create Module',
  'src/app/(root)/(user)/personalized/update-module/page.tsx': 'Update Module',
  'src/app/(root)/(user)/personalized/study/[moduleId]/page.tsx': 'Study Module',
  'src/app/(root)/(user)/reading/[id]/page.tsx': 'Reading Practice',
  'src/app/(root)/(user)/reading/[id]/practice/page.tsx': 'Reading Practice',
  'src/app/(root)/(user)/listening/[id]/page.tsx': 'Listening Practice',
  'src/app/(root)/(user)/listening/[id]/practice/page.tsx': 'Listening Practice',
  'src/app/(root)/(user)/exams/preview/page.tsx': 'Exam Preview',
  'src/app/(root)/(user)/exams/take/page.tsx': 'Take Exam',
  'src/app/(root)/(user)/history/exams/[tabs]/page.tsx': 'Exam History',
  'src/app/(root)/(user)/history/exams/details/page.tsx': 'Exam Details',
  'src/app/(root)/(user)/history/practices/[tabs]/page.tsx': 'Practice History',
  'src/app/(root)/(user)/history/practices/details/page.tsx': 'Practice Details',

  // Creator pages
  'src/app/(root)/creator/profile/page.tsx': 'Creator Profile',
  'src/app/(root)/creator/passages/page.tsx': 'Passages',
  'src/app/(root)/creator/passages/create/page.tsx': 'Create Passage',
  'src/app/(root)/creator/passages/[id]/edit/page.tsx': 'Edit Passage',
  'src/app/(root)/creator/passages/[id]/preview/page.tsx': 'Preview Passage',
  'src/app/(root)/creator/listenings/page.tsx': 'Listening Tasks',
  'src/app/(root)/creator/listenings/create/page.tsx': 'Create Listening Task',
  'src/app/(root)/creator/listenings/[id]/edit/page.tsx': 'Edit Listening Task',
  'src/app/(root)/creator/listenings/[id]/preview/page.tsx': 'Preview Listening Task',
  'src/app/(root)/creator/reading-exams/page.tsx': 'Reading Exams',
  'src/app/(root)/creator/reading-exams/create/page.tsx': 'Create Reading Exam',
  'src/app/(root)/creator/reading-exams/[id]/edit/page.tsx': 'Edit Reading Exam',
  'src/app/(root)/creator/reading-exams/[id]/page.tsx': 'Reading Exam Details',
  'src/app/(root)/creator/listening-exams/page.tsx': 'Listening Exams',
  'src/app/(root)/creator/listening-exams/create/page.tsx': 'Create Listening Exam',
  'src/app/(root)/creator/listening-exams/[id]/edit/page.tsx': 'Edit Listening Exam',
  'src/app/(root)/creator/listening-exams/[id]/preview/page.tsx': 'Preview Listening Exam',
};

function isClientComponent(content) {
  return content.trim().startsWith("'use client';") || content.trim().startsWith('"use client";');
}

function addTitleToPage(filePath, title) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has metadata or usePageTitle
  if (content.includes('export const metadata') || content.includes('usePageTitle')) {
    console.log(`Already has title: ${filePath}`);
    return;
  }

  let newContent;

  if (isClientComponent(content)) {
    // Client component - add usePageTitle hook
    const lines = content.split('\n');
    const importSection = [];
    let restOfFile = [];
    let foundImports = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (
        line.startsWith('import ') ||
        line.startsWith("'use client'") ||
        line.startsWith('"use client"')
      ) {
        importSection.push(line);
        foundImports = true;
      } else if (foundImports && line.trim() === '') {
        importSection.push(line);
      } else {
        restOfFile = lines.slice(i);
        break;
      }
    }

    // Add usePageTitle import
    const hasUsePageTitleImport = importSection.some((line) => line.includes('usePageTitle'));
    if (!hasUsePageTitleImport) {
      importSection.push("import { usePageTitle } from '@/hooks/usePageTitle';");
    }

    // Find the component function and add usePageTitle call
    let componentFunctionFound = false;
    for (let i = 0; i < restOfFile.length; i++) {
      const line = restOfFile[i];
      if (
        line.includes('= () => {') ||
        line.includes('= async () => {') ||
        line.includes('function ')
      ) {
        restOfFile.splice(i + 1, 0, `  usePageTitle('${title}');`, '');
        componentFunctionFound = true;
        break;
      }
    }

    if (!componentFunctionFound) {
      console.log(`Could not find component function in: ${filePath}`);
      return;
    }

    newContent = [...importSection, '', ...restOfFile].join('\n');
  } else {
    // Server component - add metadata export
    const lines = content.split('\n');
    let insertIndex = 0;

    // Find where to insert metadata (after imports, before component)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('import ')) {
        insertIndex = i + 1;
      } else if (line.trim() === '') {
        continue;
      } else {
        break;
      }
    }

    lines.splice(insertIndex, 0, '', `export const metadata = {`, `  title: '${title}',`, `};`);
    newContent = lines.join('\n');
  }

  fs.writeFileSync(filePath, newContent);
  console.log(`Added title "${title}" to: ${filePath}`);
}

// Process all pages
Object.entries(pageTitles).forEach(([filePath, title]) => {
  addTitleToPage(filePath, title);
});

console.log('Finished adding page titles!');
