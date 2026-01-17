/**
 * Reroute Decision Explanation System
 * Generates contextual explanations for why reroutes are suggested
 */

interface Train {
  trainNumber: string;
  trainName: string;
  status: 'on_time' | 'delayed' | 'cancelled';
  delayMinutes: number;
  departureTime: string;
  stationName: string;
  arrivalTime?: string;
}

interface RerouteExplanation {
  mainMessage: string;
  reasons: string[];
  urgencyMessage?: string;
  actionAdvice?: string;
}

/**
 * Calculate minutes until departure
 */
function getMinutesUntilDeparture(departureTime: string): number {
  const now = new Date();
  const [hours, minutes] = departureTime.split(':').map(Number);
  const departure = new Date();
  departure.setHours(hours, minutes, 0, 0);
  
  const diff = departure.getTime() - now.getTime();
  return Math.floor(diff / 60000);
}

/**
 * Compare two time strings (HH:MM format)
 * Returns negative if time1 is earlier, positive if later, 0 if same
 */
function compareTimes(time1: string, time2: string): number {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  
  return minutes1 - minutes2;
}

/**
 * Generate explanation for why no reroute is needed
 */
export function generateNoRerouteExplanation(train: Train): RerouteExplanation {
  const reasons: string[] = [];
  
  if (train.status === 'on_time') {
    reasons.push('Train is currently on time');
  } else if (train.delayMinutes <= 15) {
    reasons.push(`Train has only a minor delay of ${train.delayMinutes} minutes`);
    reasons.push('The train can still be boarded as scheduled');
  }
  
  return {
    mainMessage: 'No reroute needed',
    reasons,
    actionAdvice: 'Please proceed to your designated platform',
  };
}

/**
 * Generate explanation for cancelled train
 */
export function generateCancelledTrainExplanation(
  originalTrain: Train,
  hasAlternatives: boolean
): RerouteExplanation {
  const reasons: string[] = ['Your train has been cancelled'];
  
  if (hasAlternatives) {
    reasons.push('The following trains are the best available alternatives based on current status');
  } else {
    reasons.push('Unfortunately, no alternative trains are currently available');
  }
  
  return {
    mainMessage: 'Train Cancellation',
    reasons,
    actionAdvice: hasAlternatives 
      ? 'Please review the alternatives below and proceed to the appropriate platform'
      : 'Please check station announcements or consult station staff for further assistance',
  };
}

/**
 * Generate explanation for a same-station alternative
 */
export function generateSameStationExplanation(
  originalTrain: Train,
  alternativeTrain: Train
): RerouteExplanation {
  const reasons: string[] = [];
  const timeDiff = compareTimes(alternativeTrain.departureTime, originalTrain.departureTime);
  const minutesUntilDeparture = getMinutesUntilDeparture(alternativeTrain.departureTime);
  
  // Analyze why this is a good alternative
  if (alternativeTrain.status === 'on_time') {
    reasons.push('Train is currently on time');
    
    if (timeDiff < 0) {
      reasons.push('Departs earlier than your delayed train');
    } else if (timeDiff === 0) {
      reasons.push('Departs at the same scheduled time');
    }
  } else if (alternativeTrain.status === 'delayed') {
    const delayDifference = originalTrain.delayMinutes - alternativeTrain.delayMinutes;
    
    if (delayDifference > 0) {
      reasons.push(`Delay is significantly less than your train (${alternativeTrain.delayMinutes} mins vs ${originalTrain.delayMinutes} mins)`);
      reasons.push('Next available option from the same station');
    } else {
      reasons.push('Alternative train from the same station');
    }
  }
  
  reasons.push('Available at the same station');
  
  const explanation: RerouteExplanation = {
    mainMessage: 'Why this reroute?',
    reasons,
  };
  
  // Add urgency message if departure is soon
  if (minutesUntilDeparture <= 30 && minutesUntilDeparture > 0) {
    explanation.urgencyMessage = '⏰ Heads up: This train departs soon. Please check platform details immediately.';
  }
  
  return explanation;
}

/**
 * Generate explanation for nearby-station alternative
 */
export function generateNearbyStationExplanation(
  originalTrain: Train,
  alternativeTrain: Train
): RerouteExplanation {
  const reasons: string[] = [
    'No suitable trains available at your station',
  ];
  
  if (alternativeTrain.status === 'on_time') {
    reasons.push('This train is on time at a nearby interchange station');
  } else {
    reasons.push(`This train has minimal delay (${alternativeTrain.delayMinutes} mins) at a nearby station`);
  }
  
  reasons.push('Commonly used alternative route');
  
  const minutesUntilDeparture = getMinutesUntilDeparture(alternativeTrain.departureTime);
  
  const explanation: RerouteExplanation = {
    mainMessage: 'Why this reroute?',
    reasons,
    actionAdvice: `Travel to ${alternativeTrain.stationName} station`,
  };
  
  // Add urgency message if departure is soon
  if (minutesUntilDeparture <= 30 && minutesUntilDeparture > 0) {
    explanation.urgencyMessage = '⏰ Heads up: This train departs soon. Factor in travel time to the nearby station.';
  }
  
  return explanation;
}

/**
 * Generate explanation when no alternatives are available at same station
 */
export function generateNoSameStationAlternativesExplanation(
  stationName: string,
  nearbyStations: string[]
): RerouteExplanation {
  const reasons: string[] = [
    'No alternative trains are available at this station at the moment',
  ];
  
  if (nearbyStations.length > 0) {
    reasons.push('You may consider checking nearby stations for better options');
  }
  
  return {
    mainMessage: 'No alternatives at current station',
    reasons,
    actionAdvice: nearbyStations.length > 0 
      ? `Consider checking: ${nearbyStations.join(', ')}`
      : 'Please check station announcements for updates',
  };
}

/**
 * Generate explanation when no alternatives exist anywhere
 */
export function generateNoAlternativesExplanation(): RerouteExplanation {
  return {
    mainMessage: 'No alternatives available',
    reasons: [
      'No suitable alternative trains are available at the moment',
      'All other trains may be cancelled or heavily delayed',
    ],
    actionAdvice: 'Please check again later or consult station announcements',
  };
}

/**
 * Main function to generate comprehensive explanation for an alternative
 */
export function generateAlternativeExplanation(
  originalTrain: Train,
  alternativeTrain: Train,
  isNearbyStation: boolean = false
): RerouteExplanation {
  if (isNearbyStation) {
    return generateNearbyStationExplanation(originalTrain, alternativeTrain);
  } else {
    return generateSameStationExplanation(originalTrain, alternativeTrain);
  }
}
