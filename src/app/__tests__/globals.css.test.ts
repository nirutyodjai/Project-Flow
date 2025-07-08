import fs from 'fs';
import path from 'path';
import assert from 'assert';

describe('src/app/globals.css', () => {
  const cssFilePath = path.join(__dirname, '../globals.css');
  const cssContent = fs.readFileSync(cssFilePath, 'utf-8');
  const cssFileSize = fs.statSync(cssFilePath).size;

  it('should have valid CSS syntax', () => {
    assert.ok(cssContent.includes('@tailwind base;'), 'Missing @tailwind base directive');
    assert.ok(cssContent.includes('@tailwind components;'), 'Missing @tailwind components directive');
    assert.ok(cssContent.includes('@tailwind utilities;'), 'Missing @tailwind utilities directive');
  });

  it('should define all required CSS variables in :root', () => {
    const requiredVars = [
      '--background', '--foreground', '--card', '--card-foreground',
      '--popover', '--popover-foreground', '--primary', '--primary-foreground',
      '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
      '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
      '--border', '--input', '--ring', '--radius',
      '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5',
      '--sidebar-background', '--sidebar-foreground', '--sidebar-primary',
      '--sidebar-primary-foreground', '--sidebar-accent', '--sidebar-accent-foreground',
      '--sidebar-border', '--sidebar-ring'
    ];
    requiredVars.forEach(v => {
      assert.ok(cssContent.includes(`${v}:`), `Missing CSS variable in :root: ${v}`);
    });
  });

  it('should define all required CSS variables in .dark', () => {
    const requiredVars = [
        '--background', '--foreground', '--card', '--card-foreground',
        '--popover', '--popover-foreground', '--primary', '--primary-foreground',
        '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
        '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
        '--border', '--input', '--ring',
        '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5',
        '--sidebar-background', '--sidebar-foreground', '--sidebar-primary',
        '--sidebar-primary-foreground', '--sidebar-accent', '--sidebar-accent-foreground',
        '--sidebar-border', '--sidebar-ring'
    ];
    const darkBlock = cssContent.match(/\.dark\s*\{[^\}]+\}/);
    assert.ok(darkBlock, 'Missing .dark class for dark mode');
    requiredVars.forEach(v => {
      assert.ok(darkBlock[0].includes(`${v}:`), `Missing CSS variable in .dark: ${v}`);
    });
  });

  it('should not have any empty rules', () => {
    const emptyRules = /[^{\s]\s*\{\s*\}/g;
    assert.strictEqual(emptyRules.test(cssContent), false, 'Found empty CSS rules');
  });

  it('should include global styles for body and *', () => {
    assert.ok(cssContent.includes('* {'), 'Missing global * styles');
    assert.ok(cssContent.includes('body {'), 'Missing body styles');
  });

  it('should define keyframe animations', () => {
    assert.ok(cssContent.includes('@keyframes fadeIn'), 'Missing keyframe animation: fadeIn');
    assert.ok(cssContent.includes('@keyframes pulse'), 'Missing keyframe animation: pulse');
    assert.ok(cssContent.includes('@keyframes highlight'), 'Missing keyframe animation: highlight');
  });

  it('should include custom utility classes', () => {
    assert.ok(cssContent.includes('.custom-scrollbar'), 'Missing utility class: .custom-scrollbar');
    assert.ok(cssContent.includes('.staggered-fade-in'), 'Missing utility class: .staggered-fade-in');
    assert.ok(cssContent.includes('.pulse-animation'), 'Missing utility class: .pulse-animation');
    assert.ok(cssContent.includes('.analysis-card'), 'Missing utility class: .analysis-card');
    assert.ok(cssContent.includes('.boq-table'), 'Missing utility class: .boq-table');
    assert.ok(cssContent.includes('.calculation-highlight'), 'Missing utility class: .calculation-highlight');
  });

  it('should be under a reasonable file size limit', () => {
    const fileSizeLimit = 10000; // 10 KB
    assert.ok(cssFileSize < fileSizeLimit, `CSS file size exceeds ${fileSizeLimit} bytes. Current size: ${cssFileSize} bytes.`);
  });

  it('should include specific styles for analysis-card hover', () => {
    const analysisCardHoverRule = /\.analysis-card:hover\s*\{[^\}]+\}/;
    const match = cssContent.match(analysisCardHoverRule);
    assert.ok(match, 'Missing .analysis-card:hover rule');
    assert.ok(match[0].includes('transform: translateY(-5px);'), 'Missing transform on .analysis-card:hover');
  });
});
