import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClassDocument extends Document {
  classCode: string;
  className: string;
  grade: 6 | 7 | 8 | 9;
  schoolYearId: mongoose.Types.ObjectId;
  homeroomTeacherId?: mongoose.Types.ObjectId;
  studentCount: number;
  room?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClassDocument>(
  {
    classCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    grade: {
      type: Number,
      required: true,
      enum: [6, 7, 8, 9],
      index: true,
    },
    schoolYearId: {
      type: Schema.Types.ObjectId,
      ref: "SchoolYear",
      required: true,
      index: true,
    },
    homeroomTeacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      index: true,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
    room: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ClassModel: Model<IClassDocument> =
  mongoose.models.Class || mongoose.model<IClassDocument>("Class", ClassSchema);

export default ClassModel;
