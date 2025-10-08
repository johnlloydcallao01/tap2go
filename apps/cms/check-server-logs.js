import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkServerLogs() {
  console.log('📋 CHECKING SERVER LOGS FOR DETAILED ERROR INFORMATION...\n');

  // Common log file locations
  const logLocations = [
    path.join(__dirname, 'logs'),
    path.join(__dirname, '..', '..', 'logs'),
    path.join(__dirname, 'server.log'),
    path.join(__dirname, 'error.log'),
    path.join(__dirname, 'payload.log'),
    path.join(__dirname, '.next', 'server.log'),
    path.join(__dirname, 'build', 'server.log'),
    path.join(__dirname, 'dist', 'server.log')
  ];

  console.log('📋 STEP 1: Searching for log files...');
  
  const foundLogs = [];
  
  for (const logPath of logLocations) {
    try {
      const stats = await fs.promises.stat(logPath);
      if (stats.isFile()) {
        foundLogs.push({ path: logPath, type: 'file', size: stats.size, modified: stats.mtime });
      } else if (stats.isDirectory()) {
        try {
          const files = await fs.promises.readdir(logPath);
          const logFiles = files.filter(file => 
            file.endsWith('.log') || 
            file.includes('error') || 
            file.includes('server') ||
            file.includes('payload')
          );
          
          for (const file of logFiles) {
            const filePath = path.join(logPath, file);
            const fileStats = await fs.promises.stat(filePath);
            foundLogs.push({ 
              path: filePath, 
              type: 'file', 
              size: fileStats.size, 
              modified: fileStats.mtime 
            });
          }
        } catch (dirError) {
          // Directory not accessible, skip
        }
      }
    } catch (error) {
      // Path doesn't exist, skip
    }
  }

  if (foundLogs.length === 0) {
    console.log('⚠️  No log files found in common locations');
    console.log('💡 Log files might be:');
    console.log('   - Written to stdout/stderr (check terminal output)');
    console.log('   - Stored in a different location');
    console.log('   - Not configured for file logging');
  } else {
    console.log(`✅ Found ${foundLogs.length} log file(s):`);
    foundLogs.forEach(log => {
      console.log(`  📄 ${log.path}`);
      console.log(`     Size: ${(log.size / 1024).toFixed(2)} KB`);
      console.log(`     Modified: ${log.modified.toISOString()}`);
    });
  }

  // Analyze recent log entries
  console.log('\n📋 STEP 2: Analyzing recent log entries...');
  
  for (const log of foundLogs.slice(0, 3)) { // Limit to first 3 logs
    try {
      console.log(`\n📄 Analyzing: ${path.basename(log.path)}`);
      
      const content = await fs.promises.readFile(log.path, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        console.log('  📝 Log file is empty');
        continue;
      }
      
      console.log(`  📊 Total lines: ${lines.length}`);
      
      // Get recent entries (last 50 lines)
      const recentLines = lines.slice(-50);
      
      // Analyze error patterns
      const errorPatterns = {
        'Internal Server Error': /internal server error/i,
        'Database Error': /database|postgres|sql/i,
        'Geospatial Error': /geospatial|postgis|st_|geometry/i,
        'PayloadCMS Error': /payload|cms/i,
        'Authentication Error': /auth|unauthorized|forbidden/i,
        'Network Error': /network|connection|timeout/i,
        'Validation Error': /validation|invalid|required/i
      };
      
      const errorCounts = {};
      const errorExamples = {};
      
      Object.keys(errorPatterns).forEach(pattern => {
        errorCounts[pattern] = 0;
        errorExamples[pattern] = [];
      });
      
      recentLines.forEach(line => {
        Object.entries(errorPatterns).forEach(([pattern, regex]) => {
          if (regex.test(line)) {
            errorCounts[pattern]++;
            if (errorExamples[pattern].length < 3) {
              errorExamples[pattern].push(line.trim());
            }
          }
        });
      });
      
      // Display error analysis
      console.log('  🔍 Error pattern analysis (last 50 lines):');
      Object.entries(errorCounts).forEach(([pattern, count]) => {
        if (count > 0) {
          console.log(`    ❌ ${pattern}: ${count} occurrences`);
          errorExamples[pattern].forEach((example, index) => {
            console.log(`       ${index + 1}. ${example.substring(0, 100)}${example.length > 100 ? '...' : ''}`);
          });
        }
      });
      
      // Show recent entries
      console.log('  📝 Most recent entries (last 5):');
      recentLines.slice(-5).forEach((line, index) => {
        const timestamp = line.match(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/);
        const logLevel = line.match(/\b(ERROR|WARN|INFO|DEBUG)\b/i);
        const prefix = `    ${5 - index}. `;
        
        if (timestamp) {
          console.log(`${prefix}[${timestamp[0]}] ${line.substring(0, 120)}${line.length > 120 ? '...' : ''}`);
        } else {
          console.log(`${prefix}${line.substring(0, 120)}${line.length > 120 ? '...' : ''}`);
        }
      });
      
    } catch (error) {
      console.log(`  ❌ Error reading log file: ${error.message}`);
    }
  }

  // Check for PayloadCMS specific logging
  console.log('\n📋 STEP 3: Checking PayloadCMS logging configuration...');
  
  try {
    // Check if payload.config.ts has logging configuration
    const configPath = path.join(__dirname, 'payload.config.ts');
    const configContent = await fs.promises.readFile(configPath, 'utf8');
    
    if (configContent.includes('logger')) {
      console.log('✅ PayloadCMS logging configuration found in payload.config.ts');
      
      // Extract logging configuration
      const loggerMatch = configContent.match(/logger:\s*{[^}]*}/);
      if (loggerMatch) {
        console.log('  📋 Logger configuration:');
        console.log(`    ${loggerMatch[0]}`);
      }
    } else {
      console.log('⚠️  No explicit PayloadCMS logging configuration found');
      console.log('💡 PayloadCMS uses default console logging');
    }
    
  } catch (error) {
    console.log('⚠️  Could not check PayloadCMS configuration');
  }

  // Check for Next.js logging (if applicable)
  console.log('\n📋 STEP 4: Checking Next.js logging...');
  
  try {
    const nextConfigPath = path.join(__dirname, 'next.config.js');
    const nextConfigExists = await fs.promises.access(nextConfigPath).then(() => true).catch(() => false);
    
    if (nextConfigExists) {
      console.log('✅ Next.js configuration found');
      console.log('💡 Next.js logs are typically written to stdout/stderr');
    } else {
      console.log('⚠️  No Next.js configuration found');
    }
  } catch (error) {
    console.log('⚠️  Could not check Next.js configuration');
  }

  // Provide recommendations
  console.log('\n📋 STEP 5: Log analysis recommendations...');
  
  console.log('💡 To get more detailed error information:');
  console.log('   1. Enable debug logging in PayloadCMS configuration');
  console.log('   2. Check terminal output when running the server');
  console.log('   3. Use browser developer tools to inspect network requests');
  console.log('   4. Add custom error logging to geospatial endpoints');
  console.log('   5. Check database logs if available');
  
  if (foundLogs.length === 0) {
    console.log('\n🔧 To enable file logging:');
    console.log('   1. Add a logger configuration to payload.config.ts');
    console.log('   2. Use a logging library like winston or pino');
    console.log('   3. Configure log rotation for production');
  }

  console.log('\n🎯 SERVER LOG CHECK SUMMARY:');
  console.log(`✅ Log file search completed (${foundLogs.length} files found)`);
  console.log('✅ Log content analysis completed');
  console.log('✅ PayloadCMS logging check completed');
  console.log('✅ Next.js logging check completed');
  console.log('✅ Recommendations provided');
  console.log('\n🎉 Server log analysis finished!');
}

checkServerLogs().catch(console.error);