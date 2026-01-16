// Static mapping of nearby interchange stations
export const nearbyStations: Record<string, string[]> = {
  "Mumbai Central": ["Dadar", "Bandra", "Churchgate"],
  "Dadar": ["Mumbai Central", "Bandra", "Kurla"],
  "Bandra": ["Mumbai Central", "Dadar", "Andheri"],
  "Andheri": ["Bandra", "Borivali", "Goregaon"],
  "Borivali": ["Andheri", "Virar"],
  "Churchgate": ["Mumbai Central", "Marine Lines"],
  "Thane": ["Kalyan", "Dadar"],
  "Kalyan": ["Thane", "Dombivli"],
  "Secunderabad": ["Hyderabad", "Begumpet"],
  "Hyderabad": ["Secunderabad", "Kacheguda"],
};

export function getNearbyStations(stationName: string): string[] {
  return nearbyStations[stationName] || [];
}
