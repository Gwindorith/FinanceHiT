import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername, verifyPassword, generateToken } from '@/lib/auth';

export async function GET() {
  return NextResponse.json({ message: 'Login endpoint is working' });
}

export async function POST(request: NextRequest) {
  console.log('POST request received at /api/login');
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('Login attempt for username:', username);

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const user = await findUserByUsername(username);
    if (!user) {
      console.log('User not found:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', username);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    console.log('Login successful for user:', username);

    // Set cookie on the response
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Login successful'
    });
    response.cookies.set('session_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours in seconds
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 