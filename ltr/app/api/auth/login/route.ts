import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';
import { SUPER_ADMIN } from '@/lib/superAdmin';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Hardcoded Super Admin check
    if (email === SUPER_ADMIN.email && password === SUPER_ADMIN.password) {
      // Validate role if provided
      if (role && role !== SUPER_ADMIN.role) {
        return NextResponse.json(
          { error: 'Invalid role for this account' },
          { status: 403 }
        );
      }
      const token = generateToken(SUPER_ADMIN.id, SUPER_ADMIN.role);
      return NextResponse.json({
        message: 'Login successful',
        token,
        role: SUPER_ADMIN.role,
        user: {
          id: SUPER_ADMIN.id,
          name: SUPER_ADMIN.name,
          email: SUPER_ADMIN.email,
          role: SUPER_ADMIN.role,
        },
      });
    }

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Validate role if provided
    if (role && role !== user.role) {
      return NextResponse.json(
        { error: `Invalid role. This account is registered as ${user.role}` },
        { status: 403 }
      );
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.role, user.stationName);

    return NextResponse.json({
      message: 'Login successful',
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        stationName: user.stationName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
