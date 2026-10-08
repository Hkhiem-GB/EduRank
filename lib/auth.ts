import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { UserRole } from "@/types";

const AUTH_SECRET = process.env.AUTH_SECRET || "edurank_super_secret_jwt_key_2026";
const TOKEN_EXPIRY = "7d";

export interface AuthTokenPayload {
  userId: string;
  accountCode: string;
  fullName: string;
  roles: UserRole[];
  teacherId?: string;
  studentId?: string;
  avatarUrl?: string;
}

/**
 * Hash password securely with bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password against bcrypt hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT token for user session
 */
export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify JWT token and return payload
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header or Cookie
 */
export function getTokenFromRequest(req: Request | NextRequest): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 2. Cookie: auth_token=<token>
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    const authCookie = cookies.find((c) => c.startsWith("auth_token="));
    if (authCookie) {
      return authCookie.substring("auth_token=".length);
    }
  }

  return null;
}

/**
 * Get validated authentication session from request
 */
export function getAuthSession(req: Request | NextRequest): AuthTokenPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Guard check: verify auth & optionally role permissions
 */
export function checkPermission(
  session: AuthTokenPayload | null,
  allowedRoles?: UserRole[]
): { authorized: boolean; status: number; message: string } {
  if (!session) {
    return { authorized: false, status: 401, message: "Chưa đăng nhập. Vui lòng đăng nhập lại." };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = session.roles.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      return { authorized: false, status: 403, message: "Bạn không có quyền thực hiện hành động này." };
    }
  }

  return { authorized: true, status: 200, message: "OK" };
}
