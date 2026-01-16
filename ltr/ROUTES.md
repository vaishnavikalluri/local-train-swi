# API Routes Documentation - Local Train Reroutes System

This document contains all the API endpoints for the Local Train Reroutes (LTR) system.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most routes require JWT token authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Super Admin Routes

> **Note:** Super Admin credentials are hardcoded:  
> **Email:** `goldikalluri@gmail.com`  
> **Password:** `goldi123`  
> Only this email and password will work for Super Admin access.

### 1. Create Station Manager
**Endpoint:** `POST /api/admin/station-managers`  
**Access:** Super Admin only  
**Description:** Create a new station manager account

**Example Request Body #1:**
```json
{
  "email": "manager.central@railway.com",
  "password": "manager@123",
  "name": "Rajesh Kumar",
  "stationName": "Mumbai Central"
}
```

**Example Request Body #2:**
```json
{
  "email": "manager.dadar@railway.com",
  "password": "manager@456",
  "name": "Priya Sharma",
  "stationName": "Dadar"
}
```

**Example Request Body #3:**
```json
{
  "email": "manager.thane@railway.com",
  "password": "manager@789",
  "name": "Amit Patel",
  "stationName": "Thane"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Station manager created successfully",
  "stationManager": {
    "_id": "679d8f4a2b3c1e2f3a4b5c6d",
    "name": "Rajesh Kumar",
    "email": "manager.central@railway.com",
    "role": "station_manager",
    "stationName": "Mumbai Central",
    "createdAt": "2026-01-14T10:30:00.000Z",
    "updatedAt": "2026-01-14T10:30:00.000Z"
  }
}
```

---

### 2. Get All Station Managers
**Endpoint:** `GET /api/admin/station-managers`  
**Access:** Super Admin only  
**Description:** View all station managers in the system

