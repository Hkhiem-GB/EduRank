import mongoose, { Schema, Document, Model } from "mongoose";
import { StudentStatus } from "@/types";

export interface IStudentDocument extends Document {
  studentCode: string;
  fullName: string;
  dateOfBirth: Date;
  gender: "MALE" | "FEMALE" | "OTHER";
  classId: mongoose.Types.ObjectId;
  parentName?: string;
  parentPhone?: string;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudentDocument>(
  {
    studentCode: {
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
      required: true,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
      default: "OTHER",
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    parentName: {
      type: String,
      trim: true,
    },
    parentPhone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "TRANSFERRED", "GRADUATED"],
      default: "ACTIVE",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Student: Model<IStudentDocument> =
  mongoose.models.Student || mongoose.model<IStudentDocument>("Student", StudentSchema);

export default Student;
