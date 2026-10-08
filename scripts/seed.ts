import dotenv from "dotenv";
import path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import connectToDatabase from "../lib/mongodb";
import {
  User,
  Teacher,
  Student,
  ClassModel,
  SchoolYear,
  TeacherClass,
  CompetitionCriteria,
  StudentCompetitionRecord,
  ClassCompetitionRecord,
  AuditLog,
} from "../models";
import { hashPassword } from "../lib/auth";

async function runSeed() {
  console.log("🌱 Starting EduRank Database Seed...");
  await connectToDatabase();
  console.log(" Connected to MongoDB.");

  // Clear existing collections for a clean, deterministic seed
  console.log(" Cleaning existing collections...");
  await Promise.all([
    User.deleteMany({}),
    Teacher.deleteMany({}),
    Student.deleteMany({}),
    ClassModel.deleteMany({}),
    SchoolYear.deleteMany({}),
    TeacherClass.deleteMany({}),
    CompetitionCriteria.deleteMany({}),
    StudentCompetitionRecord.deleteMany({}),
    ClassCompetitionRecord.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  // 1. School Year
  console.log("📅 Creating School Year 2026-2027...");
  const schoolYear = await SchoolYear.create({
    name: "2026-2027",
    startDate: new Date("2026-09-01"),
    endDate: new Date("2027-05-31"),
    isCurrent: true,
    status: "ACTIVE",
  });

  // 2. 14 Classes
  console.log("🏫 Creating 14 Classes (THCS Na Sầm)...");
  const classDefs = [
    { classCode: "6A1", className: "Lớp 6A1", grade: 6, room: "P.101", studentCount: 38 },
    { classCode: "6A2", className: "Lớp 6A2", grade: 6, room: "P.102", studentCount: 37 },
    { classCode: "6A3", className: "Lớp 6A3", grade: 6, room: "P.103", studentCount: 36 },
    { classCode: "6A4", className: "Lớp 6A4", grade: 6, room: "P.104", studentCount: 35 },
    { classCode: "7A1", className: "Lớp 7A1", grade: 7, room: "P.201", studentCount: 36 },
    { classCode: "7A2", className: "Lớp 7A2", grade: 7, room: "P.202", studentCount: 36 },
    { classCode: "7A3", className: "Lớp 7A3", grade: 7, room: "P.203", studentCount: 35 },
    { classCode: "7A4", className: "Lớp 7A4", grade: 7, room: "P.204", studentCount: 34 },
    { classCode: "8A1", className: "Lớp 8A1", grade: 8, room: "P.301", studentCount: 37 },
    { classCode: "8A2", className: "Lớp 8A2", grade: 8, room: "P.302", studentCount: 38 },
    { classCode: "8A3", className: "Lớp 8A3", grade: 8, room: "P.303", studentCount: 36 },
    { classCode: "9A1", className: "Lớp 9A1", grade: 9, room: "P.401", studentCount: 39 },
    { classCode: "9A2", className: "Lớp 9A2", grade: 9, room: "P.402", studentCount: 38 },
    { classCode: "9A3", className: "Lớp 9A3", grade: 9, room: "P.403", studentCount: 37 },
  ];

  const createdClasses = await ClassModel.insertMany(
    classDefs.map((c) => ({
      ...c,
      schoolYearId: schoolYear._id,
      status: "ACTIVE",
    }))
  );

  const classMap = new Map<string, (typeof createdClasses)[0]>();
  for (const c of createdClasses) {
    classMap.set(c.classCode, c);
  }

  // 3. Teachers
  console.log("👨‍🏫 Creating Teachers...");
  const teacherDefs = [
    {
      teacherCode: "GV001",
      fullName: "Hoàng Văn Bách",
      gender: "MALE" as const,
      dateOfBirth: new Date("1982-05-14"),
      phone: "0912345678",
      email: "bach.hoang@thcsnasam.edu.vn",
      department: "Toán - Tin",
      assignedClassId: classMap.get("9A1")?._id,
      assignedClassName: "Lớp 9A1",
    },
    {
      teacherCode: "GV002",
      fullName: "Trần Thị Mai",
      gender: "FEMALE" as const,
      dateOfBirth: new Date("1987-11-20"),
      phone: "0987654321",
      email: "mai.tran@thcsnasam.edu.vn",
      department: "Ngữ văn - KHXH",
      assignedClassId: classMap.get("8A2")?._id,
      assignedClassName: "Lớp 8A2",
    },
    {
      teacherCode: "GV003",
      fullName: "Nguyễn Đình Quân",
      gender: "MALE" as const,
      dateOfBirth: new Date("1985-03-08"),
      phone: "0934567890",
      email: "quan.nguyen@thcsnasam.edu.vn",
      department: "Ngoại ngữ",
      assignedClassId: classMap.get("7A1")?._id,
      assignedClassName: "Lớp 7A1",
    },
    {
      teacherCode: "GV004",
      fullName: "Lê Thu Hà",
      gender: "FEMALE" as const,
      dateOfBirth: new Date("1990-09-15"),
      phone: "0901234567",
      email: "ha.le@thcsnasam.edu.vn",
      department: "KHTN - Vật lý",
      assignedClassId: classMap.get("6A1")?._id,
      assignedClassName: "Lớp 6A1",
    },
    {
      teacherCode: "GV005",
      fullName: "Vũ Thị Lan",
      gender: "FEMALE" as const,
      dateOfBirth: new Date("1984-06-22"),
      phone: "0978901234",
      email: "lan.vu@thcsnasam.edu.vn",
      department: "Hóa học",
      assignedClassId: classMap.get("9A2")?._id,
      assignedClassName: "Lớp 9A2",
    },
    {
      teacherCode: "GV006",
      fullName: "Phạm Minh Tuấn",
      gender: "MALE" as const,
      dateOfBirth: new Date("1989-12-05"),
      phone: "0965432109",
      email: "tuan.pham@thcsnasam.edu.vn",
      department: "Sinh học",
      assignedClassId: classMap.get("8A1")?._id,
      assignedClassName: "Lớp 8A1",
    },
    {
      teacherCode: "GV007",
      fullName: "Đỗ Quốc Huy",
      gender: "MALE" as const,
      dateOfBirth: new Date("1988-04-18"),
      phone: "0918765432",
      email: "huy.do@thcsnasam.edu.vn",
      department: "Lịch sử - Địa lý",
      assignedClassId: classMap.get("7A2")?._id,
      assignedClassName: "Lớp 7A2",
    },
    {
      teacherCode: "GV008",
      fullName: "Bùi Phương Thảo",
      gender: "FEMALE" as const,
      dateOfBirth: new Date("1993-01-29"),
      phone: "0945678901",
      email: "thao.bui@thcsnasam.edu.vn",
      department: "GDCD - Nghệ thuật",
      assignedClassId: classMap.get("6A2")?._id,
      assignedClassName: "Lớp 6A2",
    },
  ];

  const createdTeachers = await Teacher.insertMany(teacherDefs);
  const teacherMap = new Map<string, (typeof createdTeachers)[0]>();
  for (const t of createdTeachers) {
    teacherMap.set(t.teacherCode, t);
  }

  // Update Homeroom teachers in Class model and TeacherClass
  console.log("🔗 Mapping Homeroom Teachers to Classes...");
  const teacherClassesToCreate = [];
  for (const t of createdTeachers) {
    if (t.assignedClassId) {
      await ClassModel.findByIdAndUpdate(t.assignedClassId, {
        homeroomTeacherId: t._id,
      });
      teacherClassesToCreate.push({
        teacherId: t._id,
        classId: t.assignedClassId,
        role: "HOMEROOM_TEACHER" as const,
      });
    }
  }
  await TeacherClass.insertMany(teacherClassesToCreate);

  // 4. Students
  console.log("🎓 Creating Students...");
  const studentDefs = [
    {
      studentCode: "HS001",
      fullName: "Nguyễn Văn An",
      dateOfBirth: new Date("2015-03-12"),
      gender: "MALE" as const,
      classId: classMap.get("6A1")!._id,
      parentName: "Nguyễn Văn Hùng",
      parentPhone: "0912111222",
    },
    {
      studentCode: "HS002",
      fullName: "Trần Mai Phương",
      dateOfBirth: new Date("2015-08-20"),
      gender: "FEMALE" as const,
      classId: classMap.get("6A1")!._id,
      parentName: "Trần Văn Bình",
      parentPhone: "0912333444",
    },
    {
      studentCode: "HS003",
      fullName: "Lê Hoàng Nam",
      dateOfBirth: new Date("2014-05-15"),
      gender: "MALE" as const,
      classId: classMap.get("7A1")!._id,
      parentName: "Lê Văn Tuấn",
      parentPhone: "0912555666",
    },
    {
      studentCode: "HS004",
      fullName: "Phạm Minh Thư",
      dateOfBirth: new Date("2014-11-02"),
      gender: "FEMALE" as const,
      classId: classMap.get("7A2")!._id,
      parentName: "Phạm Đức Thắng",
      parentPhone: "0912777888",
    },
    {
      studentCode: "HS005",
      fullName: "Đỗ Quốc Bảo",
      dateOfBirth: new Date("2013-04-18"),
      gender: "MALE" as const,
      classId: classMap.get("8A1")!._id,
      parentName: "Đỗ Văn Lộc",
      parentPhone: "0912999000",
    },
    {
      studentCode: "HS006",
      fullName: "Vũ Thảo Linh",
      dateOfBirth: new Date("2013-09-25"),
      gender: "FEMALE" as const,
      classId: classMap.get("8A2")!._id,
      parentName: "Vũ Hoàng Minh",
      parentPhone: "0913111222",
    },
    {
      studentCode: "HS007",
      fullName: "Hoàng Đức Anh",
      dateOfBirth: new Date("2012-01-10"),
      gender: "MALE" as const,
      classId: classMap.get("9A1")!._id,
      parentName: "Hoàng Văn Nam",
      parentPhone: "0913333444",
    },
    {
      studentCode: "HS008",
      fullName: "Bùi Ngọc Ánh",
      dateOfBirth: new Date("2012-07-04"),
      gender: "FEMALE" as const,
      classId: classMap.get("9A1")!._id,
      parentName: "Bùi Quốc Triều",
      parentPhone: "0913555666",
    },
  ];

  const createdStudents = await Student.insertMany(studentDefs);
  const studentMap = new Map<string, (typeof createdStudents)[0]>();
  for (const s of createdStudents) {
    studentMap.set(s.studentCode, s);
  }

  // 5. Competition Criteria
  console.log("📋 Creating Competition Criteria...");
  const criteriaDefs = [
    // Class Criteria - Positive
    { name: "Xếp hàng 15 phút đầu giờ nghiêm túc", targetType: "CLASS" as const, points: 10, category: "Nề nếp" },
    { name: "Đạt 100% điểm tốt (8, 9, 10) trong ngày", targetType: "CLASS" as const, points: 20, category: "Học tập" },
    { name: "Vệ sinh lớp học sạch sẽ, trang trí chuẩn", targetType: "CLASS" as const, points: 15, category: "Vệ sinh" },
    { name: "Tham gia phong trào văn nghệ / thể thao trường", targetType: "CLASS" as const, points: 30, category: "Hoạt động" },
    { name: "Không có học sinh vi phạm trong tuần", targetType: "CLASS" as const, points: 25, category: "Kỷ luật" },
    // Class Criteria - Negative
    { name: "Mất trật tự trong giờ học chung", targetType: "CLASS" as const, points: -15, category: "Kỷ luật" },
    { name: "Vệ sinh lớp bẩn, xả rác bừa bãi", targetType: "CLASS" as const, points: -10, category: "Vệ sinh" },
    { name: "Có học sinh đi học muộn", targetType: "CLASS" as const, points: -10, category: "Chuyên cần" },
    { name: "Không tập trung thể dục giữa giờ", targetType: "CLASS" as const, points: -10, category: "Nề nếp" },
    { name: "Bỏ tiết, trốn học", targetType: "CLASS" as const, points: -30, category: "Kỷ luật" },

    // Student Criteria - Positive
    { name: "Phát biểu xây dựng bài sôi nổi", targetType: "STUDENT" as const, points: 5, category: "Học tập" },
    { name: "Đạt điểm 10 kiểm tra", targetType: "STUDENT" as const, points: 10, category: "Học tập" },
    { name: "Nhặt được của rơi trả lại người mất", targetType: "STUDENT" as const, points: 20, category: "Đạo đức" },
    { name: "Giúp đỡ bạn tiến bộ trong học tập", targetType: "STUDENT" as const, points: 10, category: "Đoàn kết" },
    { name: "Tham gia đội tuyển học sinh giỏi", targetType: "STUDENT" as const, points: 25, category: "Học tập" },
    // Student Criteria - Negative
    { name: "Không làm bài tập về nhà", targetType: "STUDENT" as const, points: -5, category: "Học tập" },
    { name: "Nói chuyện riêng trong giờ học", targetType: "STUDENT" as const, points: -5, category: "Kỷ luật" },
    { name: "Đi học muộn", targetType: "STUDENT" as const, points: -5, category: "Chuyên cần" },
    { name: "Trang phục sai quy định / không đeo khăn quàng", targetType: "STUDENT" as const, points: -5, category: "Nề nếp" },
    { name: "Sử dụng điện thoại trái phép trong lớp", targetType: "STUDENT" as const, points: -15, category: "Kỷ luật" },
    { name: "Gây gổ, mất đoàn kết", targetType: "STUDENT" as const, points: -20, category: "Đạo đức" },
  ];

  const createdCriteria = await CompetitionCriteria.insertMany(criteriaDefs);
  const criteriaMap = new Map<string, (typeof createdCriteria)[0]>();
  for (const c of createdCriteria) {
    criteriaMap.set(c.name, c);
  }

  // 6. Users & Passwords (bcrypt hash of "123456")
  console.log("🔐 Creating Users (Password: 123456)...");
  const defaultPasswordHash = await hashPassword("123456");

  const usersToCreate = [
    // Super Admin
    {
      accountCode: "ADMIN",
      fullName: "Ban Giám Hiệu - Quản trị hệ thống",
      passwordHash: defaultPasswordHash,
      roles: ["SUPER_ADMIN", "ADMIN"] as const,
      isActive: true,
    },
    // Admin (Tổng phụ trách Đội)
    {
      accountCode: "BGH",
      fullName: "Thầy Lê Minh Đức (Tổng Phụ Trách Đội)",
      passwordHash: defaultPasswordHash,
      roles: ["ADMIN"] as const,
      isActive: true,
    },
    // Teachers (GV001 has multi-role TEACHER + ADMIN for testing)
    ...createdTeachers.map((t) => ({
      accountCode: t.teacherCode,
      fullName: t.fullName,
      passwordHash: defaultPasswordHash,
      roles: t.teacherCode === "GV001" ? (["TEACHER", "ADMIN"] as const) : (["TEACHER"] as const),
      teacherId: t._id,
      isActive: true,
    })),
    // Students
    ...createdStudents.map((s) => ({
      accountCode: s.studentCode,
      fullName: s.fullName,
      passwordHash: defaultPasswordHash,
      roles: ["STUDENT"] as const,
      studentId: s._id,
      isActive: true,
    })),
  ];

  await User.insertMany(usersToCreate);

  // 7. Seed Competition Records for realistic initial rankings
  console.log("🏆 Seeding Initial Competition Records...");
  const c9A1 = classMap.get("9A1")!;
  const c8A2 = classMap.get("8A2")!;
  const c7A1 = classMap.get("7A1")!;
  const c6A1 = classMap.get("6A1")!;
  const c6A2 = classMap.get("6A2")!;

  const critRankClean = criteriaMap.get("Vệ sinh lớp học sạch sẽ, trang trí chuẩn")!;
  const critRankLine = criteriaMap.get("Xếp hàng 15 phút đầu giờ nghiêm túc")!;
  const critRankPerfect = criteriaMap.get("Đạt 100% điểm tốt (8, 9, 10) trong ngày")!;
  const critSport = criteriaMap.get("Tham gia phong trào văn nghệ / thể thao trường")!;
  const critLateClass = criteriaMap.get("Có học sinh đi học muộn")!;

  const classRecords = [
    // 9A1: +15, +20, +30, +10, +10 = +85 (Total 100 + 85 = 185)
    { classId: c9A1._id, criteriaId: critSport._id, points: 30, note: "Đoạt giải Nhất bóng chuyền cấp trường", createdBy: "ADMIN" },
    { classId: c9A1._id, criteriaId: critRankPerfect._id, points: 20, note: "Giờ học tốt", createdBy: "GV001" },
    { classId: c9A1._id, criteriaId: critRankClean._id, points: 15, note: "Vệ sinh khuôn viên xuất sắc", createdBy: "ADMIN" },
    { classId: c9A1._id, criteriaId: critRankLine._id, points: 10, note: "Nề nếp đầu giờ tốt", createdBy: "GV001" },
    { classId: c9A1._id, criteriaId: critRankLine._id, points: 10, note: "Thể dục giữa giờ đều", createdBy: "ADMIN" },

    // 8A2: +20, +15, +15, +10 = +60 (Total 100 + 60 = 160)
    { classId: c8A2._id, criteriaId: critRankPerfect._id, points: 20, note: "Tuần học tốt", createdBy: "GV002" },
    { classId: c8A2._id, criteriaId: critRankClean._id, points: 15, note: "Lớp sạch đẹp", createdBy: "GV002" },
    { classId: c8A2._id, criteriaId: critRankClean._id, points: 15, note: "Chăm sóc bồn hoa tốt", createdBy: "ADMIN" },
    { classId: c8A2._id, criteriaId: critRankLine._id, points: 10, note: "Xếp hàng chuẩn", createdBy: "GV002" },

    // 7A1: +20, +10, -10 = +20 (Total 100 + 20 = 120)
    { classId: c7A1._id, criteriaId: critRankPerfect._id, points: 20, note: "Nhiều điểm tốt", createdBy: "GV003" },
    { classId: c7A1._id, criteriaId: critRankLine._id, points: 10, note: "Đầu giờ nghiêm túc", createdBy: "GV003" },
    { classId: c7A1._id, criteriaId: critLateClass._id, points: -10, note: "1 bạn đi trễ 10 phút", createdBy: "ADMIN" },

    // 6A1: +10, +15, -10 = +15 (Total 100 + 15 = 115)
    { classId: c6A1._id, criteriaId: critRankLine._id, points: 10, note: "Nề nếp tốt", createdBy: "GV004" },
    { classId: c6A1._id, criteriaId: critRankClean._id, points: 15, note: "Trực nhật sạch", createdBy: "GV004" },
    { classId: c6A1._id, criteriaId: critLateClass._id, points: -10, note: "Xếp hàng thể dục chậm", createdBy: "ADMIN" },

    // 6A2: +10 (Total 100 + 10 = 110)
    { classId: c6A2._id, criteriaId: critRankLine._id, points: 10, note: "Đi học đầy đủ", createdBy: "GV008" },
  ];

  await ClassCompetitionRecord.insertMany(
    classRecords.map((r) => ({ ...r, status: "ACTIVE" }))
  );

  // Student Records
  const sAn = studentMap.get("HS001")!; // Nguyễn Văn An (6A1)
  const sPhuong = studentMap.get("HS002")!; // Trần Mai Phương (6A1)
  const sNam = studentMap.get("HS003")!; // Lê Hoàng Nam (7A1)
  const sDucAnh = studentMap.get("HS007")!; // Hoàng Đức Anh (9A1)

  const critPoint10 = criteriaMap.get("Đạt điểm 10 kiểm tra")!;
  const critGoodDeed = criteriaMap.get("Nhặt được của rơi trả lại người mất")!;
  const critSpeak = criteriaMap.get("Phát biểu xây dựng bài sôi nổi")!;
  const critLateStudent = criteriaMap.get("Đi học muộn")!;

  const studentRecords = [
    // sAn: 100 + 10 + 5 = 115
    { studentId: sAn._id, classId: sAn.classId, criteriaId: critPoint10._id, points: 10, note: "Điểm 10 môn Toán", createdBy: "GV004" },
    { studentId: sAn._id, classId: sAn.classId, criteriaId: critSpeak._id, points: 5, note: "Hăng hái phát biểu", createdBy: "GV004" },

    // sPhuong: 100 + 20 + 10 = 130 (Top 1 tiêu biểu)
    { studentId: sPhuong._id, classId: sPhuong.classId, criteriaId: critGoodDeed._id, points: 20, note: "Nhặt ví tiền 500k gửi cô TPT", createdBy: "ADMIN" },
    { studentId: sPhuong._id, classId: sPhuong.classId, criteriaId: critPoint10._id, points: 10, note: "Điểm 10 môn Ngữ Văn", createdBy: "GV004" },

    // sDucAnh: 100 + 10 + 10 = 120 (Top 2 tiêu biểu)
    { studentId: sDucAnh._id, classId: sDucAnh.classId, criteriaId: critPoint10._id, points: 10, note: "Điểm 10 Hóa học", createdBy: "GV005" },
    { studentId: sDucAnh._id, classId: sDucAnh.classId, criteriaId: critPoint10._id, points: 10, note: "Điểm 10 Vật lý", createdBy: "GV001" },

    // sNam: 100 + 10 - 5 = 105
    { studentId: sNam._id, classId: sNam.classId, criteriaId: critPoint10._id, points: 10, note: "Điểm 10 Tiếng Anh", createdBy: "GV003" },
    { studentId: sNam._id, classId: sNam.classId, criteriaId: critLateStudent._id, points: -5, note: "Đi học muộn thứ 2", createdBy: "ADMIN" },
  ];

  await StudentCompetitionRecord.insertMany(
    studentRecords.map((r) => ({ ...r, status: "ACTIVE" }))
  );

  // 8. Audit Logs
  console.log("📝 Writing System Audit Logs...");
  await AuditLog.insertMany([
    {
      timestamp: new Date(),
      actorId: "ADMIN",
      actorName: "Ban Giám Hiệu - Quản trị hệ thống",
      actorRole: "SUPER_ADMIN",
      action: "CREATE",
      targetType: "CLASS",
      targetId: c9A1._id.toString(),
      targetName: "Lớp 9A1",
      description: "Khởi tạo dữ liệu lớp học năm học 2026-2027",
      status: "SUCCESS",
    },
    {
      timestamp: new Date(),
      actorId: "ADMIN",
      actorName: "Ban Giám Hiệu - Quản trị hệ thống",
      actorRole: "SUPER_ADMIN",
      action: "CREATE",
      targetType: "CRITERIA",
      targetId: critGoodDeed._id.toString(),
      targetName: critGoodDeed.name,
      description: "Ban hành bảng tiêu chí thi đua khen thưởng",
      status: "SUCCESS",
    },
  ]);

  console.log(" Seed completed successfully! All data written to MongoDB.");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
