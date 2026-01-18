// Simple two-station railway system
export const railwayStations = {
  stationA: {
    id: "station-a",
    name: "Station A",
    position: "start",
    platforms: ["Platform 1", "Platform 2"],
    coordinates: { x: 20, y: 80 }
  },
  stationB: {
    id: "station-b", 
    name: "Station B",
    position: "end",
    platforms: ["Platform 1", "Platform 2"],
    coordinates: { x: 380, y: 160 }
  }
};

// Two parallel tracks connecting Station A to Station B
export const railwayTracks = [
  {
    id: "track-1",
    name: "Track 1 (A to B)",
    direction: "eastbound",
    stations: ["station-a", "station-b"],
    path: "M 20 80 Q 100 75, 200 100 Q 300 125, 380 160"
  },
  {
    id: "track-2", 
    name: "Track 2 (B to A)",
    direction: "westbound",
    stations: ["station-b", "station-a"],
    path: "M 20 95 Q 100 90, 200 115 Q 300 140, 380 175"
  }
];

// Static mapping of nearby interchange stations (simplified)
export const nearbyStations: Record<string, string[]> = {
  "Station A": ["Station B"],
  "Station B": ["Station A"],
  "Lb Nagar": ["Test"], // Test station is nearby Lb Nagar
  "Test": ["Lb Nagar"], // Lb Nagar is nearby Test
  "hyd-lingampally": [], // Add nearby stations if any
  "dadar": [], // Add nearby stations if any
};

export function getNearbyStations(stationName: string): string[] {
  return nearbyStations[stationName] || [];
}

export function getStationById(id: string) {
  return Object.values(railwayStations).find(station => station.id === id);
}

export function getAllStations() {
  return Object.values(railwayStations);
}
