import { NextRequest, NextResponse } from "next/server";


import connectToDatabase from "@/lib/mongodb";
import { Teacher, ClassModel, TeacherClass, User, AuditLog } from "@/models";
import { getAuthSession, checkPermission, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const status = searchParams.get("status") || "ACTIVE";

    const query: any = {};
    if (status !== "ALL") query.status = status;
    if (department) query.department = department;

    const teachers = await Teacher.find(query)
      .populate("assignedClassId", "classCode className grade")
      .sort({ teacherCode: 1 });

    const data = teachers.map((t: any) => {
      const obj = t.toObject ? t.toObject() : { ...t };
      const populatedClass =
        obj.assignedClassId && typeof obj.assignedClassId === "object"
          ? obj.assignedClassId
          : null;
      return {
        ...obj,
        _id: obj._id.toString(),
        assignedClassId: populatedClass
          ? populatedClass._id.toString()
          : obj.assignedClassId
          ? obj.assignedClassId.toString()
          : undefined,
        assignedClassName:
          obj.assignedClassName ||
          (populatedClass ? `Lớp ${populatedClass.className}` : undefined),
      };
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error("Teachers GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy danh sách giáo viên." },
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
    const {
      teacherCode,
      fullName,
      gender,
      dateOfBirth,
      phone,
      email,
      department,
      assignedClassId,
    } = body;

    if (!teacherCode || !fullName) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập mã giáo viên và họ tên." },
        { status: 400 }
      );
    }

    const code = teacherCode.trim().toUpperCase();
    const existing = await Teacher.findOne({ teacherCode: code });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Mã giáo viên ${code} đã tồn tại.` },
        { status: 400 }
      );
    }

    let assignedClassName = undefined;
    if (assignedClassId) {
      const cls = await ClassModel.findById(assignedClassId);
      if (cls) {
        assignedClassName = `Lớp ${cls.className}`;
        await Teacher.updateMany(
          { assignedClassId },
          { $unset: { assignedClassId: 1, assignedClassName: 1 } }
        );
      }
    }

    const newTeacher = await Teacher.create({
      teacherCode: code,
      fullName: fullName.trim(),
      gender: gender || "OTHER",
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      phone: phone?.trim(),
      email: email?.trim(),
      department: department?.trim(),
      assignedClassId: assignedClassId || undefined,
      assignedClassName,
      status: "ACTIVE",
    });

    if (assignedClassId) {
      await ClassModel.findByIdAndUpdate(assignedClassId, { homeroomTeacherId: newTeacher._id });
      await TeacherClass.findOneAndUpdate(
        { teacherId: newTeacher._id, role: "HOMEROOM_TEACHER" },
        { classId: assignedClassId, role: "HOMEROOM_TEACHER" },
        { upsert: true }
      );
    }

    // Create user login account (password: 123456)
    const passwordHash = await hashPassword("123456");
    await User.create({
      accountCode: code,
      fullName: fullName.trim(),
      passwordHash,
      roles: ["TEACHER"],
      teacherId: newTeacher._id,
      isActive: true,
    });

    await AuditLog.create({
      actorId: session!.accountCode,
      actorName: session!.fullName,
      actorRole: session!.roles[0],
      action: "CREATE",
      targetType: "TEACHER",
      targetId: newTeacher._id.toString(),
      targetName: newTeacher.fullName,
      description: `Thêm mới giáo viên ${newTeacher.fullName} (${newTeacher.teacherCode}).`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      data: newTeacher,
      message: "Tạo giáo viên thành công (Mật khẩu đăng nhập mặc định: 123456).",
    });
  } catch (error: any) {
    console.error("Teachers POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tạo giáo viên." },
      { status: 500 }
    );
  }
}
