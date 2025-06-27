// Fix SDK version mismatch
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import os from 'os';

const platform = os.platform();
console.log(`Running on platform: ${platform}`);

// Read package.json
const packageJsonPath = path.resolve('./package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get current SDK version
const currentVersion = packageJson.dependencies['@modelcontextprotocol/sdk'];
console.log(`Current SDK version in package.json: ${currentVersion}`);

// Read installed version
try {
  const sdkPackageJsonPath = path.resolve('./node_modules/@modelcontextprotocol/sdk/package.json');
  const sdkPackageJson = JSON.parse(fs.readFileSync(sdkPackageJsonPath, 'utf8'));
  console.log(`Installed SDK version: ${sdkPackageJson.version}`);
  
  // Update package.json to match installed version
  packageJson.dependencies['@modelcontextprotocol/sdk'] = `^${sdkPackageJson.version}`;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`Updated package.json to use version ^${sdkPackageJson.version}`);
  
  // Create backup of server.js
  const serverJsPath = path.resolve('./src/server.js');
  const backupPath = path.resolve('./src/server.js.bak');
  fs.copyFileSync(serverJsPath, backupPath);
  console.log(`Created backup of server.js at ${backupPath}`);
  
  // Check if we need to reinstall dependencies
  console.log('Checking if we need to reinstall dependencies...');
  try {
    console.log('Running npm install...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies reinstalled successfully');
  } catch (error) {
    console.error('Error reinstalling dependencies:', error.message);
  }
  
} catch (error) {
  console.error('Error:', error.message);
}