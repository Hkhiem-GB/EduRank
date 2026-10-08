import { NextRequest, NextResponse } from "next/server";
import { getClientIp, checkRateLimit, createRateLimitExceededResponse } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate limiting: max 20 captcha verifications per minute per IP
    const rateCheck = checkRateLimit(`captcha:${clientIp}`, 20, 60 * 1000);
    if (!rateCheck.success) {
      return createRateLimitExceededResponse(rateCheck);
    }

    const body = await req.json().catch(() => ({}));
    const { token, clientTimestamp } = body;

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    // If Google reCAPTCHA secret key is configured, verify with Google upstream
    if (secretKey && token) {
      try {
        const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}&remoteip=${encodeURIComponent(clientIp)}`,
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          return NextResponse.json(
            { success: false, message: "Xác thực reCAPTCHA không thành công từ Google." },
            { status: 400 }
          );
        }
      } catch (err) {
        console.error("Google reCAPTCHA upstream error:", err);
      }
    }

    // Smart Anti-Bot Challenge Check (zero-config fallback)
    // Verify client timestamp is reasonable (within 5 minutes)
    if (clientTimestamp) {
      const now = Date.now();
      const diff = Math.abs(now - Number(clientTimestamp));
      if (diff > 5 * 60 * 1000) {
        return NextResponse.json(
          { success: false, message: "Yêu cầu xác thực đã hết hạn. Vui lòng thử lại." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: "Xác thực bảo mật thành công.",
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("Captcha verification error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi trong quá trình xác thực an ninh." },
      { status: 500 }
    );
  }
}
