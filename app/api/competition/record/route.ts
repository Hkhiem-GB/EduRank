import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import {
  CompetitionCriteria,
  ClassCompetitionRecord,
  StudentCompetitionRecord,
  ClassModel,
  Student,
  AuditLog,
} from "@/models";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const studentId = searchParams.get("studentId");
    const limit = parseInt(searchParams.get("limit") || "1000", 10);

    const classQuery: any = {};
    const studentQuery: any = {};

    if (classId) {
      classQuery.classId = classId;
      studentQuery.classId = classId;
    }
    if (studentId) {
      studentQuery.studentId = studentId;
    }

    const [classDocs, studentDocs] = await Promise.all([
      ClassCompetitionRecord.find(classQuery).sort({ createdAt: -1 }).limit(limit).lean(),
      StudentCompetitionRecord.find(studentQuery).sort({ createdAt: -1 }).limit(limit).lean(),
    ]);

    const formattedClassRecords = classDocs.map((r: any) => ({
      ...r,
      _id: r._id.toString(),
      classId: r.classId ? r.classId.toString() : "",
      criteriaId: r.criteriaId ? r.criteriaId.toString() : "",
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }));

    const formattedStudentRecords = studentDocs.map((r: any) => ({
      ...r,
      _id: r._id.toString(),
      studentId: r.studentId ? r.studentId.toString() : "",
      classId: r.classId ? r.classId.toString() : "",
      criteriaId: r.criteriaId ? r.criteriaId.toString() : "",
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        classRecords: formattedClassRecords,
        studentRecords: formattedStudentRecords,
      },
    });
  } catch (error: any) {
    console.error("Competition Records GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy bản ghi thi đua." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    const perm = checkPermission(session, ["SUPER_ADMIN", "ADMIN", "TEACHER"]);
    if (!perm.authorized) {
      return NextResponse.json({ success: false, message: perm.message }, { status: perm.status });
    }

    await connectToDatabase();
    const body = await req.json();
    const { targetType, classId, studentId, criteriaId, note } = body;

    if (!targetType || !classId || !criteriaId) {
      return NextResponse.json(
        { success: false, message: "Vui lòng chọn loại đối tượng, lớp học và tiêu chí thi đua." },
        { status: 400 }
      );
    }

    const criteria = await CompetitionCriteria.findById(criteriaId);
    if (!criteria || !criteria.isActive) {
      return NextResponse.json(
        { success: false, message: "Tiêu chí thi đua không tồn tại hoặc đã ngừng áp dụng." },
        { status: 400 }
      );
    }

    const cls = await ClassModel.findById(classId);
    if (!cls) {
      return NextResponse.json({ success: false, message: "Lớp học không tồn tại." }, { status: 404 });
    }

    const points = body.points !== undefined ? Number(body.points) : criteria.points;

    if (targetType === "CLASS") {
      const record = await ClassCompetitionRecord.create({
        classId,
        criteriaId,
        points,
        note: note?.trim(),
        createdBy: session!.accountCode,
        status: "ACTIVE",
      });

      await AuditLog.create({
        actorId: session!.accountCode,
        actorName: session!.fullName,
        actorRole: session!.roles[0],
        action: "CREATE",
        targetType: "COMPETITION_RECORD",
        targetId: record._id.toString(),
        targetName: cls.className,
        description: `Ghi nhận ${points > 0 ? "+" : ""}${points} điểm cho ${cls.className}: ${criteria.name}`,
        pointChange: points,
        status: "SUCCESS",
      });

      return NextResponse.json({
        success: true,
        data: record,
        message: `Đã ghi nhận điểm thi đua cho ${cls.className}.`,
      });
    } else if (targetType === "STUDENT") {
      if (!studentId) {
        return NextResponse.json(
          { success: false, message: "Vui lòng chọn học sinh được chấm điểm." },
          { status: 400 }
        );
      }

      const std = await Student.findById(studentId);
      if (!std) {
        return NextResponse.json({ success: false, message: "Học sinh không tồn tại." }, { status: 404 });
      }

      const record = await StudentCompetitionRecord.create({
        studentId,
        classId,
        criteriaId,
        points,
        note: note?.trim(),
        createdBy: session!.accountCode,
        status: "ACTIVE",
      });

      await AuditLog.create({
        actorId: session!.accountCode,
        actorName: session!.fullName,
        actorRole: session!.roles[0],
        action: "CREATE",
        targetType: "COMPETITION_RECORD",
        targetId: record._id.toString(),
        targetName: `${std.fullName} (${cls.className})`,
        description: `Ghi nhận ${points > 0 ? "+" : ""}${points} điểm cho học sinh ${std.fullName} (${cls.className}): ${criteria.name}`,
        pointChange: points,
        status: "SUCCESS",
      });

      return NextResponse.json({
        success: true,
        data: record,
        message: `Đã ghi nhận điểm thi đua cho học sinh ${std.fullName}.`,
      });
    }

    return NextResponse.json({ success: false, message: "Loại đối tượng không hợp lệ." }, { status: 400 });
  } catch (error: any) {
    console.error("Competition Record POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi ghi nhận điểm thi đua." },
      { status: 500 }
    );
  }
}
