// EduRank — Type Definitions (MongoDB & Mongoose compatible)

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEACHER"
  | "STUDENT";

export interface IUser {
  _id: string;
  accountCode: string;
  fullName: string;
  passwordHash?: string;
  roles: UserRole[];
  teacherId?: string;
  studentId?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: Date | string;
  lastLogoutAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface HeaderUser {
  fullName: string;
  avatarUrl?: string;
  roles: UserRole[];
  accountCode: string;
}

export type TeacherStatus = "ACTIVE" | "INACTIVE" | "RETIRED";

export interface ITeacher {
  _id: string;
  teacherCode: string;
  fullName: string;
  dateOfBirth?: Date | string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  phone?: string;
  email?: string;
  department?: string;
  assignedClassId?: string; // Lớp phụ trách / chủ nhiệm
  assignedClassName?: string;
  status: TeacherStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type StudentStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "TRANSFERRED"
  | "GRADUATED";

export interface IStudent {
  _id: string;
  studentCode: string;
  fullName: string;
  dateOfBirth: Date | string;
  gender: "MALE" | "FEMALE" | "OTHER";
  classId: string;
  parentName?: string;
  parentPhone?: string;
  status: StudentStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IClass {
  _id: string;
  classCode: string;
  className: string;
  grade: 6 | 7 | 8 | 9;
  schoolYearId: string;
  homeroomTeacherId?: string;
  studentCount?: number;
  room?: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ISchoolYear {
  _id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  isCurrent: boolean;
  status: "UPCOMING" | "ACTIVE" | "ENDED";
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type TeacherClassRole =
  | "HOMEROOM_TEACHER"
  | "SUBJECT_TEACHER"
  | "SUPERVISOR";

export interface ITeacherClass {
  _id: string;
  teacherId: string;
  classId: string;
  role: TeacherClassRole;
  createdAt: Date | string;
}

export type CompetitionTarget = "CLASS" | "STUDENT";

export interface ICompetitionCriteria {
  _id: string;
  name: string;
  description?: string;
  targetType: CompetitionTarget;
  points: number;
  category?: string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type CompetitionRecordStatus = "ACTIVE" | "CANCELLED";

export interface IStudentCompetitionRecord {
  _id: string;
  studentId: string;
  classId: string;
  criteriaId: string;
  points: number;
  note?: string;
  createdBy: string;
  createdAt: Date | string;
  status: CompetitionRecordStatus;
  cancelledAt?: Date | string;
  cancelledBy?: string;
}

export interface IClassCompetitionRecord {
  _id: string;
  classId: string;
  criteriaId: string;
  points: number;
  note?: string;
  createdBy: string;
  createdAt: Date | string;
  status: CompetitionRecordStatus;
  cancelledAt?: Date | string;
  cancelledBy?: string;
}

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "CANCEL"
  | "LOGIN"
  | "LOGOUT"
  | "ASSIGN"
  | "DEACTIVATE";

export type AuditTargetType =
  | "USER"
  | "TEACHER"
  | "STUDENT"
  | "CLASS"
  | "COMPETITION_RECORD"
  | "CRITERIA";

export interface IAuditLog {
  _id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  targetName: string;
  description: string;
  pointChange?: number;
  status: "SUCCESS" | "CANCELLED" | "PENDING";
  createdAt: Date | string;
}

// UI & Computation Types
export interface ScoreSummary {
  baseScore: number;
  positivePoints: number;
  negativePoints: number;
  totalScore: number;
  rank?: number;
}

export interface ClassRankingItem {
  rank: number;
  classId: string;
  className: string;
  grade: number;
  score: number;
  positivePoints: number;
  negativePoints: number;
  studentCount?: number;
  homeroomTeacherName?: string;
}

export interface StudentRankingItem {
  rank: number;
  studentId: string;
  studentCode: string;
  fullName: string;
  classId: string;
  className: string;
  score: number;
  positivePoints: number;
  negativePoints: number;
}

export interface CompetitionStatistics {
  totalClasses: number;
  totalStudents: number;
  totalPositivePoints: number;
  totalNegativePoints: number;
  totalCompetitionRecords: number;
}

export interface CompetitionFilter {
  schoolYearId?: string;
  week?: number;
  grade?: number;
  classId?: string;
  startDate?: string;
  endDate?: string;
}

export interface TeacherClassSummary {
  classId: string;
  className: string;
  grade: number;
  studentCount: number;
  role: TeacherClassRole;
  competitionScore: number;
}

export interface TeacherStatistics {
  totalAssignedClasses: number;
  totalStudents: number;
  homeroomClassName?: string;
  homeroomScore?: number;
  homeroomRank?: number;
}

export interface CompetitionRecordSummary {
  _id: string;
  targetType: CompetitionTarget;
  targetName: string; // e.g. "Lớp 9A1" or "Nguyễn Văn An (6A1)"
  criteriaName: string;
  points: number;
  note?: string;
  createdBy: string;
  createdAt: string;
  status: CompetitionRecordStatus;
}

export interface StudentDashboardData {
  student: IStudent;
  class: IClass;
  score: ScoreSummary;
  recentRecords: CompetitionRecordSummary[];
  ranking: StudentRankingItem[];
}

export interface TeacherDashboardData {
  teacher: ITeacher;
  classes: TeacherClassSummary[];
  statistics: TeacherStatistics;
  recentCompetitionRecords: CompetitionRecordSummary[];
}

export interface AdminDashboardData {
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  activeSchoolYear: ISchoolYear;
  competitionStatistics: CompetitionStatistics;
  classRanking: ClassRankingItem[];
  studentRanking: StudentRankingItem[];
}

export interface StudentTableItem {
  _id: string;
  studentCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  classId: string;
  className: string;
  grade: number;
  score: number;
  positivePoints: number;
  negativePoints: number;
  status: StudentStatus;
}

export type StudentSortField =
  | "fullName"
  | "studentCode"
  | "score"
  | "dateOfBirth";

export type SortOrder = "asc" | "desc";

export interface SortState {
  field: StudentSortField;
  order: SortOrder;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CompetitionRecordFormData {
  targetType: "CLASS" | "STUDENT";
  classId: string;
  studentId?: string;
  criteriaId: string;
  points: number;
  note?: string;
}

export interface CriteriaOption {
  _id: string;
  name: string;
  targetType: CompetitionTarget;
  points: number;
  category?: string;
}

export interface RankingFilter {
  schoolYearId: string;
  week?: number;
  grade?: number;
  classId?: string;
  rankingType: "CLASS" | "STUDENT";
}

export type AsyncStatus = "idle" | "loading" | "success" | "error";
