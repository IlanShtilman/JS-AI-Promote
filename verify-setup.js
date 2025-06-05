#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying project setup...\n');

let allChecksPass = true;

function checkFailed(message) {
  console.log(`❌ ${message}`);
  allChecksPass = false;
}

function checkPassed(message) {
  console.log(`✅ ${message}`);
}

// Check Node.js version
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  const [major] = nodeVersion.replace('v', '').split('.').map(Number);
  
  if (major >= 16) {
    checkPassed(`Node.js version: ${nodeVersion} (16+ required)`);
  } else {
    checkFailed(`Node.js version too old. Found: ${nodeVersion}, Required: v16.0.0+`);
    console.log('   💡 Please upgrade Node.js to version 16 or higher');
  }
} catch (error) {
  checkFailed('Node.js not found');
}

// Check npm version
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  const [major] = npmVersion.split('.').map(Number);
  
  if (major >= 8) {
    checkPassed(`npm version: v${npmVersion}`);
  } else {
    checkFailed(`npm version too old. Found: v${npmVersion}, Required: v8.0.0+`);
  }
} catch (error) {
  checkFailed('npm not found');
}

// Check if package-lock.json exists
if (fs.existsSync('package-lock.json')) {
  checkPassed('package-lock.json exists');
} else {
  checkFailed('package-lock.json missing - run npm install first');
}

// Check if node_modules exists and has dependencies
if (fs.existsSync('node_modules')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const dependencies = Object.keys(packageJson.dependencies || {});
  
  const missingDeps = dependencies.filter(dep => 
    !fs.existsSync(path.join('node_modules', dep))
  );
  
  if (missingDeps.length === 0) {
    checkPassed(`All ${dependencies.length} dependencies installed`);
  } else {
    checkFailed(`Missing dependencies: ${missingDeps.join(', ')}`);
    console.log('   💡 Run: npm ci');
  }
} else {
  checkFailed('node_modules directory missing');
  console.log('   💡 Run: npm ci');
}

// Check Java version (for backend)
try {
  const javaVersion = execSync('java --version', { encoding: 'utf8' });
  if (javaVersion.includes('17') || javaVersion.includes('18') || javaVersion.includes('19') || javaVersion.includes('20') || javaVersion.includes('21')) {
    checkPassed('Java 17+ detected');
  } else {
    checkFailed('Java 17+ required for backend');
  }
} catch (error) {
  console.log('⚠️  Java not found (needed for backend)');
}

// Check backend directory
if (fs.existsSync('backend')) {
  checkPassed('Backend directory found');
  
  // Check for Maven wrapper
  if (fs.existsSync('backend/mvnw') || fs.existsSync('backend/mvnw.cmd')) {
    checkPassed('Maven wrapper found');
  } else {
    checkFailed('Maven wrapper missing in backend directory');
  }
} else {
  console.log('⚠️  Backend directory not found');
}

// Check for environment template
if (fs.existsSync('backend/.env.example') || fs.existsSync('backend/.env')) {
  checkPassed('Environment configuration ready');
} else {
  console.log('⚠️  Consider creating backend/.env for API keys');
}

console.log('\n' + '='.repeat(50));

if (allChecksPass) {
  console.log('🎉 All checks passed! Project ready to run.');
  console.log('\n📋 Next steps:');
  console.log('   1. Start backend: cd backend && ./mvnw spring-boot:run');
  console.log('   2. Start frontend: npm start');
} else {
  console.log('🚨 Some checks failed. Please fix the issues above.');
  process.exit(1);
} 