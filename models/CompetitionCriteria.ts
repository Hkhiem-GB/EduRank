import mongoose, { Schema, Document, Model } from "mongoose";
import { CompetitionTarget } from "@/types";

export interface ICompetitionCriteriaDocument extends Document {
  name: string;
  description?: string;
  targetType: CompetitionTarget;
  points: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompetitionCriteriaSchema = new Schema<ICompetitionCriteriaDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    targetType: {
      type: String,
      enum: ["CLASS", "STUDENT"],
      required: true,
      index: true,
    },
    points: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      trim: true,
      default: "Chung",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CompetitionCriteria: Model<ICompetitionCriteriaDocument> =
  mongoose.models.CompetitionCriteria ||
  mongoose.model<ICompetitionCriteriaDocument>("CompetitionCriteria", CompetitionCriteriaSchema);

export default CompetitionCriteria;
