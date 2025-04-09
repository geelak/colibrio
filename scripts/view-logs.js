#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Get log directory
const logsDir = path.join(process.cwd(), 'logs');

// Check if logs directory exists
if (!fs.existsSync(logsDir)) {
  console.log('No logs directory found. Create it by running your app first.');
  process.exit(1);
}

// Get all log files
const logFiles = fs.readdirSync(logsDir)
  .filter(file => file.startsWith('client-logs-'))
  .sort()
  .reverse(); // Latest first

if (logFiles.length === 0) {
  console.log('No log files found.');
  process.exit(1);
}

// By default, show the latest log file
const latestLogFile = logFiles[0];
const logFilePath = path.join(logsDir, latestLogFile);

// Parse command line arguments
const args = process.argv.slice(2);
let linesToShow = 20; // Default
let filterLevel = null;

// Check for -n argument to show more lines
const nIndex = args.indexOf('-n');
if (nIndex !== -1 && args[nIndex + 1]) {
  linesToShow = parseInt(args[nIndex + 1], 10) || 20;
}

// Check for --level argument to filter by log level
const levelIndex = args.indexOf('--level');
if (levelIndex !== -1 && args[levelIndex + 1]) {
  filterLevel = args[levelIndex + 1];
}

// Check for -f argument to follow logs
const followMode = args.includes('-f');

console.log(`Showing ${linesToShow} lines from ${latestLogFile}${filterLevel ? ` (level: ${filterLevel})` : ''}`);
console.log('-----------------------------------');

// Function to format a log entry
function formatLogEntry(entry) {
  try {
    const parsed = JSON.parse(entry.substring(entry.indexOf('] ') + 2));
    
    // Apply level filter if specified
    if (filterLevel && parsed.level !== filterLevel) {
      return null;
    }
    
    // Format message
    const timestamp = entry.substring(1, entry.indexOf(']'));
    const level = parsed.level?.toUpperCase() || 'INFO';
    const message = parsed.message || '';
    
    // Format data if available
    let dataStr = '';
    if (parsed.data) {
      dataStr = `\n  ${JSON.stringify(parsed.data, null, 2).replace(/\n/g, '\n  ')}`;
    }
    
    // Return formatted log entry
    return `${timestamp} [${level}] ${message}${dataStr}`;
  } catch (e) {
    return entry; // Return raw entry if parsing fails
  }
}

// Read the file and show tail
async function showLogTail() {
  const fileStream = fs.createReadStream(logFilePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const lines = [];
  for await (const line of rl) {
    const formattedLine = formatLogEntry(line);
    if (formattedLine) {
      lines.push(formattedLine);
      // Keep only the last N lines
      if (lines.length > linesToShow) {
        lines.shift();
      }
    }
  }

  // Print all stored lines
  lines.forEach(line => console.log(line));
}

// Watch file for changes if in follow mode
if (followMode) {
  // Show initial content
  showLogTail().then(() => {
    console.log('\nWatching for changes... (Ctrl+C to exit)');
    
    // Set up file watcher
    fs.watch(logFilePath, (eventType) => {
      if (eventType === 'change') {
        // Get new content since last read
        const stats = fs.statSync(logFilePath);
        const fileSize = stats.size;
        
        // Read only the new content
        const stream = fs.createReadStream(logFilePath, {
          start: fileSize - 4096 > 0 ? fileSize - 4096 : 0,  // Read last 4KB or whole file if smaller
          end: fileSize
        });
        
        let buffer = '';
        stream.on('data', (chunk) => {
          buffer += chunk.toString();
        });
        
        stream.on('end', () => {
          // Get only the last line if there are multiple lines
          const lines = buffer.split('\n');
          if (lines.length > 0) {
            const lastLine = lines[lines.length - 2]; // -2 because last element might be empty string
            if (lastLine) {
              const formattedLine = formatLogEntry(lastLine);
              if (formattedLine) {
                console.log(formattedLine);
              }
            }
          }
        });
      }
    });
  });
} else {
  // Just show log tail once
  showLogTail();
} 