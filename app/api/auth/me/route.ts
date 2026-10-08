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

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: "Tài khoản không tồn tại hoặc đã bị khóa." },
        { status: 401 }
      );
    }

    let teacherDetails = null;
    let studentDetails = null;

    if (user.teacherId) {
      teacherDetails = await Teacher.findById(user.teacherId).populate("assignedClassId");
    } else if (user.studentId) {
      studentDetails = await Student.findById(user.studentId).populate("classId");
    }

    const safeUser = {
      _id: user._id.toString(),
      accountCode: user.accountCode,
      fullName: user.fullName,
      roles: user.roles,
      teacherId: user.teacherId?.toString(),
      studentId: user.studentId?.toString(),
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      teacherDetails,
      studentDetails,
    };

    return NextResponse.json({
      success: true,
      user: safeUser,
    });
  } catch (error: any) {
    console.error("Auth Me API Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy thông tin người dùng." },
      { status: 500 }
    );
  }
}
