import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User, Teacher, Student, AuditLog } from "@/models";
import { comparePassword, signToken, TOKEN_MAX_AGE_SECONDS } from "@/lib/auth";
import { getClientIp, checkRateLimit, createRateLimitExceededResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting check (max 10 login attempts per minute per IP to prevent brute-force attacks)
    const clientIp = getClientIp(req);
    const rateResult = checkRateLimit(`auth:login:${clientIp}`, 10, 60 * 1000);
    if (!rateResult.success) {
      return createRateLimitExceededResponse(rateResult);
    }

    await connectToDatabase();
    const body = await req.json();
    const { accountCode, password } = body;

    if (!accountCode || !password || typeof accountCode !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ mã tài khoản và mật khẩu." },
        { status: 400 }
      );
    }

    const cleanCode = accountCode.trim().toUpperCase();

    // Query user by accountCode OR fullName with passwordHash
    const user = await User.findOne({
      $or: [
        { accountCode: cleanCode },
        { fullName: new RegExp(`^${accountCode.trim()}$`, "i") },
      ],
    }).select("+passwordHash");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Tài khoản không tồn tại trên hệ thống." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Tài khoản này đã bị khóa hoặc ngừng hoạt động." },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    // Fetch related profile details if teacher or student
    let teacherDetails = null;
    let studentDetails = null;

    if (user.teacherId) {
      teacherDetails = await Teacher.findById(user.teacherId).populate("assignedClassId");
    } else if (user.studentId) {
      studentDetails = await Student.findById(user.studentId).populate("classId");
    }

    // Write audit log
    await AuditLog.create({
      actorId: user.accountCode,
      actorName: user.fullName,
      actorRole: user.roles[0],
      action: "LOGIN",
      targetType: "USER",
      targetId: user._id.toString(),
      targetName: user.accountCode,
      description: `Người dùng ${user.fullName} (${user.accountCode}) đăng nhập thành công.`,
      status: "SUCCESS",
    });

    const tokenPayload = {
      userId: user._id.toString(),
      accountCode: user.accountCode,
      fullName: user.fullName,
      roles: user.roles,
      teacherId: user.teacherId?.toString(),
      studentId: user.studentId?.toString(),
      avatarUrl: user.avatarUrl,
    };

    const token = signToken(tokenPayload);

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

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công.",
      token,
      user: safeUser,
    });

    // Set HTTP-Only Cookie with 3 days expiration (259,200s)
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_MAX_AGE_SECONDS, // 3 days
    });

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ trong quá trình đăng nhập." },
      { status: 500 }
    );
  }
}
