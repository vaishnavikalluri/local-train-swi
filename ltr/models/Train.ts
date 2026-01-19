import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrain extends Document {
  trainNumber: string;
  trainName: string;
  platform: string;
  arrivalTime: string;
  departureTime: string;
  delayMinutes: number;
  status: 'on_time' | 'delayed' | 'cancelled';
  source: string;
  destination: string;
  stationName: string;
  city?: string; // City where the station is located
  createdBy: mongoose.Types.ObjectId; // Station manager who created this
  createdAt: Date;
  updatedAt: Date;
}

const TrainSchema: Schema = new Schema(
  {
    trainNumber: {
      type: String,
      required: [true, 'Train number is required'],
      trim: true,
      unique: true,
    },
    trainName: {
      type: String,
      required: [true, 'Train name is required'],
      trim: true,
    },
    platform: {
      type: String,
      required: [true, 'Platform is required'],
      trim: true,
    },
    arrivalTime: {
      type: String,
      required: [true, 'Arrival time is required'],
    },
    departureTime: {
      type: String,
      required: [true, 'Departure time is required'],
    },
    delayMinutes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['on_time', 'delayed', 'cancelled'],
      default: 'on_time',
    },
    source: {
      type: String,
      required: [true, 'Source station is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination station is required'],
      trim: true,
    },
    stationName: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Train: Model<ITrain> = mongoose.models.Train || mongoose.model<ITrain>('Train', TrainSchema);

export default Train;
