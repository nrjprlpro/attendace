import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/mockApi';
import { MemberWithTodayEntries } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import AttendanceBadge from '../../components/AttendanceBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard: React.FC = () => {
    const [members, setMembers] = useState<MemberWithTodayEntries[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const fetchedMembers = await api.getMembersWithTodayEntries();
            setMembers(fetchedMembers);

            const presentCount = fetchedMembers.filter(w => w.attendance && w.attendance.status !== 'absent').length;
            setStats({
                present: presentCount,
                absent: fetchedMembers.length - presentCount,
                total: fetchedMembers.length,
            });
            setLoading(false);
        };
        fetchData();
    }, []);
    
    // Mock data for charts
    const attendanceChartData = [
        { name: 'Mon', present: 3, absent: 1 },
        { name: 'Tue', present: 4, absent: 0 },
        { name: 'Wed', present: 2, absent: 2 },
        { name: 'Thu', present: 4, absent: 0 },
        { name: 'Fri', present: 3, absent: 1 },
        { name: 'Sat', present: 4, absent: 0 },
    ];
    
    const paymentChartData = [
        { name: 'Jan', paid: 40000 },
        { name: 'Feb', paid: 30000 },
        { name: 'Mar', paid: 50000 },
        { name: 'Apr', paid: 45000 },
        { name: 'May', paid: 60000 },
    ];


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold font-display">Admin Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Today's Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-12 w-3/4" />
                        ) : (
                            <div className="text-4xl font-bold">{stats.present} / {stats.total}</div>
                        )}
                        <p className="text-sm text-gray-500 mt-1">{stats.absent} members absent</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                             <Skeleton className="h-12 w-1/4" />
                        ) : (
                            <div className="text-4xl font-bold">{stats.total}</div>
                        )}
                        <p className="text-sm text-gray-500 mt-1">Active members</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-2">
                             <Link to="/admin/management" className="text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-2">Manage</Link>
                             <Link to="/admin/monthly-summary" className="text-sm bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-md px-3 py-2">View Summary</Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Weekly Attendance Trend</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={attendanceChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="present" fill="#A2D9A9" />
                                <Bar dataKey="absent" fill="#F87171" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Monthly Payments</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={paymentChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="paid" fill="#B0C47F" name="Amount Paid" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Member Status Today</CardTitle>
                    <CardDescription>Click on a member to view their profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {loading ? (
                           Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4 p-2">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/4" />
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                           ))
                        ) : (
                            members.map(member => (
                                <Link to={`/admin/members/${member.id}`} key={member.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <img src={member.avatarUrl} alt={member.name} className="h-12 w-12 rounded-full object-cover" data-ai-hint={member.imageHint}/>
                                    <div className="flex-1">
                                        <p className="font-medium">{member.name}</p>
                                    </div>
                                    <div>
                                        {member.attendance ? (
                                            <AttendanceBadge status={member.attendance.status} />
                                        ) : (
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">Not Marked</span>
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboard;