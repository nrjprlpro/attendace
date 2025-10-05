import { AttendanceRecord, PaymentRecord, WageRecord, Member, MemberMonthlySummary } from "../types";
import { ATTENDANCE_OPTIONS } from "../constants";

export function getMemberMonthlySummary(
    member: Member,
    attendance: AttendanceRecord[],
    payments: PaymentRecord[],
    wages: WageRecord[]
): MemberMonthlySummary {
    let totalDays = 0;
    let totalEarned = 0;

    const sortedWages = [...wages].sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());

    const getWageForDate = (date: Date): number => {
        const wageRecord = sortedWages.find(w => new Date(w.effectiveDate) <= date);
        return wageRecord ? wageRecord.wage : 0;
    };

    attendance.forEach(record => {
        const statusInfo = ATTENDANCE_OPTIONS.find(o => o.value === record.status);
        if (statusInfo) {
            totalDays += statusInfo.multiplier;
            const dailyWage = getWageForDate(new Date(record.date));
            totalEarned += statusInfo.multiplier * dailyWage;
        }
    });

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalEarned - totalPaid;

    return {
        member,
        totalDays,
        totalEarned,
        totalPaid,
        balance
    };
}