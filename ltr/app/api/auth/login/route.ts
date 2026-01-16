import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';

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
    if (email === 'goldikalluri@gmail.com' && password === 'goldi123') {
      // Validate role if provided
      if (role && role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Invalid role for this account' },
          { status: 403 }
        );
      }
      const token = generateToken('super-admin-id', 'super_admin');
      return NextResponse.json({
        message: 'Login successful',
        token,
        role: 'super_admin',
        user: {
          id: 'super-admin-id',
          name: 'Super Administrator',
          email: 'goldikalluri@gmail.com',
          role: 'super_admin',
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
