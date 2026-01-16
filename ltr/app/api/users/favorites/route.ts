import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Train from '@/models/Train';
import { authenticateUser } from '@/lib/middleware';

// Get all favorite trains for logged-in user
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

    if (auth.role !== 'user') {
      return NextResponse.json(
        { error: 'Unauthorized. Only regular users can access favorites' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get user with populated favorites
    const user = await User.findById(auth.userId).populate('favorites');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      count: user.favorites?.length || 0,
      favorites: user.favorites || [],
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
