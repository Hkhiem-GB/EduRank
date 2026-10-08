import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { User, AuditLog } from "@/models";

export async function POST(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (session) {
      await connectToDatabase();
      // Record logout timestamp in database to invalidate past sessions
      if (session.userId) {
        await User.findByIdAndUpdate(session.userId, {
          lastLogoutAt: new Date(),
        });
      }

      await AuditLog.create({
        actorId: session.accountCode,
        actorName: session.fullName,
        actorRole: session.roles[0],
        action: "LOGOUT",
        targetType: "USER",
        targetId: session.userId,
        targetName: session.accountCode,
        description: `Người dùng ${session.fullName} (${session.accountCode}) đã đăng xuất.`,
        status: "SUCCESS",
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Đăng xuất thành công.",
    });

    // Invalidate cookie immediately
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    console.error("Logout API Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi đăng xuất." },
      { status: 500 }
    );
  }
}
