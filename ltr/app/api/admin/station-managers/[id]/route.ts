import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { authenticateUser } from '@/lib/middleware';
import mongoose from 'mongoose';

// Get single station manager
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    const { id } = await params;
    
    // Validate MongoDB ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid station manager ID format' },
        { status: 400 }
      );
    }

    let stationManager;
    try {
      stationManager = await User.findById(id).select('-password');
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid station manager ID' },
        { status: 400 }
      );
    }

    if (!stationManager) {
      return NextResponse.json(
        { error: 'Station manager not found' },
        { status: 404 }
      );
    }

    if (stationManager.role !== 'station_manager') {
      return NextResponse.json(
        { error: 'This user is not a station manager' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      stationManager,
    });
  } catch (error) {
    console.error('Get station manager error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update station manager
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: 'Unauthorized. Only super admin can update station managers' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { id } = await params;
    const data = await request.json();

    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    // Find and update the station manager
    const stationManager = await User.findById(id);

    if (!stationManager || stationManager.role !== 'station_manager') {
      return NextResponse.json(
        { error: 'Station manager not found' },
        { status: 404 }
      );
    }

    const updatedManager = await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      message: 'Station manager updated successfully',
      stationManager: updatedManager,
    });
  } catch (error) {
    console.error('Update station manager error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete station manager
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: 'Unauthorized. Only super admin can delete station managers' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;

    // Find and delete the station manager
    const stationManager = await User.findById(id);

    if (!stationManager || stationManager.role !== 'station_manager') {
      return NextResponse.json(
        { error: 'Station manager not found' },
        { status: 404 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Station manager deleted successfully',
    });
  } catch (error) {
    console.error('Delete station manager error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