**Example Response:**
```json
{
  "success": true,
  "count": 3,
  "stationManagers": [
    {
      "_id": "679d8f4a2b3c1e2f3a4b5c6d",
      "name": "Rajesh Kumar",
      "email": "manager.central@railway.com",
      "role": "station_manager",
      "stationName": "Mumbai Central",
      "createdAt": "2026-01-14T10:30:00.000Z"
    },
    {
      "_id": "679d8f4a2b3c1e2f3a4b5c6e",
      "name": "Priya Sharma",
      "email": "manager.dadar@railway.com",
      "role": "station_manager",
      "stationName": "Dadar",
      "createdAt": "2026-01-14T11:00:00.000Z"
    },
    {
      "_id": "679d8f4a2b3c1e2f3a4b5c6f",
      "name": "Amit Patel",
      "email": "manager.thane@railway.com",
      "role": "station_manager",
      "stationName": "Thane",
      "createdAt": "2026-01-14T11:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Station Manager
**Endpoint:** `GET /api/admin/station-managers/[id]`  
**Access:** Super Admin only  
**Description:** View details of a specific station manager

**Example:** `GET /api/admin/station-managers/679d8f4a2b3c1e2f3a4b5c6d`

**Example Response:**
```json
{
  "success": true,
  "stationManager": {
    "_id": "679d8f4a2b3c1e2f3a4b5c6d",
    "name": "Rajesh Kumar",
    "email": "manager.central@railway.com",
    "role": "station_manager",
    "stationName": "Mumbai Central",
    "createdAt": "2026-01-14T10:30:00.000Z",
    "updatedAt": "2026-01-14T10:30:00.000Z"
  }
}
```

---

### 4. Update Station Manager
**Endpoint:** `PUT /api/admin/station-managers/[id]`  
**Access:** Super Admin only  
**Description:** Update station manager information

**Example:** `PUT /api/admin/station-managers/679d8f4a2b3c1e2f3a4b5c6d`

**Example Request Body #1 (Update all fields):**
```json
{
  "name": "Rajesh Kumar Verma",
  "stationName": "Mumbai Central (Main)",
  "password": "newManager@456"
}
```

**Example Request Body #2 (Update only name):**
```json
{
  "name": "Priya Sharma Reddy"
}
```

**Example Request Body #3 (Update password only):**
```json
{
  "password": "newSecure@789"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Station manager updated successfully",
  "stationManager": {
    "_id": "679d8f4a2b3c1e2f3a4b5c6d",
    "name": "Rajesh Kumar Verma",
    "email": "manager.central@railway.com",
    "role": "station_manager",
    "stationName": "Mumbai Central (Main)",
    "createdAt": "2026-01-14T10:30:00.000Z",
    "updatedAt": "2026-01-14T15:45:00.000Z"
  }
}
```

---

### 5. Delete Station Manager
**Endpoint:** `DELETE /api/admin/station-managers/[id]`  
**Access:** Super Admin only  
**Description:** Remove a station manager from the system

**Example:** `DELETE /api/admin/station-managers/679d8f4a2b3c1e2f3a4b5c6f`

**Example Response:**
```json
{
  "success": true,
  "message": "Station manager deleted successfully"
}
```

---

## Station Manager Routes

### 7. Create New Train
**Endpoint:** `POST /api/trains`  
**Access:** Station Manager, Super Admin  
**Description:** Add a new train to the system

**Example Request Body #1 (Rajdhani Express):**
```json
{
  "trainNumber": "12951",
  "trainName": "Mumbai Rajdhani Express",
  "platform": "5",
  "arrivalTime": "16:35",
  "departureTime": "16:55",
  "delayMinutes": 0,
  "status": "on_time",
  "source": "Mumbai Central",
  "destination": "New Delhi",
  "stationName": "Mumbai Central"
}
```

**Example Request Body #2 (Shatabdi Express):**
```json
{
  "trainNumber": "12009",
  "trainName": "Shatabdi Express",
  "platform": "3",
  "arrivalTime": "06:25",
  "departureTime": "06:30",
  "delayMinutes": 0,
  "status": "on_time",
  "source": "Mumbai Central",
  "destination": "Ahmedabad",
  "stationName": "Mumbai Central"
}
```

**Example Request Body #3 (Chennai Express):**
```json
{
  "trainNumber": "12163",
  "trainName": "Chennai Express",
  "platform": "6",
  "arrivalTime": "22:10",
  "departureTime": "22:30",
  "delayMinutes": 0,
  "status": "on_time",
  "source": "Mumbai Central",
  "destination": "Chennai",
  "stationName": "Mumbai Central"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Train added successfully",
  "train": {
    "_id": "679d9a5b3c4d2e3f4a5b6c7d",
    "trainNumber": "12951",
    "trainName": "Mumbai Rajdhani Express",
    "platform": "5",
    "arrivalTime": "16:35",
    "departureTime": "16:55",
    "delayMinutes": 0,
    "status": "on_time",
    "source": "Mumbai Central",
    "destination": "New Delhi",
    "stationName": "Mumbai Central",
    "createdBy": "679d8f4a2b3c1e2f3a4b5c6d",
    "createdAt": "2026-01-14T12:00:00.000Z",
    "updatedAt": "2026-01-14T12:00:00.000Z"
  }
}
```

---

### 8. Update Train
**Endpoint:** `PUT /api/trains/[id]`  
**Access:** Station Manager, Super Admin  
**Description:** Update existing train information (delays, status, platform changes)

**Example:** `PUT /api/trains/679d9a5b3c4d2e3f4a5b6c7d`

**Example Request Body #1 (Add delay):**
```json
{
  "platform": "7",
  "delayMinutes": 25,
  "status": "delayed"
}
```

**Example Request Body #2 (Change platform only):**
```json
{
  "platform": "9"
}
```

**Example Request Body #3 (Cancel train):**
```json
{
  "status": "cancelled",
  "delayMinutes": 0
}
```

**Example Request Body #4 (Back to on time):**
```json
{
  "status": "on_time",
  "delayMinutes": 0
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Train updated successfully",
  "train": {
    "_id": "679d9a5b3c4d2e3f4a5b6c7d",
    "trainNumber": "12951",
    "trainName": "Mumbai Rajdhani Express",
    "platform": "7",
    "arrivalTime": "16:35",
    "departureTime": "16:55",
    "delayMinutes": 25,
    "status": "delayed",
    "source": "Mumbai Central",
    "destination": "New Delhi",
    "stationName": "Mumbai Central",
    "createdBy": "679d8f4a2b3c1e2f3a4b5c6d",
    "createdAt": "2026-01-14T12:00:00.000Z",
    "updatedAt": "2026-01-14T16:30:00.000Z"
  }
}
```

---

### 9. Delete Train
**Endpoint:** `DELETE /api/trains/[id]`  
**Access:** Station Manager, Super Admin  
**Description:** Remove a train from the system

**Example:** `DELETE /api/trains/679d9a5b3c4d2e3f4a5b6c7d`

**Example Response:**
```json
{
  "success": true,
  "message": "Train deleted successfully"
}
```

---

## User Routes

### 10. User Registration
**Endpoint:** `POST /api/auth/register`  
**Access:** Public  
**Description:** Register a new regular user account

**Example Request Body:**
```json
{
  "email": "commuter@example.com",
  "password": "user@123",
  "name": "Suresh Joshi",
  "role": "user"
}
```

> **Note:** `role` field is optional. If provided, only "user" role is allowed for public registration. Station managers must be created by super admin.

**Example Response:**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "679d9b6c4d5e3f4a5b6c7d8e",
    "name": "Suresh Joshi",
    "email": "commuter@example.com",
    "role": "user"
  }
}
```

