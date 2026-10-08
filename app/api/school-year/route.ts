import { NextResponse } from "next/server";


import connectToDatabase from "@/lib/mongodb";
import { SchoolYear } from "@/models";

export async function GET() {
  try {
    await connectToDatabase();
    const schoolYears = await SchoolYear.find().sort({ startDate: -1 });
    const current = schoolYears.find((y) => y.isCurrent) || schoolYears[0];

    return NextResponse.json({
      success: true,
      data: schoolYears,
      current,
    });
  } catch (error: any) {
    console.error("SchoolYear GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi tải danh sách năm học." },
      { status: 500 }
    );
  }
}
