import { NextResponse } from 'next/server';
import { initializeApp } from '@/lib/init';

export async function POST() {
  try {
    await initializeApp();
    
    return NextResponse.json({
      success: true,
      message: 'Application initialized successfully'
    });
  } catch (error) {
    console.error('Initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize application' },
      { status: 500 }
    );
  }
} 