import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISchoolYearDocument extends Document {
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  status: "UPCOMING" | "ACTIVE" | "ENDED";
  createdAt: Date;
  updatedAt: Date;
}

const SchoolYearSchema = new Schema<ISchoolYearDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["UPCOMING", "ACTIVE", "ENDED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export const SchoolYear: Model<ISchoolYearDocument> =
  mongoose.models.SchoolYear || mongoose.model<ISchoolYearDocument>("SchoolYear", SchoolYearSchema);

export default SchoolYear;
