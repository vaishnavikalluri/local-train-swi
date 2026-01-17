import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Get all unique station names (Public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all station managers and extract their station names
    const stationManagers = await User.find({ role: 'station_manager' }).select('stationName');
    
    // Extract unique station names
    const stations = stationManagers
      .map(manager => manager.stationName)
      .filter(Boolean); // Remove null/undefined values
    
    // Return unique stations sorted alphabetically
    const uniqueStations = Array.from(new Set(stations)).sort();

    return NextResponse.json({
      success: true,
      count: uniqueStations.length,
      stations: uniqueStations,
    });
  } catch (error) {
    console.error('Get stations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
