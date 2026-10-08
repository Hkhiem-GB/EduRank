import { NextRequest, NextResponse } from "next/server";


import connectToDatabase from "@/lib/mongodb";
import {
  ClassCompetitionRecord,
  StudentCompetitionRecord,
} from "@/models";
import { CompetitionRecordSummary } from "@/types";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const [classRecords, studentRecords] = await Promise.all([
      ClassCompetitionRecord.find()
        .populate("classId", "className")
        .populate("criteriaId", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      StudentCompetitionRecord.find()
        .populate("studentId", "fullName")
        .populate("classId", "className")
        .populate("criteriaId", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
    ]);

    const items: CompetitionRecordSummary[] = [];

    for (const r of classRecords as any[]) {
      items.push({
        _id: r._id.toString(),
        targetType: "CLASS",
        targetName: r.classId?.className || "Lớp học",
        criteriaName: r.criteriaId?.name || "Tiêu chí thi đua",
        points: r.points,
        note: r.note,
        createdBy: r.createdBy,
        createdAt: r.createdAt.toISOString(),
        status: r.status,
      });
    }

    for (const r of studentRecords as any[]) {
      items.push({
        _id: r._id.toString(),
        targetType: "STUDENT",
        targetName: `${r.studentId?.fullName || "Học sinh"} (${r.classId?.className || ""})`,
        criteriaName: r.criteriaId?.name || "Tiêu chí thi đua",
        points: r.points,
        note: r.note,
        createdBy: r.createdBy,
        createdAt: r.createdAt.toISOString(),
        status: r.status,
      });
    }

    // Sort by createdAt desc
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      data: items.slice(0, limit),
    });
  } catch (error: any) {
    console.error("Recent Records Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy dữ liệu thi đua gần đây." },
      { status: 500 }
    );
  }
}
