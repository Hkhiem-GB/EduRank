import { NextRequest, NextResponse } from "next/server";


import connectToDatabase from "@/lib/mongodb";
import { User, Teacher, Student } from "@/models";
import { getAuthSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Chưa đăng nhập." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng." },
        { status: 404 }
      );
    }

    let teacher = null;
    let student = null;

    if (user.teacherId) {
      teacher = await Teacher.findById(user.teacherId).populate("assignedClassId");
    } else if (user.studentId) {
      student = await Student.findById(user.studentId).populate("classId");
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          _id: user._id.toString(),
          accountCode: user.accountCode,
          fullName: user.fullName,
          roles: user.roles,
          avatarUrl: user.avatarUrl,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        teacher,
        student,
      },
    });
  } catch (error: any) {
    console.error("Profile GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tải hồ sơ." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Chưa đăng nhập." },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng." },
        { status: 404 }
      );
    }

    // Update teacher editable fields if teacher
    if (user.teacherId) {
      const { phone, email } = body;
      await Teacher.findByIdAndUpdate(user.teacherId, {
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
      });
    }

    // Update student editable fields if student
    if (user.studentId) {
      const { parentName, parentPhone } = body;
      await Student.findByIdAndUpdate(user.studentId, {
        ...(parentName !== undefined && { parentName }),
        ...(parentPhone !== undefined && { parentPhone }),
      });
    }

    if (body.avatarUrl !== undefined) {
      user.avatarUrl = body.avatarUrl;
      await user.save();
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật thông tin thành công.",
    });
  } catch (error: any) {
    console.error("Profile PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi cập nhật hồ sơ." },
      { status: 500 }
    );
  }
}