---

### 11. User Login
**Endpoint:** `POST /api/auth/login`  
**Access:** Public  
**Description:** Login with existing credentials (works for all user roles)

> **Note:** `role` field is optional. If provided, system validates it matches the account role.

**Example Request Body #1 (Super Admin):**
```json
{
  "email": "goldikalluri@gmail.com",
  "password": "goldi123",
  "role": "super_admin"
}
```

**Example Request Body #2 (Station Manager):**
```json
{
  "email": "manager.central@railway.com",
  "password": "manager@123",
  "role": "station_manager"
}
```

**Example Request Body #3 (Regular User):**
```json
{
  "email": "commuter@example.com",
  "password": "user@123",
  "role": "user"
}
```

**Example Response (Super Admin):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "super-admin-id",
    "name": "Super Administrator",
    "email": "goldikalluri@gmail.com",
    "role": "super_admin"
  }
}
```

**Example Response (Station Manager):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "679d8f4a2b3c1e2f3a4b5c6d",
    "name": "Rajesh Kumar",
    "email": "manager.central@railway.com",
    "role": "station_manager",
    "stationName": "Mumbai Central"
  }
}
```

**Example Response (Regular User):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "679d9b6c4d5e3f4a5b6c7d8e",
    "name": "Suresh Joshi",
    "email": "commuter@example.com",
    "role": "user"
  }
}
```

---

### 12. Get Train Reroute Suggestions
**Endpoint:** `GET /api/trains/[id]/reroutes`  
**Access:** Public (No authentication required)  
**Description:** Get alternative train suggestions when a train is delayed (>15 min) or cancelled. First shows alternatives from the same station, then from nearby stations if none found.

**Example:** `GET /api/trains/679d9a5b3c4d2e3f4a5b6c7d/reroutes`

**Example Response (Same Station Alternatives):**
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
  "sameStationAlternatives": [
    {
      "trainId": "679d9a5b3c4d2e3f4a5b6c7e",
      "trainNumber": "12952",
      "trainName": "Shatabdi Express",
      "platform": "3",
      "arrivalTime": "17:00",
      "departureTime": "17:15",
      "status": "on_time",
      "delayMinutes": 0,
      "source": "Mumbai Central",
      "destination": "Ahmedabad",
      "stationName": "Mumbai Central"
    },
    {
      "trainId": "679d9a5b3c4d2e3f4a5b6c7f",
      "trainNumber": "12953",
      "trainName": "August Kranti Rajdhani",
      "platform": "1",
      "arrivalTime": "17:30",
      "departureTime": "17:50",
      "status": "delayed",
      "delayMinutes": 5,
      "source": "Mumbai Central",
      "destination": "New Delhi",
      "stationName": "Mumbai Central"
    }
  ],
  "sameStationCount": 2,
  "nearbyStationAlternatives": [],
  "nearbyStationCount": 0,
  "message": "Found 2 alternative train(s) at Mumbai Central"
}
```

