import { NextRequest, NextResponse } from "next/server";


import connectToDatabase from "@/lib/mongodb";
import { Student, StudentCompetitionRecord, ClassModel } from "@/models";
import { StudentRankingItem } from "@/types";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const grade = searchParams.get("grade");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const query: any = { status: "ACTIVE" };
    if (classId) {
      query.classId = classId;
    } else if (grade) {
      const classesInGrade: any[] = await ClassModel.find({ grade: Number(grade) as any })
        .select("_id")
        .lean();
      query.classId = { $in: classesInGrade.map((c: any) => c._id) };
    }

    const students = await Student.find(query)
      .populate("classId", "className classCode")
      .lean();

    const studentIds = students.map((s) => s._id);
    const records = await StudentCompetitionRecord.find({
      studentId: { $in: studentIds },
      status: "ACTIVE",
    }).lean();

    const pointsMap = new Map<string, { positive: number; negative: number }>();
    for (const r of records) {
      const key = r.studentId.toString();
      const current = pointsMap.get(key) || { positive: 0, negative: 0 };
      if (r.points > 0) current.positive += r.points;
      else current.negative += Math.abs(r.points);
      pointsMap.set(key, current);
    }

    const BASE_SCORE = 100;
    const items: StudentRankingItem[] = students.map((s: any) => {
      const p = pointsMap.get(s._id.toString()) || { positive: 0, negative: 0 };
      const totalScore = BASE_SCORE + p.positive - p.negative;
      return {
        rank: 0,
        studentId: s._id.toString(),
        studentCode: s.studentCode,
        fullName: s.fullName,
        classId: (s.classId as any)?._id?.toString() || "",
        className: (s.classId as any)?.className || "Chưa rõ",
        score: totalScore,
        positivePoints: p.positive,
        negativePoints: p.negative,
      };
    });

    items.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.positivePoints - a.positivePoints;
    });

    items.forEach((item, index) => {
      item.rank = index + 1;
    });

    return NextResponse.json({
      success: true,
      data: items.slice(0, limit),
    });
  } catch (error: any) {
    console.error("Student Ranking Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy bảng xếp hạng học sinh." },
      { status: 500 }
    );
  }
}
