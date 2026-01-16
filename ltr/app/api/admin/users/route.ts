import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { authenticateUser } from '@/lib/middleware';

// Get all users (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request);
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error },
        { status: 401 }
      );
    }

    if (auth.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only super admin can view all users' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get only regular users (not station managers or super admins)
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
