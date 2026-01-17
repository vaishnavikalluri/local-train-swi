import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EmergencyAlert from '@/models/EmergencyAlert';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

// Get emergency alerts for station manager's station
// Shows alerts where manager's station is EITHER boarding OR destination
export async function GET(request: NextRequest) {
  try {
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

    await connectDB();

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'station_manager') {
      return NextResponse.json(
        { error: 'Access denied. Station manager role required.' },
        { status: 403 }
      );
    }

    if (!user.stationName) {
      return NextResponse.json(
        { error: 'No station assigned to this manager' },
        { status: 400 }
      );
    }

    // Get status filter from query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'all';

    // Build query - show alerts where station is EITHER boarding OR destination
    const query: any = {
      $or: [
        { boardingStationName: user.stationName },
        { destinationStationName: user.stationName },
      ],
    };

    if (statusFilter !== 'all') {
      query.status = statusFilter;
    }

    // Get emergency alerts for this station
    const alerts = await EmergencyAlert.find(query)
      .populate('acknowledgedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    // Get counts by status
    const pendingCount = await EmergencyAlert.countDocuments({
      $or: [
        { boardingStationName: user.stationName },
        { destinationStationName: user.stationName },
      ],
      status: 'pending',
    });

    const acknowledgedCount = await EmergencyAlert.countDocuments({
      $or: [
        { boardingStationName: user.stationName },
        { destinationStationName: user.stationName },
      ],
      status: 'acknowledged',
    });

    const resolvedCount = await EmergencyAlert.countDocuments({
      $or: [
        { boardingStationName: user.stationName },
        { destinationStationName: user.stationName },
      ],
      status: 'resolved',
    });

    return NextResponse.json({
      success: true,
      stationName: user.stationName,
      alerts,
      counts: {
        pending: pendingCount,
        acknowledged: acknowledgedCount,
        resolved: resolvedCount,
        total: pendingCount + acknowledgedCount + resolvedCount,
      },
    });
  } catch (error: any) {
    console.error('Get emergency alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency alerts', details: error.message },
      { status: 500 }
    );
  }
}
