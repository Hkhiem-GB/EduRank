import mongoose, { Schema, Document, Model } from "mongoose";
import { TeacherStatus } from "@/types";

export interface ITeacherDocument extends Document {
  teacherCode: string;
  fullName: string;
  dateOfBirth?: Date;
  gender?: "MALE" | "FEMALE" | "OTHER";
  phone?: string;
  email?: string;
  department?: string;
  assignedClassId?: mongoose.Types.ObjectId;
  assignedClassName?: string;
  status: TeacherStatus;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacherDocument>(
  {
    teacherCode: {
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
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      default: "OTHER",
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    department: {
      type: String,
      trim: true,
    },
    assignedClassId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      index: true,
    },
    assignedClassName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "RETIRED"],
      default: "ACTIVE",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Teacher: Model<ITeacherDocument> =
  mongoose.models.Teacher || mongoose.model<ITeacherDocument>("Teacher", TeacherSchema);

export default Teacher;
