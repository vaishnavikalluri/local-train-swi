import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

// Get all unique station names (Public endpoint)
// Supports optional city filter via query parameter
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get city filter from query parameters
    const { searchParams } = new URL(request.url);
    const cityFilter = searchParams.get('city');
    
    // Build query based on city filter
    const query: any = { role: 'station_manager' };
    if (cityFilter) {
      query.city = cityFilter;
    }
    
    // Get station managers filtered by city if provided
    const stationManagers = await User.find(query).select('stationName city');
    
    // Extract station information with city
    const stations = stationManagers
      .filter(manager => manager.stationName) // Remove null/undefined values
      .map(manager => ({
        name: manager.stationName,
        city: manager.city
      }));
    
    // Get unique cities for filtering
    const uniqueCities = Array.from(new Set(stationManagers.map(m => m.city).filter(Boolean))).sort();
    
    // Return stations and cities
    return NextResponse.json({
      success: true,
      count: stations.length,
      stations: stations,
      cities: uniqueCities,
    });
  } catch (error) {
    console.error('Get stations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
