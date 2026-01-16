import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Train from '@/models/Train';
import { authenticateUser } from '@/lib/middleware';
import mongoose from 'mongoose';

// Add train to favorites
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ trainId: string }> }
) {
  try {
    const { trainId } = await params;

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
        { error: 'Unauthorized. Only regular users can manage favorites' },
        { status: 403 }
      );
    }

    // Validate train ID format
    if (!mongoose.Types.ObjectId.isValid(trainId)) {
      return NextResponse.json(
        { error: 'Invalid train ID format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if train exists
    const train = await Train.findById(trainId);

    if (!train) {
      return NextResponse.json(
        { error: 'Train not found' },
        { status: 404 }
      );
    }

    // Get user
    const user = await User.findById(auth.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already in favorites
    if (user.favorites?.includes(new mongoose.Types.ObjectId(trainId))) {
      return NextResponse.json(
        { error: 'Train is already in favorites' },
        { status: 400 }
      );
    }

    // Add to favorites
    user.favorites = user.favorites || [];
    user.favorites.push(new mongoose.Types.ObjectId(trainId));
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Train added to favorites',
      train: {
        trainId: train._id,
        trainNumber: train.trainNumber,
        trainName: train.trainName,
      },
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Remove train from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ trainId: string }> }
) {
  try {
    const { trainId } = await params;

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
        { error: 'Unauthorized. Only regular users can manage favorites' },
        { status: 403 }
      );
    }

    // Validate train ID format
    if (!mongoose.Types.ObjectId.isValid(trainId)) {
      return NextResponse.json(
        { error: 'Invalid train ID format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user
    const user = await User.findById(auth.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if train is in favorites
    const trainObjectId = new mongoose.Types.ObjectId(trainId);
    if (!user.favorites?.some(fav => fav.equals(trainObjectId))) {
      return NextResponse.json(
        { error: 'Train is not in favorites' },
        { status: 404 }
      );
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(fav => !fav.equals(trainObjectId));
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Train removed from favorites',
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
