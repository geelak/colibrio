import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

// Helper function to format logs with timestamps
function formatLog(data: any): string {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS');
  return `[${timestamp}] ${JSON.stringify(data)}\n`;
}

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file path with date
const getLogFilePath = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return path.join(logsDir, `client-logs-${today}.log`);
};

// Handle POST requests to /api/log
export async function POST(request: NextRequest) {
  try {
    // Parse the JSON body
    const body = await request.json();
    
    // Log to server console
    console.log('Client log:', body);
    
    // Write to log file
    const logMessage = formatLog(body);
    fs.appendFileSync(getLogFilePath(), logMessage);
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging:', error);
    return NextResponse.json({ success: false, error: 'Failed to log' }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 