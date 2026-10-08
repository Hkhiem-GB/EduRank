import mongoose, { Schema, Document, Model } from "mongoose";
import { AuditAction, AuditTargetType, UserRole } from "@/types";

export interface IAuditLogDocument extends Document {
  timestamp: Date;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  targetName: string;
  description: string;
  pointChange?: number;
  status: "SUCCESS" | "CANCELLED" | "PENDING";
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    actorId: {
      type: String,
      required: true,
      index: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
    },
    actorRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "CANCEL",
        "LOGIN",
        "LOGOUT",
        "ASSIGN",
        "DEACTIVATE",
      ],
      index: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: [
        "USER",
        "TEACHER",
        "STUDENT",
        "CLASS",
        "COMPETITION_RECORD",
        "CRITERIA",
      ],
      index: true,
    },
    targetId: {
      type: String,
      required: true,
      index: true,
    },
    targetName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    pointChange: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "CANCELLED", "PENDING"],
      default: "SUCCESS",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ createdAt: -1 });

export const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLogDocument>("AuditLog", AuditLogSchema);

export default AuditLog;
