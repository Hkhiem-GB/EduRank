import { NextRequest, NextResponse } from "next/server";


import connectToDatabase from "@/lib/mongodb";
import {
  User,
  Teacher,
  Student,
  ClassModel,
  SchoolYear,
  TeacherClass,
  ClassCompetitionRecord,
  StudentCompetitionRecord,
} from "@/models";
import { getAuthSession } from "@/lib/auth";
import { ClassRankingItem, StudentRankingItem, CompetitionRecordSummary } from "@/types";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = getAuthSession(req);
    const { searchParams } = new URL(req.url);
    const requestedRole = searchParams.get("role") || (session?.roles && session.roles[0]) || "ADMIN";

    // 1. School year
    const activeSchoolYear =
      (await SchoolYear.findOne({ isCurrent: true }).lean()) ||
      (await SchoolYear.findOne().sort({ startDate: -1 }).lean());

    // 2. Records and Students
    const [classes, students, classRecords, studentRecords] = await Promise.all([
      ClassModel.find({ status: "ACTIVE" }).populate("homeroomTeacherId", "fullName").lean(),
      Student.find({ status: "ACTIVE" }).populate("classId", "className").lean(),
      ClassCompetitionRecord.find({ status: "ACTIVE" }).lean(),
      StudentCompetitionRecord.find({ status: "ACTIVE" }).lean(),
    ]);

    // Student counts per class
    const studentCountMap = new Map<string, number>();
    for (const s of students) {
      const cId = (s.classId as any)?._id?.toString() || s.classId?.toString();
      if (cId) {
        studentCountMap.set(cId, (studentCountMap.get(cId) || 0) + 1);
      }
    }

    // Points map for classes (both class-level records and student records within class)
    const classPointsMap = new Map<string, { positive: number; negative: number }>();
    const allRecords = [...classRecords, ...studentRecords];
    for (const r of allRecords) {
      const key = r.classId?.toString();
      if (key) {
        const current = classPointsMap.get(key) || { positive: 0, negative: 0 };
        if (r.points > 0) current.positive += r.points;
        else current.negative += Math.abs(r.points);
        classPointsMap.set(key, current);
      }
    }

    const classRankings: ClassRankingItem[] = classes.map((c: any) => {
      const p = classPointsMap.get(c._id.toString()) || { positive: 0, negative: 0 };
      const realStudentCount = studentCountMap.has(c._id.toString())
        ? studentCountMap.get(c._id.toString())!
        : c.studentCount || 0;
      return {
        rank: 0,
        classId: c._id.toString(),
        className: c.className,
        grade: c.grade,
        score: 100 + p.positive - p.negative,
        positivePoints: p.positive,
        negativePoints: p.negative,
        studentCount: realStudentCount,
        homeroomTeacherName: c.homeroomTeacherId?.fullName || "Chưa phân công",
      };
    });

    classRankings.sort((a, b) => b.score - a.score);
    classRankings.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    // 3. Student rankings
    const studentPointsMap = new Map<string, { positive: number; negative: number }>();
    for (const r of studentRecords) {
      const key = r.studentId.toString();
      const current = studentPointsMap.get(key) || { positive: 0, negative: 0 };
      if (r.points > 0) current.positive += r.points;
      else current.negative += Math.abs(r.points);
      studentPointsMap.set(key, current);
    }

    const studentRankings: StudentRankingItem[] = students.map((s: any) => {
      const p = studentPointsMap.get(s._id.toString()) || { positive: 0, negative: 0 };
      return {
        rank: 0,
        studentId: s._id.toString(),
        studentCode: s.studentCode,
        fullName: s.fullName,
        classId: (s.classId as any)?._id?.toString() || "",
        className: (s.classId as any)?.className || "Chưa rõ",
        score: 100 + p.positive - p.negative,
        positivePoints: p.positive,
        negativePoints: p.negative,
      };
    });

    studentRankings.sort((a, b) => b.score - a.score);
    studentRankings.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    // If STUDENT role
    if (requestedRole === "STUDENT") {
      let currentStudent = null;
      if (session?.studentId) {
        currentStudent = await Student.findById(session.studentId).populate("classId").lean();
      } else {
        // Fallback to first student for preview/demo
        currentStudent = await Student.findOne().populate("classId").lean();
      }

      const stdId = currentStudent?._id?.toString() || "";
      const p = studentPointsMap.get(stdId) || { positive: 0, negative: 0 };
      const rankItem = studentRankings.find((r) => r.studentId === stdId);

      const recentStudentRecords = await StudentCompetitionRecord.find({ studentId: stdId })
        .populate("criteriaId", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      const recentSummaries: CompetitionRecordSummary[] = (recentStudentRecords as any[]).map((r) => ({
        _id: r._id.toString(),
        targetType: "STUDENT",
        targetName: currentStudent?.fullName || "Học sinh",
        criteriaName: r.criteriaId?.name || "Tiêu chí",
        points: r.points,
        note: r.note,
        createdBy: r.createdBy,
        createdAt: r.createdAt.toISOString(),
        status: r.status,
      }));

      return NextResponse.json({
        success: true,
        type: "STUDENT",
        data: {
          student: currentStudent,
          class: currentStudent?.classId,
          score: {
            baseScore: 100,
            positivePoints: p.positive,
            negativePoints: p.negative,
            totalScore: 100 + p.positive - p.negative,
            rank: rankItem?.rank || 1,
          },
          recentRecords: recentSummaries,
          ranking: studentRankings,
        },
      });
    }

    // If TEACHER role
    if (requestedRole === "TEACHER") {
      let currentTeacher = null;
      if (session?.teacherId) {
        currentTeacher = await Teacher.findById(session.teacherId).populate("assignedClassId").lean();
      } else {
        currentTeacher = await Teacher.findOne().populate("assignedClassId").lean();
      }

      const assignedClasses = currentTeacher
        ? await TeacherClass.find({ teacherId: currentTeacher._id }).populate("classId").lean()
        : [];

      const homeroomClass = classRankings.find(
        (c) => c.classId === currentTeacher?.assignedClassId?._id?.toString()
      );

      const teacherClassSummaries = assignedClasses.map((ac: any) => {
        const cRank = classRankings.find((c) => c.classId === ac.classId?._id?.toString());
        return {
          classId: ac.classId?._id?.toString() || "",
          className: ac.classId?.className || "",
          grade: ac.classId?.grade || 0,
          studentCount: ac.classId?.studentCount || 0,
          role: ac.role,
          competitionScore: cRank?.score || 100,
        };
      });

      return NextResponse.json({
        success: true,
        type: "TEACHER",
        data: {
          teacher: currentTeacher,
          classes: teacherClassSummaries,
          statistics: {
            totalAssignedClasses: assignedClasses.length,
            totalStudents: teacherClassSummaries.reduce((sum, c) => sum + c.studentCount, 0),
            homeroomClassName: homeroomClass?.className,
            homeroomScore: homeroomClass?.score,
            homeroomRank: homeroomClass?.rank,
          },
          recentCompetitionRecords: [],
        },
      });
    }

    // Default: ADMIN / SUPER_ADMIN Dashboard
    const totalTeachers = await Teacher.countDocuments({ status: "ACTIVE" });
    const totalStudents = await Student.countDocuments({ status: "ACTIVE" });
    const totalClasses = classes.length;

    let totalPositive = 0;
    let totalNegative = 0;
    for (const r of classRecords) {
      if (r.points > 0) totalPositive += r.points;
      else totalNegative += Math.abs(r.points);
    }
    for (const r of studentRecords) {
      if (r.points > 0) totalPositive += r.points;
      else totalNegative += Math.abs(r.points);
    }

    return NextResponse.json({
      success: true,
      type: "ADMIN",
      data: {
        totalTeachers,
        totalStudents,
        totalClasses,
        activeSchoolYear,
        competitionStatistics: {
          totalClasses,
          totalStudents,
          totalPositivePoints: totalPositive,
          totalNegativePoints: totalNegative,
          totalCompetitionRecords: classRecords.length + studentRecords.length,
        },
        classRanking: classRankings,
        studentRanking: studentRankings,
      },
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy dữ liệu bảng điều khiển." },
      { status: 500 }
    );
  }
}
