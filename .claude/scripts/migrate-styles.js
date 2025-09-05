#!/usr/bin/env node
/**
 * Automated Style Migration Script
 * Converts old scaling functions to new responsive system
 */

const fs = require('fs');
const path = require('path');

// Replacement patterns
const replacements = [
  // Basic scaling functions
  { from: /scale\((\d+)\)/g, to: 'responsive.scale($1)' },
  { from: /verticalScale\((\d+)\)/g, to: 'responsive.verticalScale($1)' },
  
  // Font sizes - use responsive.font for better device scaling
  { from: /fontSize:\s*scale\((\d+)\)/g, to: 'fontSize: responsive.font($1)' },
  { from: /fontSize:\s*(\d+),/g, to: 'fontSize: responsive.font($1),' },
  
  // Spacing values - margins, padding
  { from: /margin(Top|Bottom|Left|Right|Horizontal|Vertical):\s*scale\((\d+)\)/g, to: 'margin$1: responsive.spacing($2)' },
  { from: /margin(Top|Bottom|Left|Right|Horizontal|Vertical):\s*verticalScale\((\d+)\)/g, to: 'margin$1: responsive.spacing($2)' },
  { from: /padding(Top|Bottom|Left|Right|Horizontal|Vertical):\s*scale\((\d+)\)/g, to: 'padding$1: responsive.spacing($2)' },
  { from: /padding(Top|Bottom|Left|Right|Horizontal|Vertical):\s*verticalScale\((\d+)\)/g, to: 'padding$1: responsive.spacing($2)' },
  { from: /padding:\s*scale\((\d+)\)/g, to: 'padding: responsive.spacing($1)' },
  
  // Border radius
  { from: /borderRadius:\s*scale\((\d+)\)/g, to: 'borderRadius: responsive.borderRadius($1)' },
  
  // Border width
  { from: /borderWidth:\s*scale\((\d+(?:\.\d+)?)\)/g, to: 'borderWidth: responsive.scale($1)' },
  
  // Elevation
  { from: /elevation:\s*scale\((\d+)\)/g, to: 'elevation: responsive.elevation($1)' },
  
  // Fixed heights that should use aspect ratios (common patterns)
  { from: /height:\s*verticalScale\(255\)/g, to: 'aspectRatio: ASPECT_RATIOS.CARD' },
  { from: /height:\s*verticalScale\(190\)/g, to: 'aspectRatio: ASPECT_RATIOS.PHOTO' },
];

// Special case replacements for common patterns
const specialReplacements = [
  // Touch targets should ensure minimum size
  { 
    from: /padding:\s*responsive\.spacing\((\d+)\),?\s*$/gm, 
    to: (match, p1) => {
      const size = parseInt(p1);
      if (size >= 10) {
        return `padding: responsive.spacing(${p1}),\n        minHeight: responsive.touchTarget(),`;
      }
      return match;
    }
  },
];

function migrateFile(filePath) {
  console.log(`Migrating: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already migrated (contains responsive import)
  if (content.includes("from '../../utils'") || content.includes("from '../utils'")) {
    console.log(`  ✅ Already migrated`);
    return false;
  }
  
  // Apply basic replacements
  replacements.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      console.log(`  🔄 Replacing ${matches.length} instances of ${from.source}`);
      content = content.replace(from, to);
    }
  });
  
  // Apply special replacements
  specialReplacements.forEach(({ from, to }) => {
    if (typeof to === 'function') {
      content = content.replace(from, to);
    } else {
      content = content.replace(from, to);
    }
  });
  
  // Check if any changes were made
  const originalContent = fs.readFileSync(filePath, 'utf8');
  if (content === originalContent) {
    console.log(`  ℹ️  No changes needed`);
    return false;
  }
  
  // Write back the file
  fs.writeFileSync(filePath, content);
  console.log(`  ✅ Migration complete`);
  return true;
}

// Get file path from command line argument
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node migrate-styles.js <file-path>');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

try {
  const changed = migrateFile(filePath);
  console.log(changed ? '🎉 File migrated successfully!' : '📝 No changes needed');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}