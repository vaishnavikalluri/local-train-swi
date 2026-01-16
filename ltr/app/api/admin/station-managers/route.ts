import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { authenticateUser } from '@/lib/middleware';

// Get all station managers (Super Admin only)
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
        { error: 'Unauthorized. Only super admin can view station managers' },
        { status: 403 }
      );
    }

    await connectDB();

    const stationManagers = await User.find({ role: 'station_manager' })
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: stationManagers.length,
      stationManagers,
    });
  } catch (error) {
    console.error('Get station managers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create station manager (Super Admin only)
export async function POST(request: NextRequest) {
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
        { error: 'Unauthorized. Only super admin can create station managers' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { email, password, name, stationName } = await request.json();

    // Validate required fields
    if (!email || !password || !name || !stationName) {
      return NextResponse.json(
        { error: 'Email, password, name, and station name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create station manager
    const stationManager = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'station_manager',
      stationName,
    });

    // Return without password
    const { password: _, ...stationManagerData } = stationManager.toObject();

    return NextResponse.json({
      success: true,
      message: 'Station manager created successfully',
      stationManager: stationManagerData,
    }, { status: 201 });
  } catch (error) {
    console.error('Create station manager error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
