import { NextRequest, NextResponse } from "next/server";


import connectToDatabase from "@/lib/mongodb";
import { CompetitionCriteria, AuditLog } from "@/models";
import { getAuthSession, checkPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get("targetType");
    const activeOnly = searchParams.get("activeOnly") !== "false";

    const query: any = {};
    if (activeOnly) query.isActive = true;
    if (targetType) query.targetType = targetType;

    const criteria = await CompetitionCriteria.find(query).sort({ targetType: 1, points: -1 });

    return NextResponse.json({
      success: true,
      data: criteria,
    });
  } catch (error: any) {
    console.error("Criteria GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy danh sách tiêu chí." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    // Super Admin only can create competition criteria
    const perm = checkPermission(session, ["SUPER_ADMIN"]);
    if (!perm.authorized) {
      return NextResponse.json(
        { success: false, message: "Chỉ Super Admin mới có quyền tạo tiêu chí thi đua." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { name, description, targetType, points, category } = body;

    if (!name || !targetType || points === undefined) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập tên tiêu chí, đối tượng và điểm." },
        { status: 400 }
      );
    }

    const newCriteria = await CompetitionCriteria.create({
      name: name.trim(),
      description: description?.trim(),
      targetType,
      points: Number(points),
      category: category?.trim() || "Chung",
      isActive: true,
    });

    await AuditLog.create({
      actorId: session!.accountCode,
      actorName: session!.fullName,
      actorRole: session!.roles[0],
      action: "CREATE",
      targetType: "CRITERIA",
      targetId: newCriteria._id.toString(),
      targetName: newCriteria.name,
      description: `Tạo mới tiêu chí thi đua: ${newCriteria.name} (${newCriteria.points > 0 ? "+" : ""}${newCriteria.points}đ).`,
      pointChange: newCriteria.points,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      data: newCriteria,
      message: "Tạo tiêu chí thi đua thành công.",
    });
  } catch (error: any) {
    console.error("Criteria POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tạo tiêu chí." },
      { status: 500 }
    );
  }
}
