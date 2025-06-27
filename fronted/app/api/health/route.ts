import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'hkex-poc-app'
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Service check failed'
    }, { status: 500 });
  }
} 