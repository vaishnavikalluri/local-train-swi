import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EmergencyAlert from '@/models/EmergencyAlert';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

// Update emergency alert status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid alert ID format' },
        { status: 400 }
      );
    }

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, notes } = body;

    if (!status || !['pending', 'acknowledged', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (pending, acknowledged, resolved)' },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(decoded.userId);

    if (!user || user.role !== 'station_manager') {
      return NextResponse.json(
        { error: 'Access denied. Station manager role required.' },
        { status: 403 }
      );
    }

    const alert = await EmergencyAlert.findById(id);

    if (!alert) {
      return NextResponse.json(
        { error: 'Emergency alert not found' },
        { status: 404 }
      );
    }

    // Verify the alert involves manager's station (boarding OR destination)
    if (
      alert.boardingStationName !== user.stationName &&
      alert.destinationStationName !== user.stationName
    ) {
      return NextResponse.json(
        { error: 'This alert does not involve your station' },
        { status: 403 }
      );
    }

    // Update the alert
    const updateData: any = {
      status,
      notes: notes || alert.notes,
    };

    if (status === 'acknowledged' && alert.status === 'pending') {
      updateData.acknowledgedBy = user._id;
      updateData.acknowledgedAt = new Date();
    }

    if (status === 'resolved' && alert.status !== 'resolved') {
      updateData.resolvedAt = new Date();
    }

    const updatedAlert = await EmergencyAlert.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('acknowledgedBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Emergency alert updated successfully',
      alert: updatedAlert,
    });
  } catch (error: any) {
    console.error('Update emergency alert error:', error);
    return NextResponse.json(
      { error: 'Failed to update emergency alert', details: error.message },
      { status: 500 }
    );
  }
}
