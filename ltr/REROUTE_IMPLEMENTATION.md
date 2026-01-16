# Reroute Feature - Implementation Guide

## Overview
The reroute feature helps users find alternative trains when their scheduled train is delayed (>15 minutes) or cancelled.


## Files Created

### 1. Backend
- **`lib/stations.ts`**: Static mapping of nearby interchange stations
- **`app/api/trains/[id]/reroutes/route.ts`**: API endpoint for reroute suggestions

### 2. Frontend
- **`components/RerouteDisplay.tsx`**: React component to display reroute suggestions


## How It Works

### Reroute Trigger Conditions
Reroutes are suggested when:
- `train.status === "cancelled"` OR
- `train.delayMinutes > 15`

### Reroute Logic
1. Identify the train's station (`stationName`)
2. Fetch all other trains from the same station
3. Exclude the delayed/cancelled train
4. Sort by:
   - Status: `on_time` trains first
   - Delay: Least delayed trains first
5. Return top 3 alternatives
6. If no alternatives found, suggest nearby stations

---

## API Usage

### Endpoint
```
GET /api/trains/:id/reroutes
```

### Example Request
```bash
curl http://localhost:3000/api/trains/679d9a5b3c4d2e3f4a5b6c7d/reroutes
```

### Response Types

#### 1. Reroute Required with Alternatives
```json
{
  "rerouteRequired": true,
  "reason": "Train delayed by 25 minutes",
  "train": {
    "trainNumber": "12951",
    "trainName": "Mumbai Rajdhani Express",
    "stationName": "Mumbai Central",
    "status": "delayed",
    "delayMinutes": 25
  },
  "alternativeTrains": [
    {
      "trainId": "...",
      "trainNumber": "12952",
      "trainName": "Shatabdi Express",
      "platform": "3",
      "status": "on_time",
      "delayMinutes": 0
    }
  ],
  "alternativesCount": 1,
  "message": "Found 1 alternative train(s) at Mumbai Central"
}
```

#### 2. No Alternatives - Nearby Stations Suggested
```json
{
  "rerouteRequired": true,
  "reason": "Train has been cancelled",
  "alternativeTrains": [],
  "suggestedStations": ["Dadar", "Bandra"],
  "message": "No alternative trains available at Mumbai Central. Consider checking nearby stations."
}
```

#### 3. No Reroute Needed
```json
{
  "rerouteRequired": false,
  "message": "Train is on time or has minimal delay",
  "train": {
    "trainNumber": "12951",
    "status": "on_time",
    "delayMinutes": 5
  }
}
```

---

## Frontend Integration

### Using the RerouteDisplay Component

```tsx
import RerouteDisplay from '@/components/RerouteDisplay';

export default function TrainDetailsPage({ trainId }: { trainId: string }) {
  return (
    <div>
      <h1>Train Details</h1>
      
      {/* Show reroute suggestions if needed */}
      <RerouteDisplay trainId={trainId} />
      
      {/* Other train details */}
    </div>
  );
}
```

### Component Features
- ✅ Automatic loading state
- ✅ Error handling
- ✅ Shows alert when reroute is needed
- ✅ Lists alternative trains with status badges
- ✅ Suggests nearby stations when no alternatives found
- ✅ Green badge when train is on time

---

## Nearby Stations Configuration

Edit `lib/stations.ts` to add more station mappings:

```typescript
export const nearbyStations: Record<string, string[]> = {
  "Mumbai Central": ["Dadar", "Bandra", "Churchgate"],
  "Dadar": ["Mumbai Central", "Bandra", "Kurla"],
  // Add more stations here
};
```

---

## Testing

### Test Scenarios

#### 1. Train with Major Delay (>15 min)
```bash
# First, create a delayed train
POST /api/trains
{
  "trainNumber": "12345",
  "trainName": "Test Express",
  "stationName": "Mumbai Central",
  "delayMinutes": 25,
  "status": "delayed"
}

# Then check reroutes
GET /api/trains/{trainId}/reroutes
# Should return alternativeTrains
```

#### 2. Cancelled Train
```bash
# Create a cancelled train
POST /api/trains
{
  "trainNumber": "12346",
  "trainName": "Test Local",
  "stationName": "Mumbai Central",
  "status": "cancelled"
}

# Check reroutes
GET /api/trains/{trainId}/reroutes
# Should return alternativeTrains or suggestedStations
```

#### 3. On-Time Train
```bash
# Create an on-time train
POST /api/trains
{
  "trainNumber": "12347",
  "trainName": "Test Rajdhani",
  "stationName": "Mumbai Central",
  "delayMinutes": 5,
  "status": "on_time"
}

# Check reroutes
GET /api/trains/{trainId}/reroutes
# Should return rerouteRequired: false
```

---

## Error Handling

The API handles these errors:
- ❌ Invalid train ID format → 400 Bad Request
- ❌ Train not found → 404 Not Found
- ❌ Server errors → 500 Internal Server Error

---

## UI Design Guidelines

### Visual Indicators
- 🟢 **Green Badge**: Train is on time
- 🟡 **Yellow Alert**: Reroute suggested (delay >15 min)
- 🔴 **Red Badge**: Train cancelled

### User Experience
- ⚠️ Show prominent alert for delayed/cancelled trains
- 📋 List alternatives in order of preference (on-time first)
- 🗺️ Suggest nearby stations only when no local alternatives
- ℹ️ Always include disclaimer about verifying information

### Do NOT
- ❌ Auto-redirect users to alternative trains
- ❌ Hide the original train information
- ❌ Make decisions for the user

### DO
- ✅ Provide clear, actionable information
- ✅ Show all available options
- ✅ Let users make informed decisions

---

## Future Enhancements

### Possible Additions
1. **Real-time Updates**: Use WebSockets for live reroute notifications
2. **User Preferences**: Save preferred routes/destinations
3. **Smart Suggestions**: Learn from user choices
4. **Push Notifications**: Alert users about their saved trains
5. **Multi-leg Journeys**: Suggest complex routes with transfers
6. **Historical Data**: Show typical delay patterns

---

## Troubleshooting

### No Alternatives Showing?
- Check if there are other trains at the same station
- Verify the train's `stationName` matches other trains exactly
- Ensure other trains exist in the database

### Wrong Nearby Stations?
- Update the `nearbyStations` mapping in `lib/stations.ts`
- Make sure station names match exactly (case-sensitive)

### Component Not Loading?
- Check browser console for errors
- Verify the `trainId` prop is valid
- Ensure API endpoint is accessible

---

## Summary

The reroute feature is now fully implemented with:
- ✅ Backend API at `/api/trains/[id]/reroutes`
- ✅ Static nearby stations mapping
- ✅ React component for display
- ✅ Complete documentation
- ✅ Error handling
- ✅ User-friendly UI

Users can now make informed decisions when their trains are delayed or cancelled!
