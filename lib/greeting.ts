import { UserRole } from "@/types";

export interface GreetingUserContext {
  fullName: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  roles?: UserRole[];
}

/**
 * Generates dynamic Vietnamese greeting based on user role, gender, and full name.
 * - TEACHER: "Thầy [FullName]" if MALE, "Cô [FullName]" if FEMALE, else "Thầy/Cô [FullName]"
 * - STUDENT: "Em [FullName]"
 * - SUPER_ADMIN / ADMIN: "Quản trị viên [FullName]"
 */
export function getUserGreeting(
  user?: GreetingUserContext | null,
  activeRole?: UserRole
): string {
  if (!user || !user.fullName) {
    return "Xin chào bạn 👋";
  }

  const name = user.fullName.trim();
  const role = activeRole || (user.roles && user.roles[0]) || "STUDENT";

  if (role === "TEACHER") {
    if (user.gender === "MALE") {
      return `Xin chào Thầy ${name} 👋`;
    }
    if (user.gender === "FEMALE") {
      return `Xin chào Cô ${name} 👋`;
    }
    return `Xin chào Thầy/Cô ${name} 👋`;
  }

  if (role === "STUDENT") {
    return `Xin chào Em ${name} 👋`;
  }

  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return `Xin chào Quản trị viên ${name} 👋`;
  }

  return `Xin chào, ${name} 👋`;
}
