#!/usr/bin/env node

import path from 'path';

export interface ProjectInfo {
  projectName: string;
  projectPath: string;
  generatePath: string;
}

export function getProjectInfo(): ProjectInfo {
  const projectName = process.env.VUEVN_PROJECT;
  
  if (!projectName) {
    console.error('❌ Error: VUEVN_PROJECT environment variable is required');
    process.exit(1);
  }
  
  const projectPath = path.join(process.cwd(), 'projects', projectName);
  const generatePath = path.join(process.cwd(), 'generate');
  
  return {
    projectName,
    projectPath,
    generatePath
  };
}