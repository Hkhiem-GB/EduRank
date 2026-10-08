import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Teacher, ClassModel, TeacherClass, AuditLog } from "@/models";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const teacher = await Teacher.findById(id).populate("assignedClassId").lean();

    if (!teacher) {
      return NextResponse.json({ success: false, message: "Không tìm thấy giáo viên." }, { status: 404 });
    }

    const assignedClasses = await TeacherClass.find({ teacherId: id })
      .populate("classId")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        teacher,
        assignedClasses,
      },
    });
  } catch (error: any) {
    console.error("Teacher GET ID Error:", error);
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

    const oldTeacher = await Teacher.findById(id);
    if (!oldTeacher) {
      return NextResponse.json({ success: false, message: "Không tìm thấy giáo viên." }, { status: 404 });
    }

    let assignedClassName = oldTeacher.assignedClassName;
    const updatePayload: any = { ...body };

    if ("assignedClassId" in body) {
      const oldClassId = oldTeacher.assignedClassId?.toString();
      const newClassId = body.assignedClassId ? body.assignedClassId.toString() : null;

      if (oldClassId && oldClassId !== newClassId) {
        // Clear old class homeroom teacher
        await ClassModel.findByIdAndUpdate(oldClassId, { $unset: { homeroomTeacherId: 1 } });
        await TeacherClass.deleteMany({
          teacherId: id,
          classId: oldClassId,
          role: "HOMEROOM_TEACHER",
        });
      }

      if (newClassId) {
        const cls = await ClassModel.findById(newClassId);
        if (cls) {
          assignedClassName = `Lớp ${cls.className}`;
          // If another teacher had this class, unassign them
          if (cls.homeroomTeacherId && cls.homeroomTeacherId.toString() !== id) {
            await Teacher.findByIdAndUpdate(cls.homeroomTeacherId, {
              $unset: { assignedClassId: 1, assignedClassName: 1 },
            });
            await TeacherClass.deleteMany({
              teacherId: cls.homeroomTeacherId,
              classId: newClassId,
              role: "HOMEROOM_TEACHER",
            });
          }
          await ClassModel.findByIdAndUpdate(newClassId, { homeroomTeacherId: id });
          await TeacherClass.findOneAndUpdate(
            { teacherId: id, role: "HOMEROOM_TEACHER" },
            { classId: newClassId, role: "HOMEROOM_TEACHER" },
            { upsert: true }
          );
          updatePayload.assignedClassId = newClassId;
          updatePayload.assignedClassName = assignedClassName;
        }
      } else {
        updatePayload.assignedClassId = null;
        updatePayload.assignedClassName = null;
      }
    }

    const updated = await Teacher.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true }
    );

    await AuditLog.create({
      actorId: session!.accountCode,
      actorName: session!.fullName,
      actorRole: session!.roles[0],
      action: "UPDATE",
      targetType: "TEACHER",
      targetId: updated!._id.toString(),
      targetName: updated!.fullName,
      description: `Cập nhật thông tin giáo viên ${updated!.fullName}.`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Cập nhật giáo viên thành công.",
    });
  } catch (error: any) {
    console.error("Teacher PUT Error:", error);
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
    const teacher = await Teacher.findByIdAndUpdate(id, { status: "INACTIVE" }, { new: true });
    if (!teacher) {
      return NextResponse.json({ success: false, message: "Không tìm thấy giáo viên." }, { status: 404 });
    }

    await AuditLog.create({
      actorId: session!.accountCode,
      actorName: session!.fullName,
      actorRole: session!.roles[0],
      action: "DEACTIVATE",
      targetType: "TEACHER",
      targetId: teacher._id.toString(),
      targetName: teacher.fullName,
      description: `Đổi trạng thái giáo viên ${teacher.fullName} sang ngừng hoạt động.`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Giáo viên đã được chuyển sang trạng thái ngừng hoạt động.",
    });
  } catch (error: any) {
    console.error("Teacher DELETE Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi máy chủ." }, { status: 500 });
  }
}
