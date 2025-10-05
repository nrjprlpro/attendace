import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/mockApi';
import { Member, AttendanceStatus, Group } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ATTENDANCE_OPTIONS } from '../../constants';

const AdminDailyEntry: React.FC = () => {
    const { user } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Record<string, { attendance: AttendanceStatus | '', payment: string }>>({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [membersData, groupsData] = await Promise.all([
                api.getMembers(),
                api.getGroups()
            ]);
            setMembers(membersData);
            setGroups(groupsData);
            setLoading(false);
        };
        fetchData();
    }, []);

    const groupedMembers = useMemo(() => {
        const grouped: Record<string, Member[]> = {};
        const unassigned: Member[] = [];

        members.forEach(member => {
            if (member.groupId && groups.find(g => g.id === member.groupId)) {
                if (!grouped[member.groupId]) {
                    grouped[member.groupId] = [];
                }
                grouped[member.groupId].push(member);
            } else {
                unassigned.push(member);
            }
        });

        return { grouped, unassigned };
    }, [members, groups]);

    const handleInputChange = (memberId: string, field: 'attendance' | 'payment', value: string) => {
        setFormData(prev => ({
            ...prev,
            [memberId]: {
                ...prev[memberId],
                [field]: value,
            },
        }));
    };

    const handleSave = async (memberId: string) => {
        if (!user) return;
        const data = formData[memberId];
        if (!data || (!data.attendance && !data.payment)) {
            alert("No data to save.");
            return;
        }

        try {
            if (data.attendance) {
                await api.setAttendance({ memberId, status: data.attendance, date: new Date().toISOString(), recordedById: user.uid });
            }
            if (data.payment && parseFloat(data.payment) > 0) {
                await api.logPayment({ memberId, amount: parseFloat(data.payment), date: new Date().toISOString(), recordedById: user.uid });
            }
            setFormData(prev => ({...prev, [memberId]: { attendance: '', payment: '' }}));
            alert(`Data saved for member!`);

        } catch (error) {
             alert(`Failed to save data: ${error}`);
        }
    };
    
    const renderMemberRow = (member: Member) => {
        const { id, name, avatarUrl, imageHint } = member;
        return (
             <div key={id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                    <img src={avatarUrl} alt={name} className="h-10 w-10 rounded-full object-cover" data-ai-hint={imageHint}/>
                    <span className="font-medium">{name}</span>
                </div>
                <Select
                    value={formData[id]?.attendance || ''}
                    onChange={e => handleInputChange(id, 'attendance', e.target.value)}
                >
                    <option value="">Select Attendance</option>
                    {ATTENDANCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </Select>
                <Input
                    type="number"
                    placeholder="Enter Payment"
                    value={formData[id]?.payment || ''}
                    onChange={e => handleInputChange(id, 'payment', e.target.value)}
                />
                <Button onClick={() => handleSave(id)}>Save</Button>
            </div>
        )
    }

    if (loading) {
         return <div className="space-y-4">
            <Skeleton className="h-10 w-1/4"/>
            <Skeleton className="h-40 w-full"/>
            <Skeleton className="h-40 w-full"/>
        </div>
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold font-display">Daily Entry</h2>
            
            {groups.map(group => {
                const membersInGroup = groupedMembers.grouped[group.id];
                if (!membersInGroup || membersInGroup.length === 0) return null;
                return (
                    <Card key={group.id}>
                        <CardHeader><CardTitle>{group.name}</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {membersInGroup.map(renderMemberRow)}
                        </CardContent>
                    </Card>
                )
            })}
            
            {groupedMembers.unassigned.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Unassigned Members</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {groupedMembers.unassigned.map(renderMemberRow)}
                    </CardContent>
                </Card>
            )}
        </div>
    )
};

export default AdminDailyEntry;