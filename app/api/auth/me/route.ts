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

    // Check if user has logged out since token was issued
    const tokenIat = session.iat;
    if (user.lastLogoutAt && tokenIat) {
      const logoutSec = Math.floor(new Date(user.lastLogoutAt).getTime() / 1000);
      if (tokenIat < logoutSec) {
        const response = NextResponse.json(
          { success: false, message: "Phiên đăng nhập đã kết thúc. Vui lòng đăng nhập lại." },
          { status: 401 }
        );
        response.cookies.set("auth_token", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 0,
          expires: new Date(0),
        });
        return response;
      }
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
