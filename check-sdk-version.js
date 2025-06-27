// Check MCP SDK version
import fs from 'fs';
import path from 'path';
import os from 'os';

const platform = os.platform();
const isWSL = platform === 'linux' && os.release().toLowerCase().includes('microsoft');
console.log(`Running on: ${isWSL ? 'WSL' : platform}`);

try {
  // Read package.json
  const packageJsonPath = path.resolve('./package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Get MCP SDK version from dependencies
  const mcpSdkVersion = packageJson.dependencies['@modelcontextprotocol/sdk'];
  console.log(`MCP SDK version in package.json: ${mcpSdkVersion}`);
  
  // Try to read the actual installed version
  try {
    const sdkPackageJsonPath = path.resolve('./node_modules/@modelcontextprotocol/sdk/package.json');
    const sdkPackageJson = JSON.parse(fs.readFileSync(sdkPackageJsonPath, 'utf8'));
    console.log(`Installed MCP SDK version: ${sdkPackageJson.version}`);
    
    // Check if there's a version mismatch
    if (mcpSdkVersion.replace('^', '') !== sdkPackageJson.version) {
      console.log('Warning: Version mismatch between package.json and installed SDK');
    }
  } catch (err) {
    console.error('Error reading installed SDK version:', err.message);
  }
  
  // Check if the SDK has a README with documentation
  try {
    const readmePath = path.resolve('./node_modules/@modelcontextprotocol/sdk/README.md');
    const readme = fs.readFileSync(readmePath, 'utf8');
    console.log('SDK README found. First 200 characters:');
    console.log(readme.substring(0, 200) + '...');
    
    // Look for method names in the README
    const methodMatches = readme.match(/mcp\.[a-zA-Z_]+/g);
    if (methodMatches) {
      console.log('Potential method names found in README:');
      console.log([...new Set(methodMatches)].join(', '));
    }
  } catch (err) {
    console.error('Error reading SDK README:', err.message);
  }
  
  // Check for dist directory structure
  try {
    const distPath = path.resolve('./node_modules/@modelcontextprotocol/sdk/dist');
    if (fs.existsSync(distPath)) {
      const distContents = fs.readdirSync(distPath);
      console.log('SDK dist directory contents:', distContents.join(', '));
    }
  } catch (err) {
    console.error('Error checking dist directory:', err.message);
  }
  
} catch (err) {
  console.error('Error:', err.message);
}