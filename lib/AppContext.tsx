"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import {
  UserRole,
  HeaderUser,
  IClass,
  IStudent,
  ITeacher,
  ICompetitionCriteria,
  IClassCompetitionRecord,
  IStudentCompetitionRecord,
  ClassRankingItem,
  StudentRankingItem,
  CompetitionRecordSummary,
  CompetitionStatistics,
  CompetitionFilter,
  CompetitionRecordFormData,
  IAuditLog,
} from "@/types";
import { ROLE_DEFAULT_ROUTES } from "@/config/navigation";
import { ToastItem, ToastType } from "@/components/ui/Toast";

import {
  loginApi,
  getMeApi,
  logoutApi,
  getClassesApi,
  getTeachersApi,
  getStudentsApi,
  getCriteriaApi,
  recordCompetitionScoreApi,
  cancelCompetitionRecordApi,
  getClassRankingsApi,
  getStudentRankingsApi,
  getRecentCompetitionRecordsApi,
  getAuditLogsApi,
  createClassApi,
  updateClassApi,
  createTeacherApi,
  updateTeacherApi,
  deleteTeacherApi,
  createStudentApi,
  updateStudentApi,
  deleteStudentApi,
  createCriteriaApi,
  getCompetitionRecordsApi,
} from "@/lib/api";

interface AppContextType {
  // Role & User
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  currentUser: HeaderUser;
  setCurrentUser: React.Dispatch<React.SetStateAction<HeaderUser>>;
  loginUser: (accountCode: string, password: string, role?: UserRole) => Promise<boolean>;
  logoutUser: () => Promise<void>;

  // Data sets (real from MongoDB)
  classes: IClass[];
  teachers: ITeacher[];
  students: IStudent[];
  criteria: ICompetitionCriteria[];
  classRecords: IClassCompetitionRecord[];
  studentRecords: IStudentCompetitionRecord[];
  auditLogs: IAuditLog[];

  // Computed Leaderboards
  classRankings: ClassRankingItem[];
  studentRankings: StudentRankingItem[];
  recentActivities: CompetitionRecordSummary[];
  statistics: CompetitionStatistics;

  // Filter state
  filter: CompetitionFilter;
  setFilter: React.Dispatch<React.SetStateAction<CompetitionFilter>>;

  // Actions
  refreshData: () => Promise<void>;
  addCompetitionRecord: (data: CompetitionRecordFormData, actorName?: string) => Promise<void>;
  cancelRecord: (id: string, targetType: "CLASS" | "STUDENT") => Promise<void>;

  // Class Management Actions
  addClass: (data: {
    className: string;
    grade: number;
    room?: string;
    homeroomTeacherId?: string;
    studentCount?: number;
  }) => Promise<void>;

  // Homeroom & Teacher Management Actions
  updateHomeroomTeacher: (classId: string, teacherId: string) => Promise<void>;
  addTeacher: (data: Partial<ITeacher> & { password?: string }) => Promise<void>;
  updateTeacher: (teacher: ITeacher) => Promise<void>;
  deactivateTeacher: (teacherId: string) => Promise<void>;
  deleteTeacher: (teacherId: string) => Promise<void>;

  // Criteria Management Actions
  addCriteria: (data: Partial<ICompetitionCriteria>) => Promise<void>;
  updateCriteria: (data: ICompetitionCriteria) => Promise<void>;
  deleteCriteria: (criteriaId: string) => Promise<void>;

  // Student Management Actions
  addStudent: (data: Partial<IStudent> & { password?: string }) => Promise<{ success: boolean; message?: string }>;
  updateStudent: (data: IStudent) => Promise<void>;
  deactivateStudent: (studentId: string) => Promise<void>;
  reorderStudents: (classId: string, orderedStudentIds: string[]) => void;

  // Toast notifications state
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  notification: string | null;
  clearNotification: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Active Role and Current User
  const [activeRole, setActiveRole] = useState<UserRole>("SUPER_ADMIN");
  const [currentUser, setCurrentUser] = useState<HeaderUser>({
    fullName: "Ban Giám Hiệu - Quản trị hệ thống",
    accountCode: "ADMIN",
    roles: ["SUPER_ADMIN", "ADMIN"],
    avatarUrl: undefined,
  });

