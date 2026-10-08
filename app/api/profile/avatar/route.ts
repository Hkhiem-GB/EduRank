import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/models";
import { getAuthSession } from "@/lib/auth";
import { uploadToImgBB } from "@/lib/imgbb";

export async function POST(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Chưa đăng nhập." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Vui lòng chọn tập tin ảnh." },
        { status: 400 }
      );
    }

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "Dung lượng ảnh không được vượt quá 5MB." },
        { status: 400 }
      );
    }

    // Validate mime type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Định dạng ảnh không hợp lệ (hỗ trợ JPG, PNG, WEBP, GIF)." },
        { status: 400 }
      );
    }

    // Read bytes & upload to ImgBB
    const bytes = await file.arrayBuffer();
    const fileName = `avatar-${session.accountCode || session.userId}-${Date.now()}`;
    const avatarUrl = await uploadToImgBB(bytes, fileName);

    // Save cloud URL in MongoDB
    await connectToDatabase();
    await User.findByIdAndUpdate(session.userId, { avatarUrl });

    return NextResponse.json({
      success: true,
      message: "Tải lên ảnh đại diện lên ImgBB thành công.",
      avatarUrl,
    });
  } catch (error: any) {
    console.error("Avatar Upload Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Lỗi máy chủ khi tải ảnh đại diện lên ImgBB.",
      },
      { status: 500 }
    );
  }
}
