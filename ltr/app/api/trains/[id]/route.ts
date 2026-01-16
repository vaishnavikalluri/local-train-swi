import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Train from '@/models/Train';
import { authenticateUser } from '@/lib/middleware';

// Get single train by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const train = await Train.findById(id).populate('createdBy', 'name email');

    if (!train) {
      return NextResponse.json(
        { error: 'Train not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      train,
    });
  } catch (error) {
    console.error('Get train error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update train (Station Manager only)
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

    if (auth.role !== 'station_manager' && auth.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only station managers can update trains' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const { id } = await params;
    const data = await request.json();

    // Find the train
    const train = await Train.findById(id);

    if (!train) {
      return NextResponse.json(
        { error: 'Train not found' },
        { status: 404 }
      );
    }

    // Update train
    const updatedTrain = await Train.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Train updated successfully',
      train: updatedTrain,
    });
  } catch (error) {
    console.error('Update train error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete train (Station Manager only)
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

    if (auth.role !== 'station_manager' && auth.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only station managers can delete trains' },
        { status: 403 }
      );
    }

    await connectDB();

    const { id } = await params;

    // Find and delete the train
    const train = await Train.findByIdAndDelete(id);

    if (!train) {
      return NextResponse.json(
        { error: 'Train not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Train deleted successfully',
    });
  } catch (error) {
    console.error('Delete train error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
