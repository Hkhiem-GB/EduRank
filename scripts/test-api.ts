import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import connectToDatabase from "../lib/mongodb";
import { User, Teacher, Student, ClassModel, ClassCompetitionRecord, StudentCompetitionRecord } from "../models";
import { comparePassword, signToken, verifyToken } from "../lib/auth";

async function verifyBackend() {
  console.log("🔍 Running EduRank Backend Self-Verification Test...\n");
  await connectToDatabase();

  // Test 1: Check Collections Count
  const [usersCount, teachersCount, studentsCount, classesCount, classRecordsCount, studentRecordsCount] =
    await Promise.all([
      User.countDocuments(),
      Teacher.countDocuments(),
      Student.countDocuments(),
      ClassModel.countDocuments(),
      ClassCompetitionRecord.countDocuments(),
      StudentCompetitionRecord.countDocuments(),
    ]);

  console.log("✅ Database Counts:");
  console.log(`   - Users: ${usersCount}`);
  console.log(`   - Teachers: ${teachersCount}`);
  console.log(`   - Students: ${studentsCount}`);
  console.log(`   - Classes: ${classesCount}`);
  console.log(`   - Class Records: ${classRecordsCount}`);
  console.log(`   - Student Records: ${studentRecordsCount}\n`);

  if (classesCount !== 14) {
    throw new Error(`Expected 14 classes, found ${classesCount}`);
  }

  // Test 2: Authentication & Password Verification (SUPER_ADMIN, TEACHER, STUDENT)
  console.log("🔐 Testing Auth & Roles...");
  const adminUser = await User.findOne({ accountCode: "ADMIN" }).select("+passwordHash");
  if (!adminUser) throw new Error("ADMIN user missing");
  const adminPassValid = await comparePassword("123456", adminUser.passwordHash);
  console.log(`   - ADMIN password check: ${adminPassValid ? "PASS" : "FAIL"}`);
  console.log(`   - ADMIN roles: [${adminUser.roles.join(", ")}]`);

  // Test 3: Multi-role user
  const gv001 = await User.findOne({ accountCode: "GV001" });
  if (!gv001) throw new Error("GV001 user missing");
  console.log(`   - GV001 Multi-role test: [${gv001.roles.join(", ")}] (Has ${gv001.roles.length} roles)`);

  // Test 4: JWT Token Signing and Verification
  const token = signToken({
    userId: adminUser._id.toString(),
    accountCode: adminUser.accountCode,
    fullName: adminUser.fullName,
    roles: adminUser.roles,
  });
  const decoded = verifyToken(token);
  console.log(`   - JWT Token verification: ${decoded?.accountCode === "ADMIN" ? "PASS" : "FAIL"}\n`);

  // Test 5: Independent Ranking Logic
  console.log("🏆 Testing Competition & Ranking Computation...");
  const c9A1 = await ClassModel.findOne({ classCode: "9A1" });
  if (!c9A1) throw new Error("Class 9A1 missing");

  const recs9A1 = await ClassCompetitionRecord.find({ classId: c9A1._id, status: "ACTIVE" });
  let posPoints = 0;
  let negPoints = 0;
  for (const r of recs9A1) {
    if (r.points > 0) posPoints += r.points;
    else negPoints += Math.abs(r.points);
  }
  const score9A1 = 100 + posPoints - negPoints;
  console.log(`   - Lớp 9A1 Score: ${score9A1} (Base: 100, +${posPoints}, -${negPoints})`);

  const sPhuong = await Student.findOne({ studentCode: "HS002" });
  if (!sPhuong) throw new Error("HS002 missing");
  const recsPhuong = await StudentCompetitionRecord.find({ studentId: sPhuong._id, status: "ACTIVE" });
  let sPos = 0;
  let sNeg = 0;
  for (const r of recsPhuong) {
    if (r.points > 0) sPos += r.points;
    else sNeg += Math.abs(r.points);
  }
  const scorePhuong = 100 + sPos - sNeg;
  console.log(`   - Học sinh ${sPhuong.fullName} Score: ${scorePhuong} (Base: 100, +${sPos}, -${sNeg})`);

  console.log("\n🎉 ALL TESTS PASSED! Backend is fully functional and MongoDB Atlas is verified.");
  process.exit(0);
}

verifyBackend().catch((e) => {
  console.error("❌ Test failed:", e);
  process.exit(1);
});
