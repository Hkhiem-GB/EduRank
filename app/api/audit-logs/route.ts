import { NextRequest, NextResponse } from "next/server";


import connectToDatabase from "@/lib/mongodb";
import { AuditLog } from "@/models";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    // Allow SUPER_ADMIN and ADMIN to see audit logs
    const perm = checkPermission(session, ["SUPER_ADMIN", "ADMIN"]);
    if (!perm.authorized) {
      return NextResponse.json({ success: false, message: perm.message }, { status: perm.status });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const targetType = searchParams.get("targetType");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const query: any = {};
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      AuditLog.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
    ]);

    const formattedLogs = logs.map((l: any) => ({
      _id: l._id.toString(),
      timestamp: l.timestamp.toISOString(),
      actorId: l.actorId,
      actorName: l.actorName,
      actorRole: l.actorRole,
      action: l.action,
      targetType: l.targetType,
      targetId: l.targetId,
      targetName: l.targetName,
      description: l.description,
      pointChange: l.pointChange,
      status: l.status,
      createdAt: l.createdAt ? l.createdAt.toISOString() : l.timestamp.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Audit Logs Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy nhật ký hệ thống." },
      { status: 500 }
    );
  }
}
