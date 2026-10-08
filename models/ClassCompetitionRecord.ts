import mongoose, { Schema, Document, Model } from "mongoose";
import { CompetitionRecordStatus } from "@/types";

export interface IClassCompetitionRecordDocument extends Document {
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

const ClassCompetitionRecordSchema = new Schema<IClassCompetitionRecordDocument>(
  {
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

ClassCompetitionRecordSchema.index({ classId: 1, status: 1, createdAt: -1 });

export const ClassCompetitionRecord: Model<IClassCompetitionRecordDocument> =
  mongoose.models.ClassCompetitionRecord ||
  mongoose.model<IClassCompetitionRecordDocument>(
    "ClassCompetitionRecord",
    ClassCompetitionRecordSchema
  );

export default ClassCompetitionRecord;
