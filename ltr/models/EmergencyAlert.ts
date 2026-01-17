import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmergencyAlert extends Document {
  // Boarding Information
  boardingStationName: string;
  platformNumber: string;
  
  // Train Information
  trainNumber: string;
  trainName: string;
  
  // Location Information
  coach: string;
  seatNumber: string;
  
  // Destination Information
  destinationStationName: string;
  
  // Status Tracking
  status: 'pending' | 'acknowledged' | 'resolved';
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyAlertSchema: Schema = new Schema(
  {
    boardingStationName: {
      type: String,
      required: [true, 'Boarding station name is required'],
      trim: true,
      index: true,
    },
    platformNumber: {
      type: String,
      required: [true, 'Platform number is required'],
      trim: true,
    },
    trainNumber: {
      type: String,
      required: [true, 'Train number is required'],
      trim: true,
    },
    trainName: {
      type: String,
      required: [true, 'Train name is required'],
      trim: true,
    },
    coach: {
      type: String,
      required: [true, 'Coach/compartment is required'],
      trim: true,
    },
    seatNumber: {
      type: String,
      required: [true, 'Seat number is required'],
      trim: true,
    },
    destinationStationName: {
      type: String,
      required: [true, 'Destination station name is required'],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'resolved'],
      default: 'pending',
      index: true,
    },
    acknowledgedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedAt: {
      type: Date,
    },
    resolvedAt: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
EmergencyAlertSchema.index({ boardingStationName: 1, status: 1, createdAt: -1 });
EmergencyAlertSchema.index({ destinationStationName: 1, status: 1, createdAt: -1 });

const EmergencyAlert: Model<IEmergencyAlert> =
  mongoose.models.EmergencyAlert ||
  mongoose.model<IEmergencyAlert>('EmergencyAlert', EmergencyAlertSchema);

export default EmergencyAlert;
