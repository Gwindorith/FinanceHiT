import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sign, verify } from 'jsonwebtoken';
import { 
  getAllUsers as dbGetAllUsers, 
  getUserById as dbGetUserById, 
  getUserByUsername as dbGetUserByUsername, 
  createUser as dbCreateUser, 
  updateUser as dbUpdateUser, 
  deleteUser as dbDeleteUser,
  initializeDefaultAdmin 
} from './database.pg';

export interface User {
  id?: number;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Default admin user (will be created in database)
export const DEFAULT_ADMIN_USER = {
  id: 1,
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin' as const,
  name: 'Administrator',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: Omit<User, 'password'>): string {
  return sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): any {
  try {
    return verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function getSessionToken(): string | null {
  const cookieStore = cookies();
  return cookieStore.get('session_token')?.value || null;
}

export function setSessionToken(token: string): void {
  const cookieStore = cookies();
  cookieStore.set('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
  });
}

export function clearSessionToken(): void {
  const cookieStore = cookies();
  cookieStore.delete('session_token');
}

export function getCurrentUser(): User | null {
  const token = getSessionToken();
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  return {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email,
    role: decoded.role,
    name: decoded.name,
    created_at: decoded.created_at,
    updated_at: decoded.updated_at,
  };
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest) => {
    const user = getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(request, user);
  };
}

export function requireRole(roles: string[]) {
  return (handler: Function) => {
    return async (request: NextRequest) => {
      const user = getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      if (!roles.includes(user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      
      return handler(request, user);
    };
  };
}

// Database-based user functions
export async function findUserByUsername(username: string): Promise<(User & { password: string }) | null> {
  const user = await dbGetUserByUsername(username);
  return user || null;
}

export async function findUserById(id: number): Promise<User | null> {
  const user = await dbGetUserById(id);
  return user || null;
}

export async function createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }): Promise<User> {
  const hashedPassword = await hashPassword(userData.password);
  const newUser = await dbCreateUser({
    ...userData,
    password: hashedPassword,
  });
  return newUser;
}

export async function getAllUsers(): Promise<User[]> {
  return await dbGetAllUsers();
}

export async function updateUser(id: number, userData: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
  const updatedUser = await dbUpdateUser(id, userData);
  return updatedUser || null;
}

export async function deleteUser(id: number): Promise<boolean> {
  return await dbDeleteUser(id);
} 