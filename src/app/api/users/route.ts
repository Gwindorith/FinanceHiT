import { NextRequest, NextResponse } from 'next/server';
import { requireRole, getAllUsers, createUser } from '@/lib/auth';

// GET /api/users - Get all users (admin only)
export const GET = requireRole(['admin'])(async (request: NextRequest) => {
  try {
    const users = await getAllUsers();
    return NextResponse.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// POST /api/users - Create new user (admin only)
export const POST = requireRole(['admin'])(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { username, email, password, role, name } = body;

    if (!username || !email || !password || !role || !name) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'user', 'manager'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const newUser = await createUser({
      username,
      email,
      password,
      role,
      name,
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 