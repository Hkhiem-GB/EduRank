import { NextRequest, NextResponse } from "next/server";


import connectToDatabase from "@/lib/mongodb";
import { Student, StudentCompetitionRecord, ClassModel, User, AuditLog } from "@/models";
import { getAuthSession, checkPermission, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const grade = searchParams.get("grade");
    const status = searchParams.get("status") || "ACTIVE";
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const query: any = {};
    if (status !== "ALL") {
      query.status = status;
    }

    if (classId) {
      query.classId = classId;
    } else if (grade) {
      const classesInGrade: any[] = await ClassModel.find({ grade: Number(grade) as any })
        .select("_id")
        .lean();
      query.classId = { $in: classesInGrade.map((c: any) => c._id) };
    }

    if (search) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ fullName: regex }, { studentCode: regex }];
    }

    const skip = (page - 1) * limit;
    const [students, total] = await Promise.all([
      Student.find(query)
        .populate("classId", "classCode className grade")
        .sort({ studentCode: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Student.countDocuments(query),
    ]);

    // Compute scores for each returned student
    const studentIds = students.map((s) => s._id);
    const records = await StudentCompetitionRecord.find({
      studentId: { $in: studentIds },
      status: "ACTIVE",
    }).lean();

    const scoreMap = new Map<string, { positive: number; negative: number }>();
    for (const r of records) {
      const key = r.studentId.toString();
      const current = scoreMap.get(key) || { positive: 0, negative: 0 };
      if (r.points > 0) current.positive += r.points;
      else current.negative += Math.abs(r.points);
      scoreMap.set(key, current);
    }

    const formattedData = students.map((s: any) => {
      const sc = scoreMap.get(s._id.toString()) || { positive: 0, negative: 0 };
      const totalScore = 100 + sc.positive - sc.negative;
      const populatedClass = s.classId && typeof s.classId === "object" ? s.classId : null;
      return {
        ...s,
        _id: s._id.toString(),
        classId: populatedClass ? populatedClass._id.toString() : (s.classId ? s.classId.toString() : ""),
        className: populatedClass?.className || s.className,
        grade: populatedClass?.grade || s.grade,
        score: totalScore,
        positivePoints: sc.positive,
        negativePoints: sc.negative,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Students GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy danh sách học sinh." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getAuthSession(req);
    const perm = checkPermission(session, ["SUPER_ADMIN", "ADMIN"]);
    if (!perm.authorized) {
      return NextResponse.json({ success: false, message: perm.message }, { status: perm.status });
    }

    await connectToDatabase();
    const body = await req.json();
    const { studentCode, fullName, dateOfBirth, gender, classId, parentName, parentPhone, password } = body;

    if (!fullName || !dateOfBirth || !gender || !classId) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ các trường bắt buộc (họ tên, ngày sinh, giới tính, lớp học)." },
        { status: 400 }
      );
    }

    const cls = await ClassModel.findById(classId);
    if (!cls) {
      return NextResponse.json(
        { success: false, message: "Lớp học được chọn không tồn tại." },
        { status: 400 }
      );
    }

    let code = studentCode?.trim().toUpperCase();
    if (!code) {
      const count = await Student.countDocuments();
      let nextNum = count + 1;
      let candidate = `HS${String(nextNum).padStart(3, "0")}`;
      while (await Student.findOne({ studentCode: candidate })) {
        nextNum++;
        candidate = `HS${String(nextNum).padStart(3, "0")}`;
      }
      code = candidate;
    } else {
      const existing = await Student.findOne({ studentCode: code });
      if (existing) {
        return NextResponse.json(
          { success: false, message: `Mã học sinh ${code} đã tồn tại trong hệ thống.` },
          { status: 400 }
        );
      }
    }

    const newStudent = await Student.create({
      studentCode: code,
      fullName: fullName.trim(),
      dateOfBirth: new Date(dateOfBirth),
      gender,
      classId,
      parentName: parentName?.trim(),
      parentPhone: parentPhone?.trim(),
      status: "ACTIVE",
    });

    // Create corresponding user account (password: default "123456" or custom)
    const initialPassword = password?.trim() || "123456";
    const passwordHash = await hashPassword(initialPassword);
    await User.create({
      accountCode: code,
      fullName: fullName.trim(),
      passwordHash,
      roles: ["STUDENT"],
      studentId: newStudent._id,
      isActive: true,
    });

    // Update class studentCount
    await ClassModel.findByIdAndUpdate(classId, { $inc: { studentCount: 1 } });

    await AuditLog.create({
      actorId: session!.accountCode,
      actorName: session!.fullName,
      actorRole: session!.roles[0],
      action: "CREATE",
      targetType: "STUDENT",
      targetId: newStudent._id.toString(),
      targetName: newStudent.fullName,
      description: `Thêm mới học sinh ${newStudent.fullName} (${newStudent.studentCode}) vào lớp ${cls.className}.`,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      data: newStudent,
      message: `Thêm học sinh ${newStudent.fullName} vào lớp ${cls.className} thành công!`,
    });
  } catch (error: any) {
    console.error("Students POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tạo học sinh." },
      { status: 500 }
    );
  }
}
