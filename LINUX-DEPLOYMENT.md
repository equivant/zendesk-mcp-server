# Linux Deployment Guide

## Issue
The MCP server was developed on Windows and had Windows line endings (CRLF) which caused it to fail on Linux systems. The main issue was the shebang line in `src/index.js` which became `#!/usr/bin/env node\r` instead of `#!/usr/bin/env node`.

## Solution Applied
1. **Line Endings Fixed**: All JavaScript files converted from CRLF to LF using `fix-line-endings.js`
2. **Files Converted**: 14 files were updated with proper Unix line endings

## Linux Deployment Steps

### 1. After transferring files to Linux
```bash
# Make the main script executable
chmod +x src/index.js

# Verify the shebang line is correct
head -1 src/index.js
# Should show: #!/usr/bin/env node (without \r)
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment
```bash
# Copy and configure environment variables
cp .env.example .env
# Edit .env with your Zendesk credentials
```

### 4. Test the server
```bash
# Test basic functionality
node src/index.js

# Or use the test script
node test-stdin-stdout.js
```

### 5. Verify tools are available
```bash
# Test tool discovery
node test-introspection.js
```

## Common Linux Issues

### Permission Denied
```bash
chmod +x src/index.js
```

### Node.js not found
```bash
# Install Node.js if not available
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Environment Variables
```bash
# Ensure .env file has proper permissions
chmod 600 .env
```

## Verification
After deployment, the MCP server should:
1. Start without errors
2. Respond to tool discovery requests
3. Show all 40+ tools available
4. Handle stdin/stdout communication properly

## Prevention
To prevent this issue in the future:
1. Configure your IDE to use LF line endings for JavaScript files
2. Add `.gitattributes` file to enforce line endings
3. Run `fix-line-endings.js` before deploying to Linux