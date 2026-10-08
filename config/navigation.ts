import { UserRole } from "@/types";

export interface NavItemConfig {
  label: string;
  href: string;
  iconName: string;
}

export interface NavGroupConfig {
  title: string;
  items: NavItemConfig[];
}

export const ROLE_NAVIGATION: Record<UserRole, NavGroupConfig[]> = {
  SUPER_ADMIN: [
    {
      title: "Hệ thống",
      items: [
        {
          label: "Tổng quan",
          href: "/admin/dashboard",
          iconName: "LayoutDashboard",
        },
        {
          label: "Bảng xếp hạng",
          href: "/ranking",
          iconName: "Trophy",
        },
      ],
    },
    {
      title: "Quản lý",
      items: [
        {
          label: "Quản lý cơ sở",
          href: "/admin/classes",
          iconName: "School",
        },
        {
          label: "Danh sách học sinh",
          href: "/admin/students",
          iconName: "Users",
        },
        {
          label: "Giáo viên",
          href: "/admin/teachers",
          iconName: "UserCheck",
        },
        {
          label: "Tiêu chí chấm điểm",
          href: "/admin/competition/criteria",
          iconName: "ShieldCheck",
        },
        {
          label: "Lịch sử",
          href: "/admin/history",
          iconName: "History",
        },
      ],
    },
    {
      title: "Tài khoản",
      items: [
        {
          label: "Tôi",
          href: "/profile",
          iconName: "User",
        },
      ],
    },
  ],

  ADMIN: [
    {
      title: "Hệ thống",
      items: [
        {
          label: "Tổng quan",
          href: "/admin/dashboard",
          iconName: "LayoutDashboard",
        },
        {
          label: "Bảng xếp hạng",
          href: "/ranking",
          iconName: "Trophy",
        },
      ],
    },
    {
      title: "Quản lý",
      items: [
        {
          label: "Quản lý cơ sở",
          href: "/admin/classes",
          iconName: "School",
        },
        {
          label: "Danh sách học sinh",
          href: "/admin/students",
          iconName: "Users",
        },
        {
          label: "Giáo viên",
          href: "/admin/teachers",
          iconName: "UserCheck",
        },
        {
          label: "Lịch sử",
          href: "/admin/history",
          iconName: "History",
        },
      ],
    },
    {
      title: "Tài khoản",
      items: [
        {
          label: "Tôi",
          href: "/profile",
          iconName: "User",
        },
      ],
    },
  ],

  TEACHER: [
    {
      title: "Giảng dạy",
      items: [
        {
          label: "Tổng quan",
          href: "/teacher/dashboard",
          iconName: "LayoutDashboard",
        },
        {
          label: "Lớp học của tôi",
          href: "/teacher/my-class",
          iconName: "School",
        },
      ],
    },
    {
      title: "Trường học",
      items: [
        {
          label: "Quản lý cơ sở",
          href: "/teacher/classes",
          iconName: "Users",
        },
        {
          label: "Bảng xếp hạng",
          href: "/ranking",
          iconName: "Trophy",
        },
      ],
    },
    {
      title: "Tài khoản",
      items: [
        {
          label: "Tôi",
          href: "/profile",
          iconName: "User",
        },
      ],
    },
  ],

  STUDENT: [
    {
      title: "Học tập",
      items: [
        {
          label: "Tổng quan",
          href: "/student/dashboard",
          iconName: "LayoutDashboard",
        },
        {
          label: "Danh sách lớp",
          href: "/student/class",
          iconName: "Users",
        },
        {
          label: "Bảng xếp hạng",
          href: "/ranking",
          iconName: "Trophy",
        },
      ],
    },
    {
      title: "Tài khoản",
      items: [
        {
          label: "Tôi",
          href: "/profile",
          iconName: "User",
        },
      ],
    },
  ],
};

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  SUPER_ADMIN: "/admin/dashboard",
  ADMIN: "/admin/dashboard",
  TEACHER: "/teacher/dashboard",
  STUDENT: "/student/dashboard",
};
