import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import EmergencyAlert from '@/models/EmergencyAlert';

// Submit emergency alert (NO AUTH REQUIRED - PUBLIC ENDPOINT)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      boardingStationName,
      platformNumber,
      trainNumber,
      trainName,
      coach,
      seatNumber,
      destinationStationName,
    } = body;

    // Validate all required fields
    const missingFields = [];
    if (!boardingStationName) missingFields.push('Boarding station name');
    if (!platformNumber) missingFields.push('Platform number');
    if (!trainNumber) missingFields.push('Train number');
    if (!trainName) missingFields.push('Train name');
    if (!coach) missingFields.push('Coach/compartment');
    if (!seatNumber) missingFields.push('Seat number');
    if (!destinationStationName) missingFields.push('Destination station name');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    await connectDB();

    // Normalize station names - remove extra spaces and trim
    const normalizeStationName = (name: string) => {
      return name.trim().replace(/\s+/g, ' ');
    };

    // Create emergency alert
    const alert = await EmergencyAlert.create({
      boardingStationName: normalizeStationName(boardingStationName),
      platformNumber: platformNumber.trim(),
      trainNumber: trainNumber.trim(),
      trainName: trainName.trim(),
      coach: coach.trim(),
      seatNumber: seatNumber.trim(),
      destinationStationName: normalizeStationName(destinationStationName),
      status: 'pending',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Emergency alert submitted successfully. Station staff at your boarding and destination stations have been notified.',
        alertId: alert._id,
        boardingStation: boardingStationName,
        destinationStation: destinationStationName,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Emergency alert submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit emergency alert', details: error.message },
      { status: 500 }
    );
  }
}
