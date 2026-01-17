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

    // Check if reroute is needed
    const isCancelled = train.status === 'cancelled';
    const isDelayed = train.delayMinutes > 15;
    const rerouteRequired = isCancelled || isDelayed;

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
        message: explanation.mainMessage,
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

    // Find alternative trains from the same station
    const alternativeTrains = await Train.find({
      stationName: train.stationName,
      _id: { $ne: train._id }, // Exclude the current train
    })
      .select('trainNumber trainName platform arrivalTime departureTime status delayMinutes source destination stationName')
      .sort({
        status: 1, // on_time comes before delayed/cancelled
        delayMinutes: 1, // then by least delay
      })
      .limit(3);

    // Get nearby stations
    const nearbyStations = getNearbyStations(train.stationName);
    
    let nearbyStationTrains: any[] = [];
    
    // If no alternatives at current station, fetch from nearby stations
    if (alternativeTrains.length === 0 && nearbyStations.length > 0) {
      nearbyStationTrains = await Train.find({
        stationName: { $in: nearbyStations },
      })
        .select('trainNumber trainName platform arrivalTime departureTime status delayMinutes source destination stationName')
        .sort({
          status: 1,
          delayMinutes: 1,
        })
        .limit(5);
    }

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
        nearbyStations
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
      suggestedStations: nearbyStations,
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
