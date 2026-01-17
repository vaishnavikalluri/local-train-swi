import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Get current user profile
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    console.log('[Profile API] Token received:', token ? token.substring(0, 20) + '...' : 'none');

    if (!token) {
      console.log('[Profile API] No token provided');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    console.log('[Profile API] Token decoded:', decoded);
    
    if (!decoded) {
      console.log('[Profile API] Token verification failed');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('[Profile API] Connecting to database...');
    await connectDB();
    console.log('[Profile API] Database connected');

    console.log('[Profile API] Looking up user with ID:', decoded.userId);
    const user = await User.findById(decoded.userId).select('name email role stationName');
    console.log('[Profile API] User found:', user ? { name: user.name, email: user.email, role: user.role } : 'null');

    if (!user) {
      console.log('[Profile API] User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const response = {
      name: user.name,
      email: user.email,
      role: user.role,
      stationName: user.stationName,
    };
    console.log('[Profile API] Returning user data:', response);
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[Profile API] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    );
  }
}
