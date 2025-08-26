#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('❌ Usage: npm run verify <project-name> [--ignore-translations]');
    console.error('   Example: npm run verify 2-advance-sample');
    console.error('   Example: npm run verify 2-advance-sample --ignore-translations');
    process.exit(1);
  }
  
  const projectName = args[0];
  const ignoreTranslations = args.includes('--ignore-translations');
  
  // Verify project exists
  const projectPath = path.join(process.cwd(), 'projects', projectName);
  if (!fs.existsSync(projectPath)) {
    console.error(`❌ Project not found: ${projectName}`);
    console.error(`   Available projects: ${getAvailableProjects().join(', ')}`);
    process.exit(1);
  }
  
  console.log(`🔍 Verifying project: ${projectName}`);
  console.log('═══════════════════════════════════════════');
  
  const results: VerificationResult[] = [];
  
  // Step 1: TypeScript Verification (Blocking)
  console.log('📝 Step 1: TypeScript Verification');
  const tsResult = await verifyTypeScript(projectName);
  results.push(tsResult);
  
  if (!tsResult.success) {
    console.log('\n❌ VERIFICATION FAILED: TypeScript errors must be fixed before building');
    console.log('═══════════════════════════════════════════');
    process.exit(1);
  }
  
  // Step 2: i18n Verification (Non-blocking with flag)
  console.log('\n🌐 Step 2: Translation Verification');
  const i18nResult = await verifyTranslations(projectName);
  results.push(i18nResult);
  
  if (!i18nResult.success && !ignoreTranslations) {
    console.log('\n⚠️  VERIFICATION WARNING: Translation issues found');
    console.log('   → Use --ignore-translations flag to build anyway:');
    console.log(`   → npm run build ${projectName} --ignore-translations`);
    console.log('═══════════════════════════════════════════');
    process.exit(1);
  } else if (!i18nResult.success && ignoreTranslations) {
    console.log('\n⚠️  Translation issues ignored (--ignore-translations flag used)');
  }
  
  // Success!
  console.log('\n✅ VERIFICATION PASSED');
  console.log('═══════════════════════════════════════════');
  console.log(`🚀 Project ${projectName} is ready for building!`);
}

async function verifyTypeScript(projectName: string): Promise<VerificationResult> {
  const result: VerificationResult = {
    success: false,
    errors: [],
    warnings: []
  };
  
  try {
    // Set environment variable for project-specific checking
    const env = { ...process.env, VUEVN_PROJECT: projectName };
    
    console.log('   Checking TypeScript compilation...');
    execSync('npx vue-tsc --noEmit', { 
      stdio: 'pipe',
      env,
      encoding: 'utf8'
    });
    
    result.success = true;
    console.log('   ✅ TypeScript: All types are valid');
    
  } catch (error: any) {
    result.success = false;
    const errorOutput = error.stdout || error.stderr || error.message;
    
    console.log('   ❌ TypeScript: Compilation errors found');
    console.log('   ═══════════════════════════════════════');
    console.log(errorOutput);
    console.log('   ═══════════════════════════════════════');
    
    result.errors.push('TypeScript compilation failed');
    
    // Provide helpful suggestions
    console.log('\n💡 Fix suggestions:');
    console.log('   → Run: npm run type-check  (for detailed error analysis)');
    console.log('   → Check for missing imports, type mismatches, or syntax errors');
    console.log('   → Ensure all @generate imports are available (run npm run dev first)');
  }
  
  return result;
}

async function verifyTranslations(projectName: string): Promise<VerificationResult> {
  const result: VerificationResult = {
    success: false,
    errors: [],
    warnings: []
  };
  
  try {
    // Set environment variable
    const env = { ...process.env, VUEVN_PROJECT: projectName };
    
    console.log('   Checking translation completeness...');
    execSync('tsx scripts/check-i18n.cts', { 
      stdio: 'pipe',
      env,
      encoding: 'utf8'
    });
    
    result.success = true;
    console.log('   ✅ Translations: All languages complete');
    
  } catch (error: any) {
    const errorOutput = error.stdout || error.stderr || error.message;
    
    if (errorOutput.includes('All translations are complete')) {
      result.success = true;
      console.log('   ✅ Translations: All languages complete');
    } else {
      result.success = false;
      
      console.log('   ⚠️  Translations: Missing translations detected');
      console.log('   ═══════════════════════════════════════');
      console.log(errorOutput);
      console.log('   ═══════════════════════════════════════');
      
      result.warnings.push('Missing translations detected');
      
      // Provide helpful suggestions
      console.log('\n💡 Translation suggestions:');
      console.log(`   → Export texts: npm run export-texts`);
      console.log('   → Send archive to translation team');
      console.log(`   → Import completed: npm run import-texts <archive-path>`);
      console.log('   → Or build anyway: add --ignore-translations flag');
    }
  }
  
  return result;
}

function getAvailableProjects(): string[] {
  const projectsDir = path.join(process.cwd(), 'projects');
  
  if (!fs.existsSync(projectsDir)) {
    return [];
  }
  
  return fs.readdirSync(projectsDir)
    .filter(item => {
      const itemPath = path.join(projectsDir, item);
      return fs.statSync(itemPath).isDirectory() && item !== '0-template';
    })
    .sort();
}

main().catch(console.error);