import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Train from '@/models/Train';
import User from '@/models/User';
import { authenticateUser } from '@/lib/middleware';

// Get all trains (Public - Users can view)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const stationName = searchParams.get('stationName');
    const status = searchParams.get('status');
    
    let query: any = {};
    
    if (stationName) {
      query.stationName = stationName;
    }
    
    if (status) {
      query.status = status;
    }

    const trains = await Train.find(query)
      .populate('createdBy', 'name email city')
      .sort({ departureTime: 1 });

    // Transform to include creator name and auto-populate city if missing
    const trainsWithCreator = trains.map(train => {
      const trainObj = train.toObject();
      const createdBy = trainObj.createdBy as any;
      
      // If train doesn't have city but creator has city, use creator's city
      if (!trainObj.city && createdBy && createdBy.city) {
        trainObj.city = createdBy.city;
      }
      
      return {
        ...trainObj,
        createdByName: createdBy ? createdBy.name : 'Unknown'
      };
    });

    console.log(`Found ${trainsWithCreator.length} trains for station: ${stationName || 'all'}`);

    return NextResponse.json({
      success: true,
      count: trainsWithCreator.length,
      trains: trainsWithCreator,
    });
  } catch (error) {
    console.error('Get trains error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new train (Station Manager only)
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

    if (auth.role !== 'station_manager' && auth.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Only station managers can add trains' },
        { status: 403 }
      );
    }

    await connectDB();
    
    const data = await request.json();

    const {
      trainNumber,
      trainName,
      platform,
      arrivalTime,
      departureTime,
      delayMinutes,
      status,
      source,
      destination,
      stationName,
    } = data;

    // Validate required fields
    if (!trainNumber || !trainName || !platform || !arrivalTime || !departureTime || !source || !destination || !stationName) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Get city from station manager's profile
    const stationManager = await User.findById(auth.userId).select('city');
    const city = stationManager?.city || undefined;

    // Check if train number already exists
    const existingTrain = await Train.findOne({ trainNumber });
    
    if (existingTrain) {
      return NextResponse.json(
        { error: 'Train with this number already exists' },
        { status: 400 }
      );
    }

    // Create train
    const train = await Train.create({
      trainNumber,
      trainName,
      platform,
      arrivalTime,
      departureTime,
      delayMinutes: delayMinutes || 0,
      status: status || 'on_time',
      source,
      destination,
      stationName,
      city,
      createdBy: auth.userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Train added successfully',
      train,
    }, { status: 201 });
  } catch (error) {
    console.error('Create train error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
