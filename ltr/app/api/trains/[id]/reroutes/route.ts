import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Train from '@/models/Train';
import { getNearbyStations } from '@/lib/stations';
import mongoose from 'mongoose';
import {
  generateNoRerouteExplanation,
  generateCancelledTrainExplanation,
  generateAlternativeExplanation,
  generateNoSameStationAlternativesExplanation,
  generateNoAlternativesExplanation,
} from '@/lib/rerouteExplanation';

// Get reroute suggestions for a train
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid train ID format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the train
    const train = await Train.findById(id);

    if (!train) {
      return NextResponse.json(
        { error: 'Train not found' },
        { status: 404 }
      );
    }

    // Check if reroute is needed - only for delays >= 15 minutes or cancelled
    const isCancelled = train.status === 'cancelled';
    const isSignificantDelay = train.delayMinutes >= 15;
    
    // Check if train already departed (including delay and date)
    const now = new Date();
    
    // Parse departure time - handle both "HH:MM" and ISO datetime strings
    let scheduledDeparture: Date;
    if (/^\d{2}:\d{2}$/.test(train.departureTime)) {
      // Time only format - assume today
      const [depHours, depMins] = train.departureTime.split(':').map(Number);
      scheduledDeparture = new Date();
      scheduledDeparture.setHours(depHours, depMins, 0, 0);
    } else {
      // ISO datetime format
      scheduledDeparture = new Date(train.departureTime);
    }
    
    // Add delay to scheduled departure time to get actual departure time
    const actualDeparture = new Date(scheduledDeparture.getTime() + train.delayMinutes * 60000);
    
    const trainAlreadyDeparted = now > actualDeparture;
    const rerouteRequired = (isCancelled || isSignificantDelay) && !trainAlreadyDeparted;

    if (!rerouteRequired) {
      const explanation = generateNoRerouteExplanation({
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        status: train.status,
        delayMinutes: train.delayMinutes,
        departureTime: train.departureTime,
        stationName: train.stationName,
      });

      return NextResponse.json({
        rerouteRequired: false,
        message: trainAlreadyDeparted ? 'Train has already departed' : explanation.mainMessage,
        explanation,
        train: {
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          status: train.status,
          delayMinutes: train.delayMinutes,
        },
      });
    }

    // Determine reason
    const reason = isCancelled
      ? 'Train has been cancelled'
      : `Train delayed by ${train.delayMinutes} minutes`;

    // Calculate current time for checking if alternative trains have departed
    const currentTimeStr = now.toISOString();

    console.log('=== Reroute Search Debug ===');
    console.log('Current train:', train.trainNumber, train.trainName);
    console.log('From:', train.stationName, '-> To:', train.destination);
    console.log('Current datetime:', now.toISOString());
    console.log('Train scheduled departure:', train.departureTime);
    console.log('Train delay:', train.delayMinutes, 'mins');
    console.log('Actual departure:', actualDeparture.toISOString());

    // DEBUG: Check what station names exist in the database
    const allTrains = await Train.find({}).select('trainName stationName destination');
    console.log('All trains in database:', allTrains.map(t => ({
      name: t.trainName,
      station: t.stationName,
      dest: t.destination
    })));

    // Find alternative trains from the same station (fetch all, filter in code)
    const sameStationCandidates = await Train.find({
      stationName: train.stationName,
      _id: { $ne: train._id }, // Exclude the current train
      destination: train.destination, // Same destination
      status: { $ne: 'cancelled' }, // Exclude cancelled trains
    })
      .select('trainNumber trainName platform arrivalTime departureTime status delayMinutes source destination stationName');

    // Filter by departure time and delay in JavaScript
    console.log('Same station candidates found:', sameStationCandidates.length);
    const alternativeTrains = sameStationCandidates
      .filter(alt => {
        // Parse departure time and add delay to get actual departure
        let altScheduledDeparture: Date;
        if (/^\d{2}:\d{2}$/.test(alt.departureTime)) {
          const [hours, mins] = alt.departureTime.split(':').map(Number);
          altScheduledDeparture = new Date();
          altScheduledDeparture.setHours(hours, mins, 0, 0);
        } else {
          altScheduledDeparture = new Date(alt.departureTime);
        }
        const altActualDeparture = new Date(altScheduledDeparture.getTime() + alt.delayMinutes * 60000);
        
        console.log(`Checking ${alt.trainName}: scheduled=${alt.departureTime}, delay=${alt.delayMinutes}m, actual=${altActualDeparture.toISOString()}, now=${now.toISOString()}, hasNotDeparted=${altActualDeparture > now}`);
        
        // Check if alternative hasn't departed yet (including its delay) and has acceptable delay
        const hasNotDeparted = altActualDeparture > now;
        const hasAcceptableDelay = alt.status === 'on_time' || alt.delayMinutes < 15;
        
        // Check if alternative departs before or soon after the delayed original train (within 30 min)
        const departsBefore = altActualDeparture.getTime() < actualDeparture.getTime() + (30 * 60000);
        
        return hasNotDeparted && hasAcceptableDelay && departsBefore;
      })
      .sort((a, b) => {
        // Sort by departure time
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      })
      .slice(0, 3);

    console.log('Same station alternatives found:', alternativeTrains.length);

    // Automatically discover nearby stations by finding all trains with same destination at different stations
    let nearbyStationTrains: any[] = [];
    
    const otherStationCandidates = await Train.find({
      stationName: { $ne: train.stationName }, // Different station
      destination: train.destination, // Same destination
      _id: { $ne: train._id }, // Exclude current train
      status: { $ne: 'cancelled' }, // Exclude cancelled trains
    })
      .select('trainNumber trainName platform arrivalTime departureTime status delayMinutes source destination stationName');
    
    console.log('Other station candidates found:', otherStationCandidates.length);
    
    // Filter by departure time and delay in JavaScript
    nearbyStationTrains = otherStationCandidates
      .filter(alt => {
        // Parse departure time and add delay to get actual departure
        let altScheduledDeparture: Date;
        if (/^\d{2}:\d{2}$/.test(alt.departureTime)) {
          const [hours, mins] = alt.departureTime.split(':').map(Number);
          altScheduledDeparture = new Date();
          altScheduledDeparture.setHours(hours, mins, 0, 0);
        } else {
          altScheduledDeparture = new Date(alt.departureTime);
        }
        const altActualDeparture = new Date(altScheduledDeparture.getTime() + alt.delayMinutes * 60000);
        
        console.log(`${alt.trainName} at ${alt.stationName}: scheduled=${alt.departureTime}, delay=${alt.delayMinutes}m, actual=${altActualDeparture.toISOString()}, now=${now.toISOString()}, hasNotDeparted=${altActualDeparture > now}`);
        
        // Check if alternative hasn't departed yet (including its delay) and has acceptable delay
        const hasNotDeparted = altActualDeparture > now;
        const hasAcceptableDelay = alt.status === 'on_time' || alt.delayMinutes < 15;
        
        // Check if alternative departs before or soon after the delayed original train (within 45 min for nearby stations)
        const departsBefore = altActualDeparture.getTime() < actualDeparture.getTime() + (45 * 60000);
        
        return hasNotDeparted && hasAcceptableDelay && departsBefore;
      })
      .sort((a, b) => {
        // Sort by departure time
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      })
      .slice(0, 5);
    
    console.log('Nearby station alternatives found:', nearbyStationTrains.length);
    if (nearbyStationTrains.length > 0) {
      console.log('Alternative stations:', [...new Set(nearbyStationTrains.map(t => t.stationName))]);
    }

    // Get list of discovered nearby station names
    const discoveredNearbyStations = [...new Set(nearbyStationTrains.map(t => t.stationName))];

    // Format alternative trains from same station
    const formattedAlternatives = alternativeTrains.map((alt) => {
      const explanation = generateAlternativeExplanation(
        {
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          status: train.status,
          delayMinutes: train.delayMinutes,
          departureTime: train.departureTime,
          stationName: train.stationName,
        },
        {
          trainNumber: alt.trainNumber,
          trainName: alt.trainName,
          status: alt.status,
          delayMinutes: alt.delayMinutes,
          departureTime: alt.departureTime,
          stationName: alt.stationName,
        },
        false // Same station
      );

      return {
        trainId: alt._id,
        trainNumber: alt.trainNumber,
        trainName: alt.trainName,
        platform: alt.platform,
        arrivalTime: alt.arrivalTime,
        departureTime: alt.departureTime,
        status: alt.status,
        delayMinutes: alt.delayMinutes,
        source: alt.source,
        destination: alt.destination,
        stationName: alt.stationName,
        explanation,
      };
    });
    
    // Format trains from nearby stations
    const formattedNearbyTrains = nearbyStationTrains.map((alt) => {
      const explanation = generateAlternativeExplanation(
        {
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          status: train.status,
          delayMinutes: train.delayMinutes,
          departureTime: train.departureTime,
          stationName: train.stationName,
        },
        {
          trainNumber: alt.trainNumber,
          trainName: alt.trainName,
          status: alt.status,
          delayMinutes: alt.delayMinutes,
          departureTime: alt.departureTime,
          stationName: alt.stationName,
        },
        true // Nearby station
      );

      return {
        trainId: alt._id,
        trainNumber: alt.trainNumber,
        trainName: alt.trainName,
        platform: alt.platform,
        arrivalTime: alt.arrivalTime,
        departureTime: alt.departureTime,
        status: alt.status,
        delayMinutes: alt.delayMinutes,
        source: alt.source,
        destination: alt.destination,
        stationName: alt.stationName,
        explanation,
      };
    });

    // Generate overall explanation based on the situation
    let overallExplanation;
    
    if (isCancelled) {
      overallExplanation = generateCancelledTrainExplanation(
        {
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          status: train.status,
          delayMinutes: train.delayMinutes,
          departureTime: train.departureTime,
          stationName: train.stationName,
        },
        formattedAlternatives.length > 0 || formattedNearbyTrains.length > 0
      );
    } else if (formattedAlternatives.length === 0 && formattedNearbyTrains.length === 0) {
      overallExplanation = generateNoAlternativesExplanation();
    } else if (formattedAlternatives.length === 0 && formattedNearbyTrains.length > 0) {
      overallExplanation = generateNoSameStationAlternativesExplanation(
        train.stationName,
        discoveredNearbyStations
      );
    } else {
      overallExplanation = {
        mainMessage: 'Reroute Suggested',
        reasons: [reason],
        actionAdvice: 'Please review the alternative trains below',
      };
    }

    return NextResponse.json({
      rerouteRequired: true,
      reason,
      explanation: overallExplanation,
      train: {
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        stationName: train.stationName,
        status: train.status,
        delayMinutes: train.delayMinutes,
      },
      sameStationAlternatives: formattedAlternatives,
      sameStationCount: formattedAlternatives.length,
      nearbyStationAlternatives: formattedNearbyTrains,
      nearbyStationCount: formattedNearbyTrains.length,
      suggestedStations: discoveredNearbyStations,
      message:
        formattedAlternatives.length > 0
          ? `Found ${formattedAlternatives.length} alternative train(s) at ${train.stationName}`
          : formattedNearbyTrains.length > 0
          ? `No alternatives at ${train.stationName}. Found ${formattedNearbyTrains.length} train(s) at nearby stations`
          : `No alternative trains available at ${train.stationName} or nearby stations`,
    });
  } catch (error) {
    console.error('Get reroutes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
