import { NextRequest, NextResponse } from "next/server";


import connectToDatabase from "@/lib/mongodb";
import { ClassModel, Teacher, TeacherClass, AuditLog, Student } from "@/models";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade");
    const status = searchParams.get("status");

    const query: any = {};
    if (grade) query.grade = Number(grade);
    if (status) query.status = status;

    const [classes, studentCounts] = await Promise.all([
      ClassModel.find(query)
        .populate("homeroomTeacherId", "teacherCode fullName phone email gender")
        .populate("schoolYearId", "name isCurrent")
        .sort({ grade: 1, classCode: 1 }),
      Student.aggregate([
        { $match: { status: "ACTIVE" } },
        { $group: { _id: "$classId", count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = new Map<string, number>();
    for (const sc of studentCounts) {
      countMap.set(sc._id.toString(), sc.count);
    }

    const data = classes.map((c: any) => {
      const obj = c.toObject ? c.toObject() : { ...c };
      const populatedTeacher =
        obj.homeroomTeacherId && typeof obj.homeroomTeacherId === "object"
          ? obj.homeroomTeacherId
          : null;
      const realStudentCount = countMap.has(obj._id.toString())
        ? countMap.get(obj._id.toString())!
        : obj.studentCount || 0;
      return {
        ...obj,
        _id: obj._id.toString(),
        studentCount: realStudentCount,
        schoolYearId: obj.schoolYearId?._id
          ? obj.schoolYearId._id.toString()
          : obj.schoolYearId
          ? obj.schoolYearId.toString()
          : undefined,
        homeroomTeacherId: populatedTeacher
          ? populatedTeacher._id.toString()
          : obj.homeroomTeacherId
          ? obj.homeroomTeacherId.toString()
          : undefined,
        homeroomTeacher: populatedTeacher,
      };
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Classes GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy danh sách lớp học." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    const perm = checkPermission(session, ["SUPER_ADMIN", "ADMIN"]);
    if (!perm.authorized) {
      return NextResponse.json({ success: false, message: perm.message }, { status: perm.status });
    }

    await connectToDatabase();
    const body = await req.json();
    const { classCode, className, grade, schoolYearId, homeroomTeacherId, room, studentCount } = body;

    if (!classCode || !className || !grade || !schoolYearId) {
      return NextResponse.json(
        { success: false, message: "Vui lòng điền các trường bắt buộc (mã lớp, tên lớp, khối, năm học)." },
        { status: 400 }
      );
    }

    const existing = await ClassModel.findOne({ classCode: classCode.trim().toUpperCase() });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Mã lớp ${classCode} đã tồn tại.` },
        { status: 400 }
      );
    }

    const newClass: any = await ClassModel.create({
      classCode: classCode.trim().toUpperCase(),
      className: className.trim(),
      grade: Number(grade) as 6 | 7 | 8 | 9,
      schoolYearId,
      homeroomTeacherId: homeroomTeacherId || undefined,
      room: room?.trim(),
      studentCount: Number(studentCount) || 0,
      status: "ACTIVE",
    });

    if (homeroomTeacherId) {
      await Teacher.findByIdAndUpdate(homeroomTeacherId, {
        assignedClassId: newClass._id,
        assignedClassName: `Lớp ${className.trim()}`,
      });
      await TeacherClass.findOneAndUpdate(
        { teacherId: homeroomTeacherId, role: "HOMEROOM_TEACHER" },
        { classId: newClass._id, role: "HOMEROOM_TEACHER" },
        { upsert: true }
      );
    }

    await AuditLog.create({
      actorId: session!.accountCode,
      actorName: session!.fullName,
      actorRole: session!.roles[0],
      action: "CREATE",
      targetType: "CLASS",
      targetId: newClass._id.toString(),
      targetName: newClass.className,
      description: `Tạo mới lớp học ${newClass.className} (${newClass.classCode}).`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      data: newClass,
      message: "Tạo lớp học thành công.",
    });
  } catch (error: any) {
    console.error("Classes POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tạo lớp học." },
      { status: 500 }
    );
  }
}
