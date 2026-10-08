import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { ClassModel, Teacher, TeacherClass, AuditLog, Student } from "@/models";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const [c, studentCount] = await Promise.all([
      ClassModel.findById(id)
        .populate("homeroomTeacherId", "teacherCode fullName phone email gender")
        .populate("schoolYearId", "name isCurrent"),
      Student.countDocuments({ classId: id, status: "ACTIVE" }),
    ]);

    if (!c) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    const obj = c.toObject();
    obj.studentCount = studentCount;

    return NextResponse.json({ success: true, data: obj });
  } catch (error: any) {
    console.error("Class GET ID Error:", error);
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

    const oldClass = await ClassModel.findById(id);
    if (!oldClass) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    const updatePayload: any = { ...body };

    if ("homeroomTeacherId" in body) {
      const oldTeacherId = oldClass.homeroomTeacherId?.toString();
      const newTeacherId = body.homeroomTeacherId ? body.homeroomTeacherId.toString() : null;

      if (oldTeacherId && oldTeacherId !== newTeacherId) {
        // Clear assignment on old teacher
        await Teacher.findByIdAndUpdate(oldTeacherId, {
          $unset: { assignedClassId: 1, assignedClassName: 1 },
        });
        await TeacherClass.deleteMany({
          teacherId: oldTeacherId,
          classId: id,
          role: "HOMEROOM_TEACHER",
        });
      }

      if (newTeacherId) {
        // If this teacher was homeroom teacher of another class, unassign that class
        await ClassModel.updateMany(
          { _id: { $ne: id }, homeroomTeacherId: newTeacherId },
          { $unset: { homeroomTeacherId: 1 } }
        );
        const className = body.className || oldClass.className;
        await Teacher.findByIdAndUpdate(newTeacherId, {
          assignedClassId: id,
          assignedClassName: `Lớp ${className}`,
        });
        await TeacherClass.findOneAndUpdate(
          { teacherId: newTeacherId, role: "HOMEROOM_TEACHER" },
          { classId: id, role: "HOMEROOM_TEACHER" },
          { upsert: true }
        );
        updatePayload.homeroomTeacherId = newTeacherId;
      } else {
        updatePayload.homeroomTeacherId = null;
      }
    }

    const updated = await ClassModel.findByIdAndUpdate(id, updatePayload, { new: true })
      .populate("homeroomTeacherId", "teacherCode fullName phone email");

    if (!updated) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    await AuditLog.create({
      actorId: session!.accountCode,
      actorName: session!.fullName,
      actorRole: session!.roles[0],
      action: "UPDATE",
      targetType: "CLASS",
      targetId: updated._id.toString(),
      targetName: updated.className,
      description: `Cập nhật thông tin lớp học ${updated.className}.`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Cập nhật lớp học thành công.",
    });
  } catch (error: any) {
    console.error("Class PUT Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = getAuthSession(req);
    const perm = checkPermission(session, ["SUPER_ADMIN"]);
    if (!perm.authorized) {
      return NextResponse.json({ success: false, message: perm.message }, { status: perm.status });
    }

    const { id } = await params;
    await connectToDatabase();
    const deactivated = await ClassModel.findByIdAndUpdate(
      id,
      { status: "INACTIVE" },
      { new: true }
    );

    if (!deactivated) {
      return NextResponse.json({ success: false, message: "Không tìm thấy lớp học." }, { status: 404 });
    }

    await AuditLog.create({
      actorId: session!.accountCode,
      actorName: session!.fullName,
      actorRole: session!.roles[0],
      action: "DEACTIVATE",
      targetType: "CLASS",
      targetId: deactivated._id.toString(),
      targetName: deactivated.className,
      description: `Ngừng hoạt động lớp học ${deactivated.className}.`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Đã chuyển trạng thái lớp sang ngừng hoạt động.",
    });
  } catch (error: any) {
    console.error("Class DELETE Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ." }, { status: 500 });
  }
}
