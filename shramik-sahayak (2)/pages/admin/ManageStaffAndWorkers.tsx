import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/mockApi';
import { User, Member, MemberWithWage, Group } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { PlusCircleIcon } from '../../components/icons';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';

const Management: React.FC = () => {
    const [tab, setTab] = useState<'members' | 'groups' | 'wages'>('members');
    
    // Data states
    const [members, setMembers] = useState<Member[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [membersWithWages, setMembersWithWages] = useState<MemberWithWage[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [showGroupForm, setShowGroupForm] = useState(false);
    
    // Editing states
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
    const [editMemberFormData, setEditMemberFormData] = useState<Partial<Member>>({});
    
    const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
    const [editGroupFormData, setEditGroupFormData] = useState<Partial<Group>>({});

    const [editingMemberWageId, setEditingMemberWageId] = useState<string | null>(null);
    const [editMemberWageFormData, setEditMemberWageFormData] = useState<{ wage: string; effectiveDate: string }>({ wage: '', effectiveDate: '' });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [membersData, groupsData, membersWithWagesData] = await Promise.all([
            api.getMembers(),
            api.getGroups(),
            api.getMembersWithCurrentWage(),
        ]);
        setMembers(membersData);
        setGroups(groupsData);
        setMembersWithWages(membersWithWagesData);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Member Management ---
    const handleAddMember = async (name: string) => {
        if (!name) return;
        await api.createMember(name);
        setShowMemberForm(false);
        fetchData();
    }
    
    const handleEditMember = (member: Member) => {
        setEditingMemberId(member.id);
        setEditMemberFormData(member);
    };
    
    const handleCancelEditMember = () => setEditingMemberId(null);
    
    const handleUpdateMember = async () => {
        if (!editingMemberId) return;
        await api.updateMember(editingMemberId, editMemberFormData);
        setEditingMemberId(null);
        fetchData();
    };

    // --- Group Management ---
    const handleAddGroup = async (name: string) => {
        if (!name) return;
        await api.createGroup(name);
        setShowGroupForm(false);
        fetchData();
    };
    
    const handleEditGroup = (group: Group) => {
        setEditingGroupId(group.id);
        setEditGroupFormData(group);
    };

    const handleCancelEditGroup = () => setEditingGroupId(null);

    const handleUpdateGroup = async () => {
        if (!editingGroupId || !editGroupFormData.name) return;
        await api.updateGroup(editingGroupId, { name: editGroupFormData.name });
        setEditingGroupId(null);
        fetchData();
    };
    
    const handleDeleteGroup = async (id: string) => {
        if (window.confirm("Are you sure? Deleting a group will unassign all members from it.")) {
            await api.deleteGroup(id);
            fetchData();
        }
    };
    
    // --- Wage Management ---
    const handleEditMemberWage = (member: MemberWithWage) => {
        setEditingMemberWageId(member.id);
        setEditMemberWageFormData({
            wage: member.currentWage > 0 ? member.currentWage.toString() : '',
            effectiveDate: new Date().toISOString().split('T')[0]
        });
    };

    const handleCancelEditMemberWage = () => setEditingMemberWageId(null);

    const handleUpdateMemberWage = async () => {
        if (!editingMemberWageId || !editMemberWageFormData.wage || !editMemberWageFormData.effectiveDate) return;
        await api.setWage({
            memberId: editingMemberWageId,
            wage: parseFloat(editMemberWageFormData.wage),
            effectiveDate: new Date(editMemberWageFormData.effectiveDate).toISOString(),
        });
        setEditingMemberWageId(null);
        fetchData();
    };

    // --- Render Functions ---

    const renderMemberRow = (member: Member) => {
        if (editingMemberId === member.id) {
             return (
                 <div key={member.id} className="p-3 bg-blue-50 rounded-lg space-y-4">
                    <div className="flex items-start space-x-4">
                        <img src={editMemberFormData.avatarUrl} alt={editMemberFormData.name} className="h-16 w-16 rounded-full object-cover" data-ai-hint={editMemberFormData.imageHint} />
                        <div className="flex-grow space-y-2">
                           <div>
                                <Label htmlFor="name">Member Name</Label>
                                <Input id="name" name="name" value={editMemberFormData.name} onChange={(e) => setEditMemberFormData(p => ({...p, name: e.target.value}))} />
                            </div>
                            <div>
                                <Label htmlFor="groupId">Group</Label>
                                <Select id="groupId" name="groupId" value={editMemberFormData.groupId || ''} onChange={(e) => setEditMemberFormData(p => ({...p, groupId: e.target.value}))}>
                                    <option value="">No Group</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="secondary" onClick={() => setEditMemberFormData(p => ({...p, avatarUrl: `https://picsum.photos/seed/${Date.now()}/200/200`}))}>Change Photo</Button>
                        <Button size="sm" variant="secondary" onClick={handleCancelEditMember}>Cancel</Button>
                        <Button size="sm" onClick={handleUpdateMember}>Save</Button>
                    </div>
                </div>
            )
        }

        const group = groups.find(g => g.id === member.groupId);
        return (
            <div key={member.id} className="flex items-center p-3 bg-gray-50 rounded-lg justify-between">
                <div className="flex items-center space-x-3">
                    <img src={member.avatarUrl} alt={member.name} className="h-10 w-10 rounded-full object-cover" data-ai-hint={member.imageHint} />
                    <div>
                        <span className="font-medium">{member.name}</span>
                        {group && <p className="text-xs bg-gray-200 text-gray-700 inline-block px-2 py-0.5 rounded-full">{group.name}</p>}
                    </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => handleEditMember(member)}>Edit</Button>
            </div>
        )
    }
    
    const renderGroupRow = (group: Group) => {
        if (editingGroupId === group.id) {
            return (
                <div key={group.id} className="flex items-center p-3 bg-blue-50 rounded-lg justify-between space-x-2">
                    <Input value={editGroupFormData.name} onChange={e => setEditGroupFormData({name: e.target.value})} />
                    <div className="flex-shrink-0 flex space-x-2">
                        <Button size="sm" variant="secondary" onClick={handleCancelEditGroup}>Cancel</Button>
                        <Button size="sm" onClick={handleUpdateGroup}>Save</Button>
                    </div>
                </div>
            )
        }

        return (
            <div key={group.id} className="flex items-center p-3 bg-gray-50 rounded-lg justify-between">
                <span className="font-medium">{group.name}</span>
                <div className="space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => handleEditGroup(group)}>Rename</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteGroup(group.id)}>Delete</Button>
                </div>
            </div>
        )
    }
    
    const renderMemberWageRow = (member: MemberWithWage) => {
        if (editingMemberWageId === member.id) {
             return (
                <div key={member.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                            <img src={member.avatarUrl} alt={member.name} className="h-10 w-10 rounded-full object-cover" data-ai-hint={member.imageHint} />
                            <span className="font-medium">{member.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">Current: ₹{member.currentWage}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                         <Input type="number" placeholder="New daily wage" value={editMemberWageFormData.wage} onChange={(e) => setEditMemberWageFormData(p => ({...p, wage: e.target.value}))} />
                        <Input type="date" value={editMemberWageFormData.effectiveDate} onChange={(e) => setEditMemberWageFormData(p => ({...p, effectiveDate: e.target.value}))} />
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                        <Button size="sm" variant="secondary" onClick={handleCancelEditMemberWage}>Cancel</Button>
                        <Button size="sm" onClick={handleUpdateMemberWage}>Save Wage</Button>
                    </div>
                </div>
            )
        }

        return (
            <div key={member.id} className="flex items-center p-3 bg-gray-50 rounded-lg justify-between">
                <div className="flex items-center space-x-3">
                    <img src={member.avatarUrl} alt={member.name} className="h-10 w-10 rounded-full object-cover" data-ai-hint={member.imageHint} />
                    <span className="font-medium">{member.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-800 font-semibold">Current Wage: ₹{member.currentWage || 'Not Set'}</span>
                    <Button size="sm" variant="secondary" onClick={() => handleEditMemberWage(member)}>Set Wage</Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold font-display">Management</h2>

            <div className="flex border-b">
                <button onClick={() => setTab('members')} className={`px-4 py-2 -mb-px border-b-2 ${tab === 'members' ? 'border-primary text-primary-foreground' : 'border-transparent text-gray-500'}`}>Members</button>
                <button onClick={() => setTab('groups')} className={`px-4 py-2 -mb-px border-b-2 ${tab === 'groups' ? 'border-primary text-primary-foreground' : 'border-transparent text-gray-500'}`}>Groups</button>
                <button onClick={() => setTab('wages')} className={`px-4 py-2 -mb-px border-b-2 ${tab === 'wages' ? 'border-primary text-primary-foreground' : 'border-transparent text-gray-500'}`}>Wages</button>
            </div>

            {tab === 'members' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Manage Members</CardTitle>
                         <Button variant="ghost" onClick={() => setShowMemberForm(p => !p)}>
                            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Member
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {showMemberForm && <div className="p-4 border rounded-lg mt-4 space-y-2">
                            <h3 className="font-semibold">Add New Member</h3>
                            <Input id="new-member-name" placeholder="Member Name" />
                            <Button onClick={() => handleAddMember((document.getElementById('new-member-name') as HTMLInputElement).value)}>Save Member</Button>
                        </div>}
                        <div className="mt-4 space-y-2">
                             {loading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-16 w-full"/>) :
                                members.map(renderMemberRow)
                            }
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {tab === 'groups' && (
                <Card>
                     <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Manage Groups</CardTitle>
                        <Button variant="ghost" onClick={() => setShowGroupForm(p => !p)}>
                            <PlusCircleIcon className="mr-2 h-4 w-4" /> Add Group
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {showGroupForm && <div className="p-4 border rounded-lg mt-4 space-y-2">
                             <h3 className="font-semibold">Add New Group</h3>
                            <Input id="new-group-name" placeholder="Group Name" />
                            <Button onClick={() => handleAddGroup((document.getElementById('new-group-name') as HTMLInputElement).value)}>Save Group</Button>
                        </div>}
                         <div className="mt-4 space-y-2">
                            {loading ? Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-16 w-full"/>) :
                                groups.map(renderGroupRow)
                            }
                        </div>
                    </CardContent>
                </Card>
            )}

            {tab === 'wages' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Member Wages</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mt-4 space-y-2">
                            {loading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-16 w-full"/>) :
                                membersWithWages.map(renderMemberWageRow)
                            }
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Management;