  // State populated from MongoDB
  const [classes, setClasses] = useState<IClass[]>([]);
  const [teachers, setTeachers] = useState<ITeacher[]>([]);
  const [students, setStudents] = useState<IStudent[]>([]);
  const [criteria, setCriteria] = useState<ICompetitionCriteria[]>([]);
  const [classRecords, setClassRecords] = useState<IClassCompetitionRecord[]>([]);
  const [studentRecords, setStudentRecords] = useState<IStudentCompetitionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [classRankings, setClassRankings] = useState<ClassRankingItem[]>([]);
  const [studentRankings, setStudentRankings] = useState<StudentRankingItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<CompetitionRecordSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter state
  const [filter, setFilter] = useState<CompetitionFilter>({
    schoolYearId: "sy_2026_2027",
    week: 6,
    grade: undefined,
    classId: undefined,
    startDate: "01/10/2026",
    endDate: "07/10/2026",
  });

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const clearNotification = () => setNotification(null);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", duration = 4000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      setNotification(message);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all data from APIs
  const refreshData = useCallback(async () => {
    try {
      const [
        classesRes,
        teachersRes,
        studentsRes,
        criteriaRes,
        classRankRes,
        studentRankRes,
        recentRes,
        auditRes,
        compRecordsRes,
      ] = await Promise.all([
        getClassesApi(),
        getTeachersApi(),
        getStudentsApi({ limit: 100 }),
        getCriteriaApi({ activeOnly: false }),
        getClassRankingsApi(),
        getStudentRankingsApi({ limit: 100 }),
        getRecentCompetitionRecordsApi(20),
        getAuditLogsApi({ limit: 50 }),
        getCompetitionRecordsApi(),
      ]);

      if (classesRes.success && classesRes.data) {
        setClasses(classesRes.data);
      }
      if (teachersRes.success && teachersRes.data) {
        setTeachers(teachersRes.data);
      }
      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data as any);
      }
      if (criteriaRes.success && criteriaRes.data) {
        setCriteria(criteriaRes.data);
      }
      if (classRankRes.success && classRankRes.data) {
        setClassRankings(classRankRes.data);
      }
      if (studentRankRes.success && studentRankRes.data) {
        setStudentRankings(studentRankRes.data);
      }
      if (recentRes.success && recentRes.data) {
        setRecentActivities(recentRes.data);
      }
      if (auditRes.success && auditRes.data) {
        setAuditLogs(auditRes.data);
      }
      if (compRecordsRes.success && compRecordsRes.data) {
        setClassRecords(compRecordsRes.data.classRecords || []);
        setStudentRecords(compRecordsRes.data.studentRecords || []);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  }, []);

