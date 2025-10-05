import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/mockApi';
import { Member, AttendanceRecord, PaymentRecord, WageRecord } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getMemberMonthlySummary } from '../../services/dataProcessing';
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/icons';
import AttendanceBadge from '../../components/AttendanceBadge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const MemberDetail: React.FC = () => {
    const { memberId } = useParams<{ memberId: string }>();
    const [member, setMember] = useState<Member | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [payments, setPayments] = useState<PaymentRecord[]>([]);
    const [wages, setWages] = useState<WageRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const [newWage, setNewWage] = useState('');
    const [effectiveDate, setEffectiveDate] = useState('');

    const fetchData = useCallback(async () => {
        if (!memberId) return;
        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        const [memberData, attendanceData, paymentsData, wagesData] = await Promise.all([
            api.getMemberById(memberId),
            api.getAttendanceForMember(memberId, year, month),
            api.getPaymentsForMember(memberId, year, month),
            api.getWagesForMember(memberId),
        ]);
        setMember(memberData);
        setAttendance(attendanceData);
        setPayments(paymentsData);
        setWages(wagesData);
        setLoading(false);
    }, [memberId, currentDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const summary = useMemo(() => {
        if (!member) return null;
        return getMemberMonthlySummary(member, attendance, payments, wages);
    }, [member, attendance, payments, wages]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const changeMonth = (delta: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + delta);
            return newDate;
        });
    };

    const handleSetWage = async () => {
        if (!memberId || !newWage || !effectiveDate) {
            alert("Please provide both a new wage and an effective date.");
            return;
        }
        await api.setWage({
            memberId,
            wage: parseFloat(newWage),
            effectiveDate: new Date(effectiveDate).toISOString(),
        });
        setNewWage('');
        setEffectiveDate('');
        // Refetch wage data specifically
        const wagesData = await api.getWagesForMember(memberId);
        setWages(wagesData);
        alert("Wage updated successfully!");
    };


    if (loading || !member) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    }

    const currentWage = wages.length > 0 ? wages[0].wage : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <img src={member.avatarUrl} alt={member.name} className="h-20 w-20 rounded-full object-cover" data-ai-hint={member.imageHint}/>
                <div>
                    <h2 className="text-3xl font-bold font-display">{member.name}</h2>
                    <p className="text-gray-500">Member Profile</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader><CardTitle>Payment Summary ({currentDate.toLocaleString('default', { month: 'long' })})</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {summary ? (
                            <>
                                <div className="flex justify-between"><span>Total Earned:</span> <span className="font-semibold">₹{summary.totalEarned.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>Total Paid:</span> <span className="font-semibold">₹{summary.totalPaid.toFixed(2)}</span></div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Balance:</span> <span>₹{summary.balance.toFixed(2)}</span></div>
                            </>
                        ) : <Skeleton className="h-20 w-full"/>}
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Payment History</CardTitle></CardHeader>
                    <CardContent>
                       <ul className="divide-y divide-gray-200">
                           {payments.length > 0 ? payments.map(p => (
                               <li key={p.id} className="py-2 flex justify-between">
                                   <span>{new Date(p.date).toLocaleDateString()}</span>
                                   <span className="font-medium">₹{p.amount}</span>
                               </li>
                           )) : <p className="text-gray-500 text-sm">No payments this month.</p>}
                       </ul>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <CardTitle>Attendance ({currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })})</CardTitle>
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}><ChevronLeftIcon/></Button>
                        <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}><ChevronRightIcon/></Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 mb-2">
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
                        {Array.from({ length: daysInMonth }).map((_, day) => {
                            const date = day + 1;
                            const record = attendance.find(a => new Date(a.date).getDate() === date);
                            return (
                                <div key={date} className="h-16 border rounded-md p-1 flex flex-col justify-between items-center">
                                    <span className="font-semibold">{date}</span>
                                    {record && <AttendanceBadge status={record.status} />}
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Manage Wage</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 mb-2">Current daily wage: <span className="font-bold">₹{currentWage || 'Not set'}</span></p>
                    <div className="flex items-center space-x-2">
                        <Input 
                            type="number" 
                            placeholder="New daily wage"
                            value={newWage}
                            onChange={(e) => setNewWage(e.target.value)}
                        />
                        <Input 
                            type="date" 
                            value={effectiveDate}
                            onChange={(e) => setEffectiveDate(e.target.value)}
                        />
                        <Button onClick={handleSetWage}>Set Wage</Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default MemberDetail;
