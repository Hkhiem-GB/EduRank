import mongoose, { Schema, Document, Model } from "mongoose";
import { TeacherClassRole } from "@/types";

export interface ITeacherClassDocument extends Document {
  teacherId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  role: TeacherClassRole;
  createdAt: Date;
}

const TeacherClassSchema = new Schema<ITeacherClassDocument>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
      index: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["HOMEROOM_TEACHER", "SUBJECT_TEACHER", "SUPERVISOR"],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

TeacherClassSchema.index({ teacherId: 1, classId: 1, role: 1 }, { unique: true });

export const TeacherClass: Model<ITeacherClassDocument> =
  mongoose.models.TeacherClass || mongoose.model<ITeacherClassDocument>("TeacherClass", TeacherClassSchema);

export default TeacherClass;
