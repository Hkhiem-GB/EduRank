import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Student, StudentCompetitionRecord, ClassModel, AuditLog } from "@/models";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const student = await Student.findById(id).populate("classId").lean();

    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh." }, { status: 404 });
    }

    // Get active competition records
    const records = await StudentCompetitionRecord.find({
      studentId: id,
      status: "ACTIVE",
    })
      .populate("criteriaId")
      .sort({ createdAt: -1 })
      .lean();

    let positivePoints = 0;
    let negativePoints = 0;
    for (const r of records) {
      if (r.points > 0) positivePoints += r.points;
      else negativePoints += Math.abs(r.points);
    }

    const baseScore = 100;
    const totalScore = baseScore + positivePoints - negativePoints;

    return NextResponse.json({
      success: true,
      data: {
        student,
        scoreSummary: {
          baseScore,
          positivePoints,
          negativePoints,
          totalScore,
        },
        records,
      },
    });
  } catch (error: any) {
    console.error("Student GET ID Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ." }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getAuthSession(req);
    const perm = checkPermission(session, ["SUPER_ADMIN", "ADMIN"]);
    if (!perm.authorized) {
      return NextResponse.json({ success: false, message: perm.message }, { status: perm.status });
    }

    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();

    const updated = await Student.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh." }, { status: 404 });
    }

    await AuditLog.create({
      actorId: session!.accountCode,
      actorName: session!.fullName,
      actorRole: session!.roles[0],
      action: "UPDATE",
      targetType: "STUDENT",
      targetId: updated._id.toString(),
      targetName: updated.fullName,
      description: `Cập nhật thông tin học sinh ${updated.fullName} (${updated.studentCode}).`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Cập nhật học sinh thành công.",
    });
  } catch (error: any) {
    console.error("Student PUT Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getAuthSession(req);
    const perm = checkPermission(session, ["SUPER_ADMIN", "ADMIN"]);
    if (!perm.authorized) {
      return NextResponse.json({ success: false, message: perm.message }, { status: perm.status });
    }

    const { id } = await params;
    await connectToDatabase();
    const student = await Student.findByIdAndUpdate(id, { status: "INACTIVE" }, { new: true });
    if (!student) {
      return NextResponse.json({ success: false, message: "Không tìm thấy học sinh." }, { status: 404 });
    }

    // Decrement class student count
    if (student.classId) {
      await ClassModel.findByIdAndUpdate(student.classId, { $inc: { studentCount: -1 } });
    }

    await AuditLog.create({
      actorId: session!.accountCode,
      actorName: session!.fullName,
      actorRole: session!.roles[0],
      action: "DEACTIVATE",
      targetType: "STUDENT",
      targetId: student._id.toString(),
      targetName: student.fullName,
      description: `Đổi trạng thái học sinh ${student.fullName} sang ngừng hoạt động.`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Học sinh đã được chuyển sang trạng thái ngừng hoạt động.",
    });
  } catch (error: any) {
    console.error("Student DELETE Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ." }, { status: 500 });
  }
}
