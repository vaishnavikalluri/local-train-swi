import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

export async function authenticateUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return { authenticated: false, error: 'No token provided' };
  }

  const decoded = verifyToken(token);
  
  if (!decoded) {
    return { authenticated: false, error: 'Invalid token' };
  }

  return { authenticated: true, userId: decoded.userId, role: decoded.role };
}

export function requireRole(allowedRoles: string[]) {
  return (role: string) => {
    return allowedRoles.includes(role);
  };
}
