import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'super_admin' | 'station_manager' | 'user';
  stationName?: string; // For station managers
  favorites?: mongoose.Types.ObjectId[]; // Favorite trains for regular users
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['super_admin', 'station_manager', 'user'],
      default: 'user',
    },
    stationName: {
      type: String,
      trim: true,
    },
    favorites: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Train' }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
