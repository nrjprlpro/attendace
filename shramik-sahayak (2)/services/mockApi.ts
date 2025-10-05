import { User, UserRole, Member, AttendanceRecord, PaymentRecord, WageRecord, MemberWithTodayEntries, MemberWithWage, Group } from '../types';

export interface UserCredentials {
    email: string;
    password: string;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- MOCK DATABASE ---

const USERS: User[] = [
    { uid: 'admin1', name: 'Admin User', email: 'admin@example.com', role: 'admin', active: true, avatarUrl: 'https://picsum.photos/seed/admin1/200/200', imageHint: 'person portrait' },
    { uid: 'staff1', name: 'Staff User', email: 'staff@example.com', role: 'staff', active: true, avatarUrl: 'https://picsum.photos/seed/staff1/200/200', imageHint: 'person portrait' },
];

const GROUPS: Group[] = [
    { id: 'g1', name: 'Drivers' },
    { id: 'g2', name: 'Packing Team' },
];

const MEMBERS: Member[] = [
    { id: 'm1', name: 'Rajesh Kumar', avatarUrl: 'https://picsum.photos/seed/w1/200/200', imageHint: 'man portrait', groupId: 'g1' },
    { id: 'm2', name: 'Suresh Singh', avatarUrl: 'https://picsum.photos/seed/w2/200/200', imageHint: 'man portrait', groupId: 'g1' },
    { id: 'm3', name: 'Amit Patel', avatarUrl: 'https://picsum.photos/seed/w3/200/200', imageHint: 'man portrait', groupId: 'g2' },
    { id: 'm4', name: 'Vijay Sharma', avatarUrl: 'https://picsum.photos/seed/w4/200/200', imageHint: 'man portrait' },
];

const getIsoDate = (dayOffset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return date.toISOString().split('T')[0];
}

const ATTENDANCE: AttendanceRecord[] = [
    { id: `${getIsoDate()}-m1`, memberId: 'm1', date: new Date().toISOString(), status: 'full', recordedById: 'staff1' },
    { id: `${getIsoDate()}-m2`, memberId: 'm2', date: new Date().toISOString(), status: 'half', recordedById: 'staff1' },
    { id: `${getIsoDate()}-m3`, memberId: 'm3', date: new Date().toISOString(), status: 'absent', recordedById: 'staff1' },
    { id: `${getIsoDate(-1)}-m1`, memberId: 'm1', date: new Date(Date.now() - 86400000).toISOString(), status: 'full', recordedById: 'staff1' },
];

const PAYMENTS: PaymentRecord[] = [
    { id: 'p1', memberId: 'm1', date: new Date(Date.now() - 5 * 86400000).toISOString(), amount: 1000, recordedById: 'admin1' },
    { id: 'p2', memberId: 'm2', date: new Date(Date.now() - 3 * 86400000).toISOString(), amount: 1500, recordedById: 'staff1' },
];

const WAGES: WageRecord[] = [
    { id: 'wage-m1-1', memberId: 'm1', wage: 500, effectiveDate: '2023-01-01T00:00:00.000Z' },
    { id: 'wage-m2-1', memberId: 'm2', wage: 550, effectiveDate: '2023-01-01T00:00:00.000Z' },
    { id: 'wage-m3-1', memberId: 'm3', wage: 480, effectiveDate: '2023-01-01T00:00:00.000Z' },
];

const db = {
    users: USERS,
    members: MEMBERS,
    groups: GROUPS,
    attendance: ATTENDANCE,
    payments: PAYMENTS,
    wages: WAGES,
}

// --- API IMPLEMENTATION ---

export const api = {
    login: async ({ email, password }: UserCredentials): Promise<User> => {
        await delay(500);
        const user = db.users.find(u => u.email === email);
        if (user && password === 'password') {
            localStorage.setItem('shramik-sahayak-user', JSON.stringify(user));
            return user;
        }
        throw new Error('Invalid credentials');
    },

    logout: async (): Promise<void> => {
        await delay(200);
        localStorage.removeItem('shramik-sahayak-user');
    },

    checkSession: async (): Promise<User | null> => {
        await delay(100);
        const userJson = localStorage.getItem('shramik-sahayak-user');
        return userJson ? JSON.parse(userJson) : null;
    },

    // --- Member CRUD ---
    getMembers: async (): Promise<Member[]> => {
        await delay(300);
        return [...db.members];
    },
    
    getMemberById: async (id: string): Promise<Member> => {
        await delay(200);
        const member = db.members.find(w => w.id === id);
        if (!member) throw new Error("Member not found");
        return member;
    },

    createMember: async (name: string): Promise<Member> => {
        await delay(500);
        const newId = `m${Date.now()}`;
        const newMember: Member = { id: newId, name, avatarUrl: `https://picsum.photos/seed/${newId}/200/200`, imageHint: 'person portrait' };
        db.members.push(newMember);
        return newMember;
    },

    updateMember: async (memberId: string, data: Partial<Member>): Promise<Member> => {
        await delay(500);
        const memberIndex = db.members.findIndex(w => w.id === memberId);
        if (memberIndex === -1) throw new Error("Member not found");
        db.members[memberIndex] = { ...db.members[memberIndex], ...data };
        return db.members[memberIndex];
    },

    // --- Group CRUD ---
    getGroups: async (): Promise<Group[]> => {
        await delay(200);
        return [...db.groups];
    },

    createGroup: async (name: string): Promise<Group> => {
        await delay(400);
        const newGroup = { id: `g${Date.now()}`, name };
        db.groups.push(newGroup);
        return newGroup;
    },

    updateGroup: async (groupId: string, data: Partial<Group>): Promise<Group> => {
        await delay(400);
        const groupIndex = db.groups.findIndex(g => g.id === groupId);
        if (groupIndex === -1) throw new Error("Group not found");
        db.groups[groupIndex] = { ...db.groups[groupIndex], ...data };
        return db.groups[groupIndex];
    },

    deleteGroup: async (groupId: string): Promise<void> => {
        await delay(400);
        db.groups = db.groups.filter(g => g.id !== groupId);
        // Unassign members from this group
        db.members.forEach(m => {
            if (m.groupId === groupId) {
                m.groupId = undefined;
            }
        });
    },

    // --- Data Fetching ---
    getMembersWithTodayEntries: async (): Promise<MemberWithTodayEntries[]> => {
        await delay(400);
        const todayStr = new Date().toISOString().split('T')[0];
        return db.members.map(member => {
            const attendance = db.attendance.find(a => a.memberId === member.id && a.date.startsWith(todayStr));
            const todayPayments = db.payments.filter(p => p.memberId === member.id && p.date.startsWith(todayStr));
            const totalPaidToday = todayPayments.reduce((sum, p) => sum + p.amount, 0);
            return { ...member, attendance, todayPayment: totalPaidToday };
        });
    },

    getMembersWithCurrentWage: async (): Promise<MemberWithWage[]> => {
        await delay(400);
        return db.members.map(member => {
            const memberWages = db.wages
                .filter(w => w.memberId === member.id)
                .sort((a,b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
            const currentWage = memberWages.length > 0 ? memberWages[0].wage : 0;
            return { ...member, currentWage };
        });
    },
    
    getAttendanceForMember: async (memberId: string, year: number, month: number): Promise<AttendanceRecord[]> => {
        await delay(250);
        return db.attendance.filter(a => {
            const date = new Date(a.date);
            return a.memberId === memberId && date.getFullYear() === year && date.getMonth() + 1 === month;
        });
    },

    getPaymentsForMember: async (memberId: string, year: number, month: number): Promise<PaymentRecord[]> => {
        await delay(250);
        return db.payments.filter(p => {
            const date = new Date(p.date);
            return p.memberId === memberId && date.getFullYear() === year && date.getMonth() + 1 === month;
        });
    },
    
    getWagesForMember: async (memberId: string): Promise<WageRecord[]> => {
        await delay(150);
        return db.wages.filter(w => w.memberId === memberId).sort((a,b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
    },
    
    // --- Data Entry ---
    setAttendance: async (record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
        await delay(400);
        const dateStr = record.date.split('T')[0];
        const newRecord: AttendanceRecord = { ...record, id: `${dateStr}-${record.memberId}` };
        
        const existingIndex = db.attendance.findIndex(a => a.id === newRecord.id);
        if(existingIndex > -1) {
            db.attendance[existingIndex] = newRecord;
        } else {
            db.attendance.push(newRecord);
        }
        return newRecord;
    },
    
    logPayment: async (record: Omit<PaymentRecord, 'id'>): Promise<PaymentRecord> => {
        await delay(400);
        const newRecord: PaymentRecord = { ...record, id: `p${Date.now()}` };
        db.payments.push(newRecord);
        return newRecord;
    },

    setWage: async (record: Omit<WageRecord, 'id'>): Promise<WageRecord> => {
        await delay(400);
        const dateStr = record.effectiveDate.split('T')[0];
        const newRecord: WageRecord = { ...record, id: `wage-${record.memberId}-${dateStr}` };

        const existingIndex = db.wages.findIndex(w => w.memberId === record.memberId && w.effectiveDate.startsWith(dateStr));
        if (existingIndex > -1) {
            db.wages[existingIndex] = newRecord;
        } else {
            db.wages.push(newRecord);
        }
        return newRecord;
    },
};