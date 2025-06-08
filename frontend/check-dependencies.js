#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking for missing dependencies...\n');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const installedDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

console.log('📦 Currently installed dependencies:');
Object.keys(installedDeps).forEach(dep => {
  console.log(`  ✅ ${dep}@${installedDeps[dep]}`);
});
console.log();

// Function to extract imports from a file
function extractImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Match different import patterns
    const patterns = [
      /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,  // import ... from 'package'
      /import\s+['"]([^'"]+)['"]/g,              // import 'package'  
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g    // require('package')
    ];
    
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1];
        // Only include npm packages (not relative paths)
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
          imports.push(importPath);
        }
      }
    });
    
    return imports;
  } catch (error) {
    return [];
  }
}

// Function to get package name from import path
function getPackageName(importPath) {
  // Handle scoped packages like @mui/material
  if (importPath.startsWith('@')) {
    const parts = importPath.split('/');
    return parts[0] + '/' + parts[1];
  }
  // Handle regular packages
  return importPath.split('/')[0];
}

// Scan all JavaScript files
function scanDirectory(dir, allImports = new Set()) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and build directories
        if (!['node_modules', 'build', 'dist', '.git'].includes(item)) {
          scanDirectory(fullPath, allImports);
        }
      } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
        const imports = extractImports(fullPath);
        imports.forEach(imp => allImports.add(imp));
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return allImports;
}

// Scan the project
const allImports = scanDirectory('./src');
const allImportsArray = Array.from(allImports);

console.log('🔍 Found imports in your code:');
allImportsArray.forEach(imp => {
  console.log(`  📄 ${imp}`);
});
console.log();

// Check for missing dependencies
const usedPackages = new Set();
allImportsArray.forEach(importPath => {
  const packageName = getPackageName(importPath);
  usedPackages.add(packageName);
});

const missingDeps = [];
const unusedDeps = [];

// Check for missing dependencies
usedPackages.forEach(pkg => {
  if (!installedDeps[pkg]) {
    missingDeps.push(pkg);
  }
});

// Check for unused dependencies (packages in package.json but not imported)
Object.keys(installedDeps).forEach(pkg => {
  // Skip React ecosystem packages that might be used indirectly
  const skipCheck = [
    'react-scripts',
    'web-vitals',
    '@testing-library/jest-dom',
    '@testing-library/react',
    '@testing-library/user-event'
  ];
  
  if (!skipCheck.includes(pkg) && !usedPackages.has(pkg)) {
    unusedDeps.push(pkg);
  }
});

console.log('=' .repeat(60));

if (missingDeps.length === 0) {
  console.log('🎉 GREAT! All used packages are in package.json');
} else {
  console.log('❌ MISSING DEPENDENCIES:');
  missingDeps.forEach(dep => {
    console.log(`  📦 ${dep} - ADD THIS TO package.json`);
  });
  console.log('\n💡 Run this to install missing packages:');
  console.log(`npm install ${missingDeps.join(' ')}`);
}

if (unusedDeps.length > 0 && unusedDeps.length < 5) {
  console.log('\n⚠️  POTENTIALLY UNUSED (safe to ignore):');
  unusedDeps.forEach(dep => {
    console.log(`  📦 ${dep}`);
  });
}

console.log('\n' + '=' .repeat(60));

if (missingDeps.length === 0) {
  console.log('✅ Your package.json is COMPLETE! Your manager can run:');
  console.log('   1. npm ci');
  console.log('   2. npm start');
  console.log('\n🚀 No dependency issues expected!');
} else {
  console.log('🚨 FIX NEEDED: Add missing dependencies first');
  process.exit(1);
} 