**Example Response (Nearby Station Alternatives):**
```json
{
  "rerouteRequired": true,
  "reason": "Train has been cancelled",
  "train": {
    "trainNumber": "12345",
    "trainName": "Local Express",
    "stationName": "Borivali",
    "status": "cancelled",
    "delayMinutes": 0
  },
  "sameStationAlternatives": [],
  "sameStationCount": 0,
  "nearbyStationAlternatives": [
    {
      "trainId": "679d9a5b3c4d2e3f4a5b6c80",
      "trainNumber": "12954",
      "trainName": "Western Express",
      "platform": "2",
      "arrivalTime": "18:00",
      "departureTime": "18:15",
      "status": "on_time",
      "delayMinutes": 0,
      "source": "Andheri",
      "destination": "Virar",
      "stationName": "Andheri"
    },
    {
      "trainId": "679d9a5b3c4d2e3f4a5b6c81",
      "trainNumber": "12955",
      "trainName": "Suburban Fast",
      "platform": "1",
      "arrivalTime": "18:20",
      "departureTime": "18:25",
      "status": "on_time",
      "delayMinutes": 0,
      "source": "Andheri",
      "destination": "Churchgate",
      "stationName": "Andheri"
    }
  ],
  "nearbyStationCount": 2,
  "message": "No alternatives at Borivali. Found 2 train(s) at nearby stations"
}
```

**Example Response (No Reroute Needed):**
```json
{
  "rerouteRequired": false,
  "message": "Train is on time or has minimal delay",
  "train": {
    "trainNumber": "12951",
    "trainName": "Mumbai Rajdhani Express",
    "status": "on_time",
    "delayMinutes": 0
  }
}
```

---

### 13. Get All Trains
**Endpoint:** `GET /api/trains`  
**Access:** Public (No authentication required)  
**Description:** Retrieve all trains with optional filters

**Query Parameters:**
- `stationName` (optional): Filter by station name
- `status` (optional): Filter by status (on_time, delayed, cancelled)

**Examples:**
```
GET /api/trains
GET /api/trains?stationName=Mumbai Central
GET /api/trains?status=delayed
GET /api/trains?stationName=Dadar&status=on_time
```

**Example Response:**
```json
{
  "success": true,
  "count": 3,
  "trains": [
    {
      "_id": "679d9a5b3c4d2e3f4a5b6c7d",
      "trainNumber": "12951",
      "trainName": "Mumbai Rajdhani Express",
      "platform": "5",
      "arrivalTime": "16:35",
      "departureTime": "16:55",
      "delayMinutes": 0,
      "status": "on_time",
      "source": "Mumbai Central",
      "destination": "New Delhi",
      "stationName": "Mumbai Central",
      "createdBy": {
        "_id": "679d8f4a2b3c1e2f3a4b5c6d",
        "name": "Rajesh Kumar",
        "email": "manager.central@railway.com"
      },
      "createdAt": "2026-01-14T12:00:00.000Z",
      "updatedAt": "2026-01-14T12:00:00.000Z"
    },
    {
      "_id": "679d9a5b3c4d2e3f4a5b6c7e",
      "trainNumber": "12009",
      "trainName": "Shatabdi Express",
      "platform": "3",
      "arrivalTime": "06:25",
      "departureTime": "06:30",
      "delayMinutes": 10,
      "status": "delayed",
      "source": "Mumbai Central",
      "destination": "Ahmedabad",
      "stationName": "Mumbai Central",
      "createdBy": {
        "_id": "679d8f4a2b3c1e2f3a4b5c6d",
        "name": "Rajesh Kumar",
        "email": "manager.central@railway.com"
      },
      "createdAt": "2026-01-14T05:00:00.000Z",
      "updatedAt": "2026-01-14T06:15:00.000Z"
    },
    {
      "_id": "679d9a5b3c4d2e3f4a5b6c7f",
      "trainNumber": "12953",
      "trainName": "August Kranti Rajdhani",
      "platform": "8",
      "arrivalTime": "17:15",
      "departureTime": "17:40",
      "delayMinutes": 0,
      "status": "on_time",
      "source": "Mumbai Central",
      "destination": "New Delhi",
      "stationName": "Mumbai Central",
      "createdBy": {
        "_id": "679d8f4a2b3c1e2f3a4b5c6d",
        "name": "Rajesh Kumar",
        "email": "manager.central@railway.com"
      },
      "createdAt": "2026-01-14T12:30:00.000Z",
      "updatedAt": "2026-01-14T12:30:00.000Z"
    }
  ]
}
```

