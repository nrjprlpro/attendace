import React, { useEffect, useState } from 'react';
import { api } from '../../services/mockApi';
import { MemberWithTodayEntries, AttendanceStatus, AttendanceRecord } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ATTENDANCE_OPTIONS } from '../../constants';

const StaffDailyEntry: React.FC = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState<MemberWithTodayEntries[]>([]);
    const [loading, setLoading] = useState(true);
    const [entryData, setEntryData] = useState<Record<string, { attendance?: AttendanceStatus, payment: string }>>({});

    const fetchData = async () => {
        setLoading(true);
        const membersData = await api.getMembersWithTodayEntries();
        setMembers(membersData);
        setLoading(false);
    }

    useEffect(() => {
        if (!user) return;
        fetchData();
    }, [user]);

    const handleInputChange = (memberId: string, field: 'attendance' | 'payment', value: string) => {
        setEntryData(prev => ({
            ...prev,
            [memberId]: {
                ...prev[memberId],
                [field]: value,
            },
        }));
    };

    const handleSave = async (memberId: string) => {
        if (!user) return;
        const data = entryData[memberId];
        if (!data || (!data.attendance && !data.payment)) return;
        
        const memberIndex = members.findIndex(m => m.id === memberId);
        if (memberIndex === -1) return;

        const newAttendance = data.attendance;
        const newPaymentAmount = data.payment ? parseFloat(data.payment) : 0;
        
        try {
            let savedAttendanceRecord: AttendanceRecord | undefined = members[memberIndex].attendance;

            if (newAttendance) {
                savedAttendanceRecord = await api.setAttendance({
                    memberId,
                    status: newAttendance,
                    date: new Date().toISOString(),
                    recordedById: user.uid,
                });
            }

            if (newPaymentAmount > 0) {
                await api.logPayment({
                    memberId,
                    amount: newPaymentAmount,
                    date: new Date().toISOString(),
                    recordedById: user.uid,
                });
            }
            
            // Update local state for instant feedback
            const updatedMembers = [...members];
            const updatedMember = { ...updatedMembers[memberIndex] };
            updatedMember.attendance = savedAttendanceRecord;
            if (newPaymentAmount > 0) {
                 updatedMember.todayPayment += newPaymentAmount;
            }
            updatedMembers[memberIndex] = updatedMember;
            setMembers(updatedMembers);

            // Clear the input fields for this member
            setEntryData(prev => {
                const newEntryState = { ...prev };
                delete newEntryState[memberId];
                return newEntryState;
            });
            
        } catch (error) {
            alert(`Failed to save data: ${error}`);
        }
    };

    const renderMemberRow = (member: MemberWithTodayEntries) => {
        const currentAttendance = member.attendance?.status;
        const newAttendanceInput = entryData[member.id]?.attendance;
        
        const hasNewEntry = !!(entryData[member.id]?.attendance || (entryData[member.id]?.payment && parseFloat(entryData[member.id]?.payment) > 0));

        return (
            <div key={member.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                    <img src={member.avatarUrl} alt={member.name} className="h-10 w-10 rounded-full object-cover" data-ai-hint={member.imageHint} />
                    <span className="font-medium">{member.name}</span>
                </div>
                <Select
                    value={newAttendanceInput || currentAttendance || ''}
                    onChange={e => handleInputChange(member.id, 'attendance', e.target.value as AttendanceStatus)}
                >
                    <option value="">{currentAttendance ? 'Change Attendance' : 'Select Attendance'}</option>
                    {ATTENDANCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </Select>
                <div className="flex items-center space-x-2">
                     <Input
                        type="number"
                        placeholder="Add Payment"
                        value={entryData[member.id]?.payment || ''}
                        onChange={e => handleInputChange(member.id, 'payment', e.target.value)}
                    />
                    {member.todayPayment > 0 && (
                        <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-md whitespace-nowrap">
                            Paid: ₹{member.todayPayment}
                        </span>
                     )}
                </div>
                <Button onClick={() => handleSave(member.id)} disabled={!hasNewEntry}>
                    Save
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/4" />
                <Card><CardContent className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</CardContent></Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold font-display">Daily Attendance Entry</h2>
            <Card>
                <CardHeader>
                    <CardTitle>All Members</CardTitle>
                    <CardContent className="text-sm text-gray-500 p-0 pt-1">
                        Mark attendance and log any payments for today. Saved entries will be shown here.
                    </CardContent>
                </CardHeader>
                <CardContent className="space-y-3">
                    {members.map(renderMemberRow)}
                </CardContent>
            </Card>
        </div>
    );
};

export default StaffDailyEntry;