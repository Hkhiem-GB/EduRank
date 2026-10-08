import mongoose, { Schema, Document, Model } from "mongoose";
import { CompetitionRecordStatus } from "@/types";

export interface IStudentCompetitionRecordDocument extends Document {
  studentId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  criteriaId: mongoose.Types.ObjectId;
  points: number;
  note?: string;
  createdBy: string;
  status: CompetitionRecordStatus;
  cancelledAt?: Date;
  cancelledBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentCompetitionRecordSchema = new Schema<IStudentCompetitionRecordDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    criteriaId: {
      type: Schema.Types.ObjectId,
      ref: "CompetitionCriteria",
      required: true,
      index: true,
    },
    points: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED"],
      default: "ACTIVE",
      index: true,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

StudentCompetitionRecordSchema.index({ classId: 1, status: 1, createdAt: -1 });
StudentCompetitionRecordSchema.index({ studentId: 1, status: 1, createdAt: -1 });

export const StudentCompetitionRecord: Model<IStudentCompetitionRecordDocument> =
  mongoose.models.StudentCompetitionRecord ||
  mongoose.model<IStudentCompetitionRecordDocument>(
    "StudentCompetitionRecord",
    StudentCompetitionRecordSchema
  );

export default StudentCompetitionRecord;