---

### 14. Add Train to Favorites
**Endpoint:** `POST /api/users/favorites/[trainId]`  
**Access:** Regular users only (authenticated)  
**Description:** Add a train to the logged-in user's favorites list

**Example:** `POST /api/users/favorites/679d9a5b3c4d2e3f4a5b6c7d`

**Example Response (Success):**
```json
{
  "success": true,
  "message": "Train added to favorites",
  "train": {
    "trainId": "679d9a5b3c4d2e3f4a5b6c7d",
    "trainNumber": "12951",
    "trainName": "Mumbai Rajdhani Express"
  }
}
```

**Example Response (Already in Favorites):**
```json
{
  "error": "Train is already in favorites"
}
```

**Example Response (Unauthorized - Station Manager/Admin):**
```json
{
  "error": "Unauthorized. Only regular users can manage favorites"
}
```

---

### 15. Get User's Favorite Trains
**Endpoint:** `GET /api/users/favorites`  
**Access:** Regular users only (authenticated)  
**Description:** Retrieve all favorite trains for the logged-in user

**Example Response:**
```json
{
  "success": true,
  "count": 2,
  "favorites": [
    {
      "_id": "679d9a5b3c4d2e3f4a5b6c7d",
      "trainNumber": "12951",
      "trainName": "Mumbai Rajdhani Express",
      "platform": "5",
      "arrivalTime": "16:35",
      "departureTime": "16:55",
      "delayMinutes": 0,
      "status": "on_time",
      "source": "Mumbai Central",
      "destination": "New Delhi",
      "stationName": "Mumbai Central",
      "createdAt": "2026-01-14T12:00:00.000Z",
      "updatedAt": "2026-01-14T12:00:00.000Z"
    },
    {
      "_id": "679d9a5b3c4d2e3f4a5b6c7e",
      "trainNumber": "12009",
      "trainName": "Shatabdi Express",
      "platform": "3",
      "arrivalTime": "06:25",
      "departureTime": "06:30",
      "delayMinutes": 10,
      "status": "delayed",
      "source": "Mumbai Central",
      "destination": "Ahmedabad",
      "stationName": "Mumbai Central",
      "createdAt": "2026-01-14T05:00:00.000Z",
      "updatedAt": "2026-01-14T06:15:00.000Z"
    }
  ]
}
```

**Example Response (No Favorites):**
```json
{
  "success": true,
  "count": 0,
  "favorites": []
}
```

---

### 16. Remove Train from Favorites
**Endpoint:** `DELETE /api/users/favorites/[trainId]`  
**Access:** Regular users only (authenticated)  
**Description:** Remove a train from the logged-in user's favorites list

**Example:** `DELETE /api/users/favorites/679d9a5b3c4d2e3f4a5b6c7d`

**Example Response (Success):**
```json
{
  "success": true,
  "message": "Train removed from favorites"
}
```

**Example Response (Not in Favorites):**
```json
{
  "error": "Train is not in favorites"
}
```

