import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole } from "@/types";

export interface IUserDocument extends Document {
  accountCode: string;
  fullName: string;
  passwordHash: string;
  roles: UserRole[];
  teacherId?: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    accountCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never return passwordHash in queries by default
    },
    roles: {
      type: [String],
      enum: ["SUPER_ADMIN", "ADMIN", "TEACHER", "STUDENT"],
      required: true,
      default: ["STUDENT"],
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      index: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
