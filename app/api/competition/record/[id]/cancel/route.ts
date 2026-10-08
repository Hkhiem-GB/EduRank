import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import {
  ClassCompetitionRecord,
  StudentCompetitionRecord,
  AuditLog,
} from "@/models";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getAuthSession(req);
    const perm = checkPermission(session, ["SUPER_ADMIN", "ADMIN", "TEACHER"]);
    if (!perm.authorized) {
      return NextResponse.json({ success: false, message: perm.message }, { status: perm.status });
    }

    const { id } = await params;
    await connectToDatabase();

    // Check ClassCompetitionRecord first
    let classRec = await ClassCompetitionRecord.findById(id).populate("classId");
    if (classRec) {
      if (classRec.status === "CANCELLED") {
        return NextResponse.json({ success: false, message: "Bản ghi này đã được hủy trước đó." }, { status: 400 });
      }

      // Check teacher authorization: teachers can only cancel their own record within 24 hours
      const isPrivileged = session!.roles.includes("SUPER_ADMIN") || session!.roles.includes("ADMIN");
      if (!isPrivileged && classRec.createdBy !== session!.accountCode) {
        return NextResponse.json(
          { success: false, message: "Bạn chỉ có thể hủy bản ghi do chính mình tạo." },
          { status: 403 }
        );
      }

      classRec.status = "CANCELLED";
      classRec.cancelledAt = new Date();
      classRec.cancelledBy = session!.accountCode;
      await classRec.save();

      await AuditLog.create({
        actorId: session!.accountCode,
        actorName: session!.fullName,
        actorRole: session!.roles[0],
        action: "CANCEL",
        targetType: "COMPETITION_RECORD",
        targetId: classRec._id.toString(),
        targetName: (classRec.classId as any)?.className || "Lớp học",
        description: `Hủy bản ghi thi đua (${classRec.points > 0 ? "+" : ""}${classRec.points} điểm).`,
        pointChange: -classRec.points,
        status: "CANCELLED",
      });

      return NextResponse.json({
        success: true,
        message: "Hủy bản ghi thi đua thành công.",
      });
    }

    // Check StudentCompetitionRecord
    let studentRec = await StudentCompetitionRecord.findById(id)
      .populate("studentId")
      .populate("classId");
    if (studentRec) {
      if (studentRec.status === "CANCELLED") {
        return NextResponse.json({ success: false, message: "Bản ghi này đã được hủy trước đó." }, { status: 400 });
      }

      const isPrivileged = session!.roles.includes("SUPER_ADMIN") || session!.roles.includes("ADMIN");
      if (!isPrivileged && studentRec.createdBy !== session!.accountCode) {
        return NextResponse.json(
          { success: false, message: "Bạn chỉ có thể hủy bản ghi do chính mình tạo." },
          { status: 403 }
        );
      }

      studentRec.status = "CANCELLED";
      studentRec.cancelledAt = new Date();
      studentRec.cancelledBy = session!.accountCode;
      await studentRec.save();

      await AuditLog.create({
        actorId: session!.accountCode,
        actorName: session!.fullName,
        actorRole: session!.roles[0],
        action: "CANCEL",
        targetType: "COMPETITION_RECORD",
        targetId: studentRec._id.toString(),
        targetName: (studentRec.studentId as any)?.fullName || "Học sinh",
        description: `Hủy bản ghi thi đua học sinh (${studentRec.points > 0 ? "+" : ""}${studentRec.points} điểm).`,
        pointChange: -studentRec.points,
        status: "CANCELLED",
      });

      return NextResponse.json({
        success: true,
        message: "Hủy bản ghi thi đua học sinh thành công.",
      });
    }

    return NextResponse.json({ success: false, message: "Không tìm thấy bản ghi thi đua." }, { status: 404 });
  } catch (error: any) {
    console.error("Cancel Competition Record Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ khi hủy bản ghi." }, { status: 500 });
  }
}