  // Check auth and initial load
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      try {
        const meRes = await getMeApi();
        if (meRes.success && meRes.user) {
          const u = meRes.user;
          setCurrentUser({
            fullName: u.fullName,
            accountCode: u.accountCode,
            roles: u.roles,
            avatarUrl: u.avatarUrl,
          });
          if (u.roles && u.roles.length > 0) {
            setActiveRole(u.roles[0]);
          }
        }
      } catch (e) {
        // Not logged in or guest
      } finally {
        await refreshData();
        setIsLoading(false);
      }
    }
    init();
  }, [refreshData]);

  // Login handler
  const loginUser = async (accountCode: string, password: string, role?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    const res = await loginApi({ accountCode, password, role });
    setIsLoading(false);

    if (res.success && res.user) {
      const u = res.user;
      const chosenRole = role || (u.roles && u.roles[0]) || "STUDENT";
      setCurrentUser({
        fullName: u.fullName,
        accountCode: u.accountCode,
        roles: u.roles,
        avatarUrl: u.avatarUrl,
      });
      setActiveRole(chosenRole);
      showToast(`Đăng nhập thành công! Chào mừng ${u.fullName} 👋`, "success");
      await refreshData();
      const targetRoute =
        (ROLE_DEFAULT_ROUTES as Record<string, string>)[chosenRole] || "/admin/dashboard";
      router.push(targetRoute);
      return true;
    } else {
      showToast(res.message || "Đăng nhập thất bại. Vui lòng thử lại.", "error");
      return false;
    }
  };

  // Logout handler
  const logoutUser = async () => {
    await logoutApi();
    showToast("Đã đăng xuất khỏi tài khoản.", "info");
    router.push("/login");
  };

  // Role switching
  const switchRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    const targetRoute = ROLE_DEFAULT_ROUTES[newRole] || "/admin/dashboard";
    router.push(targetRoute);
    showToast(`Đã chuyển đổi sang giao diện vai trò: ${newRole}`, "info");
  };

  // Filtered Class Rankings
  const filteredClassRankings = useMemo(() => {
    let list = classRankings;
    if (filter.grade) {
      list = list.filter((c) => c.grade === Number(filter.grade));
    }
    if (filter.classId) {
      list = list.filter((c) => c.classId === filter.classId);
    }
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [classRankings, filter.grade, filter.classId]);

  // Filtered Student Rankings
  const filteredStudentRankings = useMemo(() => {
    let list = studentRankings;
    if (filter.classId) {
      list = list.filter((s) => s.classId === filter.classId);
    }
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [studentRankings, filter.classId]);

  // Statistics
  const statistics = useMemo<CompetitionStatistics>(() => {
    let pos = 0;
    let neg = 0;
    classRecords.forEach((r) => {
      if (r.status === "ACTIVE") {
        if (r.points > 0) pos += r.points;
        else neg += Math.abs(r.points);
      }
    });
    studentRecords.forEach((r) => {
      if (r.status === "ACTIVE") {
        if (r.points > 0) pos += r.points;
        else neg += Math.abs(r.points);
      }
    });

    const totalStudents = students.length > 0
      ? students.length
      : classes.reduce((sum, c) => sum + (c.studentCount || 0), 0);

    return {
      totalClasses: classes.length,
      totalStudents,
      totalPositivePoints: pos,
      totalNegativePoints: neg,
      totalCompetitionRecords: classRecords.length + studentRecords.length,
    };
  }, [classes, students, classRecords, studentRecords]);

  // Action: Add Record
  const addCompetitionRecord = async (
    data: CompetitionRecordFormData,
    actorName = currentUser.fullName
  ) => {
    const res = await recordCompetitionScoreApi(data);
    if (res.success) {
      showToast(res.message || "Ghi nhận điểm thi đua thành công!", "success");
      await refreshData();
    } else {
      showToast(res.message || "Không thể ghi nhận điểm thi đua.", "error");
    }
  };

  // Action: Cancel Record
  const cancelRecord = async (id: string, targetType: "CLASS" | "STUDENT") => {
    const res = await cancelCompetitionRecordApi(id);
    if (res.success) {
      showToast("Đã hủy bản ghi thi đua thành công!", "info");
      await refreshData();
    } else {
      showToast(res.message || "Không thể hủy bản ghi.", "error");
    }
  };

  // Action: Add Class
  const addClass = async (data: {
    className: string;
    grade: number;
    room?: string;
    homeroomTeacherId?: string;
    studentCount?: number;
  }) => {
    const res = await createClassApi({
      classCode: data.className.trim().toUpperCase(),
      className: data.className.trim(),
      grade: data.grade as any,
      schoolYearId: "2026-2027",
      homeroomTeacherId: data.homeroomTeacherId,
      room: data.room,
      studentCount: data.studentCount || 35,
    } as any);

    if (res.success) {
      showToast(`Đã thêm lớp ${data.className} thành công!`, "success");
      await refreshData();
    } else {
      showToast(res.message || "Không thể tạo lớp học.", "error");
    }
  };

  // Action: Update Homeroom Teacher
  const updateHomeroomTeacher = async (classId: string, teacherId: string) => {
    const res = await updateClassApi(classId, { homeroomTeacherId: teacherId });
    if (res.success) {
      showToast("Đã cập nhật giáo viên chủ nhiệm thành công!", "success");
      await refreshData();
    } else {
      showToast(res.message || "Lỗi khi phân công giáo viên.", "error");
    }
  };

  // Teacher CRUD
  const addTeacher = async (data: Partial<ITeacher> & { password?: string }) => {
    const code = `GV${String(teachers.length + 1).padStart(3, "0")}`;
    const res = await createTeacherApi({
      teacherCode: data.teacherCode || code,
      fullName: data.fullName,
      gender: data.gender || "FEMALE",
      phone: data.phone,
      email: data.email,
      department: data.department,
      assignedClassId: data.assignedClassId,
    });

    if (res.success) {
      showToast(`Đã thêm mới giáo viên ${data.fullName} thành công!`, "success");
      await refreshData();
    } else {
      showToast(res.message || "Không thể tạo giáo viên.", "error");
    }
  };

  const updateTeacher = async (teacher: ITeacher) => {
    const res = await updateTeacherApi(teacher._id, teacher);
    if (res.success) {
      showToast(`Đã cập nhật thông tin giáo viên ${teacher.fullName}`, "success");
      await refreshData();
    } else {
      showToast(res.message || "Không thể cập nhật giáo viên.", "error");
    }
  };

  const deactivateTeacher = async (teacherId: string) => {
    const res = await deleteTeacherApi(teacherId);
    if (res.success) {
      showToast(res.message || "Đã cập nhật trạng thái giáo viên.", "info");
      await refreshData();
    } else {
      showToast(res.message || "Không thể thay đổi trạng thái giáo viên.", "error");
    }
  };

  const deleteTeacher = async (teacherId: string) => {
    const res = await deleteTeacherApi(teacherId);
    if (res.success) {
      showToast("Đã xóa hồ sơ giáo viên thành công!", "success");
      await refreshData();
    } else {
      showToast(res.message || "Không thể xóa giáo viên.", "error");
    }
  };

  // Criteria Management
  const addCriteria = async (data: Partial<ICompetitionCriteria>) => {
    const res = await createCriteriaApi(data);
    if (res.success) {
      showToast(`Đã tạo tiêu chí thi đua: ${data.name}`, "success");
      await refreshData();
    } else {
      showToast(res.message || "Không thể tạo tiêu chí.", "error");
    }
  };

  const updateCriteria = async (data: ICompetitionCriteria) => {
    // update criteria locally/api
    setCriteria((prev) =>
      prev.map((c) => (c._id === data._id ? { ...data } : c))
    );
    showToast(`Đã cập nhật tiêu chí thi đua: ${data.name}`, "success");
  };

  const deleteCriteria = async (criteriaId: string) => {
    setCriteria((prev) =>
      prev.map((cr) => (cr._id === criteriaId ? { ...cr, isActive: false } : cr))
    );
    showToast("Đã ngừng áp dụng tiêu chí thi đua.", "info");
  };

  // Student CRUD
  const addStudent = async (
    data: Partial<IStudent> & { password?: string }
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await createStudentApi({
      studentCode: data.studentCode?.trim() || undefined,
      fullName: data.fullName?.trim(),
      dateOfBirth: data.dateOfBirth || "2013-01-01",
      gender: data.gender || "MALE",
      classId: data.classId || (classes[0] && classes[0]._id),
      parentName: data.parentName?.trim() || undefined,
      parentPhone: data.parentPhone?.trim() || undefined,
      password: data.password || "123456",
    });

    if (res.success) {
      showToast(res.message || `Đã thêm học sinh: ${data.fullName}`, "success");
      await refreshData();
      return { success: true };
    } else {
      showToast(res.message || "Không thể tạo học sinh.", "error");
      return { success: false, message: res.message };
    }
  };

  const updateStudent = async (data: IStudent) => {
    const res = await updateStudentApi(data._id, data);
    if (res.success) {
      showToast(`Đã cập nhật học sinh: ${data.fullName}`, "success");
      await refreshData();
    } else {
      showToast(res.message || "Không thể cập nhật học sinh.", "error");
    }
  };

  const deactivateStudent = async (studentId: string) => {
    const res = await deleteStudentApi(studentId);
    if (res.success) {
      showToast("Đã cập nhật trạng thái học sinh.", "info");
      await refreshData();
    } else {
      showToast(res.message || "Không thể cập nhật học sinh.", "error");
    }
  };

  const reorderStudents = (classId: string, orderedStudentIds: string[]) => {
    setStudents((prev) => {
      const classMap = new Map<string, IStudent>();
      const otherStudents: IStudent[] = [];

      prev.forEach((s) => {
        if (s.classId === classId) {
          classMap.set(s._id, s);
        } else {
          otherStudents.push(s);
        }
      });

      const reorderedList: IStudent[] = [];
      orderedStudentIds.forEach((id) => {
        const item = classMap.get(id);
        if (item) {
          reorderedList.push(item);
          classMap.delete(id);
        }
      });
      classMap.forEach((item) => reorderedList.push(item));

      return [...reorderedList, ...otherStudents];
    });

    showToast("Đã lưu thứ tự học sinh theo sổ điểm!", "success");
  };

  return (
    <AppContext.Provider
      value={{
        activeRole,
        switchRole,
        currentUser,
        setCurrentUser,
        loginUser,
        logoutUser,
        classes,
        teachers,
        students,
        criteria,
        classRecords,
        studentRecords,
        auditLogs,
        classRankings: filteredClassRankings,
        studentRankings: filteredStudentRankings,
        recentActivities,
        statistics,
        filter,
        setFilter,
        refreshData,
        addCompetitionRecord,
        cancelRecord,
        addClass,
        updateHomeroomTeacher,
        addTeacher,
        updateTeacher,
        deactivateTeacher,
        deleteTeacher,
        addCriteria,
        updateCriteria,
        deleteCriteria,
        addStudent,
        updateStudent,
        deactivateStudent,
        reorderStudents,
        toasts,
        showToast,
        removeToast,
        notification,
        clearNotification,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
