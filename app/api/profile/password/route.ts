import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User, AuditLog } from "@/models";
import { getAuthSession, comparePassword, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Chưa đăng nhập." },
        { status: 401 }
      );
    }

    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập cả mật khẩu cũ và mật khẩu mới." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu mới phải có tối thiểu 6 ký tự." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).select("+passwordHash");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy người dùng." },
        { status: 404 }
      );
    }

    const isOldMatch = await comparePassword(oldPassword, user.passwordHash);
    if (!isOldMatch) {
      return NextResponse.json(
        { success: false, message: "Mật khẩu hiện tại không chính xác." },
        { status: 400 }
      );
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    await AuditLog.create({
      actorId: session.accountCode,
      actorName: session.fullName,
      actorRole: session.roles[0],
      action: "UPDATE",
      targetType: "USER",
      targetId: user._id.toString(),
      targetName: user.accountCode,
      description: `Người dùng ${session.fullName} (${session.accountCode}) đã đổi mật khẩu.`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      message: "Đổi mật khẩu thành công.",
    });
  } catch (error: any) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi đổi mật khẩu." },
      { status: 500 }
    );
  }
}
