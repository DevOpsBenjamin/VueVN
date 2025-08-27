#!/usr/bin/env node

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const verbose: boolean = process.env.VUEVN_VERBOSE! == 'true';
const projectName: string = process.env.VUEVN_PROJECT!;
const ignoreTranslations = process.env.VUEVN_IGNORE_TRANSLATIONS! == 'true';
const rootFolder: string = process.env.VUEVN_ROOT!;
interface VerificationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

async function main() {
  // Verify project exists
  const projectPath = path.join(rootFolder, 'projects', projectName);
  if (!fs.existsSync(projectPath)) {
    console.error(`❌ Project not found: ${projectName}`);
    console.error(
      `   Available projects: ${getAvailableProjects().join(', ')}`
    );
    process.exit(1);
  }

  if (verbose) {
    console.log(`🔍 Verifying project: ${projectName}`);
    console.log('═══════════════════════════════════════════');
  }

  const results: VerificationResult[] = [];

  // Step 1: TypeScript Verification (Blocking)
  if (verbose) {
    console.log('📝 Step 1: TypeScript Verification');
  }
  const tsResult = await verifyTypeScript(projectName, verbose);
  results.push(tsResult);

  if (!tsResult.success) {
    if (!verbose) {
      console.log('❌ TypeScript errors found - build blocked');
      console.log('   → Use /verbose flag for detailed error output');
    }
    process.exit(1);
  }

  // Step 2: i18n Verification (Non-blocking with flag)
  if (verbose) {
    console.log('\n🌐 Step 2: Translation Verification');
  }
  const i18nResult = await verifyTranslations(projectName, verbose);
  results.push(i18nResult);

  if (!i18nResult.success && !ignoreTranslations) {
    if (!verbose) {
      console.log('⚠️  Translation issues found - build blocked');
      console.log(
        `   → Use: npm run build ${projectName} /ignore-translations`
      );
      console.log(
        '   → Or: npm run verify ${projectName} /verbose (for details)'
      );
    } else {
      console.log('\n⚠️  VERIFICATION WARNING: Translation issues found');
      console.log('   → Use /ignore-translations flag to build anyway:');
      console.log(`   → npm run build ${projectName} /ignore-translations`);
      console.log('═══════════════════════════════════════════');
    }
    process.exit(1);
  } else if (!i18nResult.success && ignoreTranslations) {
    if (verbose) {
      console.log(
        '\n⚠️  Translation issues ignored (/ignore-translations flag used)'
      );
    }
  }

  // Success!
  if (verbose) {
    console.log('\n✅ VERIFICATION PASSED');
    console.log('═══════════════════════════════════════════');
    console.log(`🚀 Project ${projectName} is ready for building!`);
  }
}

async function verifyTypeScript(
  projectName: string,
  verbose: boolean
): Promise<VerificationResult> {
  const result: VerificationResult = {
    success: false,
    errors: [],
    warnings: [],
  };

  try {
    if (verbose) {
      console.log('   Checking TypeScript compilation...');
    }
    
    execSync('npx vue-tsc --noEmit', {
      stdio: verbose ? 'inherit' : 'ignore',
      env: process.env,
      encoding: 'utf8',
    });

    result.success = true;
    if (verbose) {
      console.log('   ✅ TypeScript: All types are valid');
    }
  } catch (error: any) {
    result.success = false;
    result.errors.push('TypeScript compilation failed');
  }

  return result;
}

async function verifyTranslations(
  projectName: string,
  verbose: boolean
): Promise<VerificationResult> {
  const result: VerificationResult = {
    success: false,
    errors: [],
    warnings: [],
  };

  try {
    if (verbose) {
      console.log('   Checking translation completeness...');
    }
    const scriptPath = path.resolve(
      process.cwd(),
      'scripts',
      'build',
      'check-i18n.cts'
    );
    execSync(`tsx ${scriptPath}`, {
      stdio: verbose ? 'inherit' : 'ignore',
      env: process.env,
      encoding: 'utf8',
    });

    result.success = true;
    if (verbose) {
      console.log('   ✅ Translations: All languages complete');
    }
  } catch (error: any) {
    const errorOutput = error.stdout || error.stderr || error.message;

    if (errorOutput.includes('All translations are complete')) {
      result.success = true;
      if (verbose) {
        console.log('   ✅ Translations: All languages complete');
      }
    } else {
      result.success = false;

      if (!verbose) {
        console.log('   ⚠️  Translations: Missing translations detected');
      }
      // Provide helpful suggestions
      console.log('\n💡 Translation suggestions:');
      console.log(`   → Export texts: npm run export-texts`);
      console.log('   → Send archive to translation team');
      console.log(
        `   → Import completed: npm run import-texts <archive-path>`
      );
      console.log('   → Or build anyway: add /ignore-translations flag');

      result.warnings.push('Missing translations detected');
    }
  }

  return result;
}

function getAvailableProjects(): string[] {
  const projectsDir = path.join(process.cwd(), 'projects');

  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  return fs
    .readdirSync(projectsDir)
    .filter((item) => {
      const itemPath = path.join(projectsDir, item);
      return fs.statSync(itemPath).isDirectory() && item !== '0-template';
    })
    .sort();
}

main().catch(console.error);