---

### 17. Get Single Train
**Endpoint:** `GET /api/trains/[id]`  
**Access:** Public  
**Description:** Get details of a specific train by ID

**Example:** `GET /api/trains/679d9a5b3c4d2e3f4a5b6c7d`

**Example Response:**
```json
{
  "success": true,
  "train": {
    "_id": "679d9a5b3c4d2e3f4a5b6c7d",
    "trainNumber": "12951",
    "trainName": "Mumbai Rajdhani Express",
    "platform": "5",
    "arrivalTime": "16:35",
    "departureTime": "16:55",
    "delayMinutes": 0,
    "status": "on_time",
    "source": "Mumbai Central",
    "destination": "New Delhi",
    "stationName": "Mumbai Central",
    "createdBy": {
      "_id": "679d8f4a2b3c1e2f3a4b5c6d",
      "name": "Rajesh Kumar",
      "email": "manager.central@railway.com"
    },
    "createdAt": "2026-01-14T12:00:00.000Z",
    "updatedAt": "2026-01-14T12:00:00.000Z"
  }
}
```

---

## Admin Monitoring Routes

### 18. Get All Regular Users
**Endpoint:** `GET /api/admin/users`  
**Access:** Super Admin only  
**Description:** View all regular users (excludes station managers and super admins)

**Example Response:**
```json
{
  "success": true,
  "count": 10,
  "users": [
    {
      "_id": "679d9b6c4d5e3f4a5b6c7d8e",
      "name": "Suresh Joshi",
      "email": "commuter@example.com",
      "role": "user",
      "createdAt": "2026-01-14T10:00:00.000Z",
      "updatedAt": "2026-01-14T10:00:00.000Z"
    },
    {
      "_id": "679d9b6c4d5e3f4a5b6c7d8f",
      "name": "Amit Patel",
      "email": "amit.patel@example.com",
      "role": "user",
      "createdAt": "2026-01-14T11:00:00.000Z",
      "updatedAt": "2026-01-14T11:00:00.000Z"
    }
  ]
}
```

---

## User Roles & Permissions

### Super Admin
- Full system access
- Can create/update/delete station managers
- Can view all users
- Can manage all trains

### Station Manager
- Can create/update/delete trains for their station
- Can view all trains
- Cannot manage other users

### User (Regular)
- Can view all trains
- Can view train schedules and delays
- Cannot modify any data

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided" / "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized. Only [role] can perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Database Models

### User Model
```typescript
{
  email: string;
  password: string (hashed);
  name: string;
  role: 'super_admin' | 'station_manager' | 'user';
  stationName?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Train Model
```typescript
{
  trainNumber: string (unique);
  trainName: string;
  platform: string;
  arrivalTime: string;
  departureTime: string;
  delayMinutes: number;
  status: 'on_time' | 'delayed' | 'cancelled';
  source: string;
  destination: string;
  stationName: string;
  createdBy: ObjectId (User reference);
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Setup Instructions

1. Install dependencies:
```bash
npm install mongoose bcryptjs jsonwebtoken
```

2. Configure MongoDB connection in `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017/ltr-system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

3. Start MongoDB server

4. Run the Next.js development server:
```bash
npm run dev
```

5. Create your first super admin account manually in MongoDB or use a seed script

---

## Testing with Postman/Thunder Client

### Example Flow:

1. **Create Super Admin** (manually in DB or seed script)
2. **Login as Super Admin** → Get token
3. **Create Station Manager** using super admin token
4. **Login as Station Manager** → Get token
5. **Add Trains** using station manager token
6. **View Trains** (no auth required)
7. **Update Train** (delays, platform changes) using station manager token

---

## Notes

- All timestamps are in ISO 8601 format
- Train times can be stored as strings (e.g., "10:30 AM") or converted to Date objects as needed
- JWT tokens expire after 7 days
- Passwords are hashed using bcryptjs with salt rounds of 10
- MongoDB connection uses connection pooling for better performance
