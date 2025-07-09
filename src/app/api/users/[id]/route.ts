import { NextRequest, NextResponse } from 'next/server';
import { requireRole, findUserById, findUserByUsername, updateUser, deleteUser } from '@/lib/auth';

// PUT /api/users/[id] - Update user (admin only)
export const PUT = requireRole(['admin'])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const userId = parseInt(params.id);
    const body = await request.json();
    const { username, email, role, name } = body;

    if (!username || !email || !role || !name) {
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

    // Check if user exists
    const existingUser = await findUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if username is already taken by another user
    const userWithUsername = await findUserByUsername(username);
    if (userWithUsername && userWithUsername.id !== userId) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await updateUser(userId, { username, email, role, name });
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// DELETE /api/users/[id] - Delete user (admin only)
export const DELETE = requireRole(['admin'])(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const userId = parseInt(params.id);

    // Check if user exists
    const existingUser = await findUserById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting the default admin user
    if (userId === 1) {
      return NextResponse.json(
        { error: 'Cannot delete the default admin user' },
        { status: 400 }
      );
    }

    // Delete user
    const success = await deleteUser(userId);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 