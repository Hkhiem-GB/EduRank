import { NextRequest, NextResponse } from "next/server";


import connectToDatabase from "@/lib/mongodb";
import { ClassModel, ClassCompetitionRecord, StudentCompetitionRecord, Student } from "@/models";
import { ClassRankingItem } from "@/types";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get("grade");

    const query: any = { status: "ACTIVE" };
    if (grade) query.grade = Number(grade);

    const classes = await ClassModel.find(query)
      .populate("homeroomTeacherId", "fullName")
      .lean();

    const classIds = classes.map((c) => c._id);
    const [classRecords, studentRecords, studentCounts] = await Promise.all([
      ClassCompetitionRecord.find({
        classId: { $in: classIds },
        status: "ACTIVE",
      }).lean(),
      StudentCompetitionRecord.find({
        classId: { $in: classIds },
        status: "ACTIVE",
      }).lean(),
      Student.aggregate([
        { $match: { classId: { $in: classIds }, status: "ACTIVE" } },
        { $group: { _id: "$classId", count: { $sum: 1 } } },
      ]),
    ]);

    // Map student count by classId
    const studentCountMap = new Map<string, number>();
    for (const sc of studentCounts) {
      studentCountMap.set(sc._id.toString(), sc.count);
    }

    // Map points by classId (both class-level records and student records within class)
    const pointsMap = new Map<string, { positive: number; negative: number }>();
    const allRecords = [...classRecords, ...studentRecords];
    for (const r of allRecords) {
      const key = r.classId.toString();
      const current = pointsMap.get(key) || { positive: 0, negative: 0 };
      if (r.points > 0) current.positive += r.points;
      else current.negative += Math.abs(r.points);
      pointsMap.set(key, current);
    }

    const BASE_SCORE = 100;
    const items: ClassRankingItem[] = classes.map((c: any) => {
      const p = pointsMap.get(c._id.toString()) || { positive: 0, negative: 0 };
      const totalScore = BASE_SCORE + p.positive - p.negative;
      const realStudentCount = studentCountMap.has(c._id.toString())
        ? studentCountMap.get(c._id.toString())!
        : c.studentCount || 0;
      return {
        rank: 0,
        classId: c._id.toString(),
        className: c.className,
        grade: c.grade,
        score: totalScore,
        positivePoints: p.positive,
        negativePoints: p.negative,
        studentCount: realStudentCount,
        homeroomTeacherName: c.homeroomTeacherId?.fullName || "Chưa phân công",
      };
    });

    // Sort descending by score, then by positivePoints
    items.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.positivePoints - a.positivePoints;
    });

    // Assign rank
    items.forEach((item, index) => {
      item.rank = index + 1;
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    console.error("Class Ranking Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy bảng xếp hạng lớp." },
      { status: 500 }
    );
  }
}
