export type UserRole = 'admin' | 'staff';

export interface User {
    uid: string;
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
    avatarUrl?: string;
    imageHint?: string;
}

export interface Group {
    id: string;
    name: string;
}

export interface Member {
    id: string;
    name:string;
    avatarUrl: string;
    imageHint: string;
    groupId?: string;
}

export type AttendanceStatus = 'full' | 'half' | 'one_and_a_half' | 'absent';

export interface AttendanceRecord {
    id: string; // YYYY-MM-DD-memberId
    memberId: string;
    date: string; // ISO string
    status: AttendanceStatus;
    recordedById: string;
}

export interface PaymentRecord {
    id: string;
    memberId: string;
    date: string; // ISO string
    amount: number;
    recordedById: string;
}

export interface WageRecord {
    id: string; // YYYY-MM-DD of effective date
    memberId: string;
    wage: number;
    effectiveDate: string; // ISO string
}

export interface MemberWithTodayEntries extends Member {
    attendance?: AttendanceRecord;
    todayPayment: number;
}

export interface MemberMonthlySummary {
    member: Member;
    totalDays: number;
    totalEarned: number;
    totalPaid: number;
    balance: number;
}

export interface MemberWithWage extends Member {
    currentWage: number;
}