import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/mockApi';
import { Member, AttendanceRecord, PaymentRecord, WageRecord, MemberMonthlySummary as TMemberMonthlySummary } from '../../types';
import { getMemberMonthlySummary } from '../../services/dataProcessing';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';

const MonthlySummaryCard: React.FC<{ summary: TMemberMonthlySummary }> = ({ summary }) => (
    <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
            <img src={summary.member.avatarUrl} alt={summary.member.name} className="h-12 w-12 rounded-full" data-ai-hint={summary.member.imageHint} />
            <div>
                <CardTitle>{summary.member.name}</CardTitle>
                <p className="text-sm text-gray-500">{summary.totalDays} days worked</p>
            </div>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
             <div className="flex justify-between"><span>Total Earned:</span> <span className="font-semibold">₹{summary.totalEarned.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Total Paid:</span> <span className="font-semibold">₹{summary.totalPaid.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Balance:</span> <span>₹{summary.balance.toFixed(2)}</span></div>
        </CardContent>
    </Card>
);


const MonthlySummary: React.FC = () => {
    const [summaries, setSummaries] = useState<TMemberMonthlySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;
            
            const members = await api.getMembers();
            const allData = await Promise.all(
                members.map(async (member) => {
                    const [attendance, payments, wages] = await Promise.all([
                        api.getAttendanceForMember(member.id, year, month),
                        api.getPaymentsForMember(member.id, year, month),
                        api.getWagesForMember(member.id),
                    ]);
                    return { member, attendance, payments, wages };
                })
            );

            const calculatedSummaries = allData.map(data => 
                getMemberMonthlySummary(data.member, data.attendance, data.payments, data.wages)
            );
            
            setSummaries(calculatedSummaries);
            setLoading(false);
        };

        fetchAllData();
    }, [currentDate]);

    const changeMonth = (delta: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + delta);
            return newDate;
        });
    };
    
    const totals = useMemo(() => {
        return summaries.reduce((acc, s) => {
            acc.earned += s.totalEarned;
            acc.paid += s.totalPaid;
            acc.balance += s.balance;
            return acc;
        }, { earned: 0, paid: 0, balance: 0 });
    }, [summaries]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold font-display">Monthly Summary</h2>
                 <div className="flex items-center space-x-4">
                     <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}><ChevronLeftIcon /></Button>
                     <span className="text-lg font-semibold w-40 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                     <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}><ChevronRightIcon /></Button>
                 </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-green-50"><CardHeader><CardTitle>Total Earned</CardTitle></CardHeader><CardContent className="text-3xl font-bold">₹{totals.earned.toFixed(2)}</CardContent></Card>
                <Card className="bg-yellow-50"><CardHeader><CardTitle>Total Paid</CardTitle></CardHeader><CardContent className="text-3xl font-bold">₹{totals.paid.toFixed(2)}</CardContent></Card>
                <Card className="bg-red-50"><CardHeader><CardTitle>Total Balance Due</CardTitle></CardHeader><CardContent className="text-3xl font-bold">₹{totals.balance.toFixed(2)}</CardContent></Card>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-48 w-full"/>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {summaries.map(summary => (
                        <MonthlySummaryCard key={summary.member.id} summary={summary} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MonthlySummary;