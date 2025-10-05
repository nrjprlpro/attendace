
import React from 'react';
import { AttendanceStatus } from '../types';
import { ATTENDANCE_OPTIONS } from '../constants';

interface AttendanceBadgeProps {
    status: AttendanceStatus;
}

const AttendanceBadge: React.FC<AttendanceBadgeProps> = ({ status }) => {
    const statusInfo = ATTENDANCE_OPTIONS.find(o => o.value === status);

    const statusColors: Record<AttendanceStatus, string> = {
        full: 'bg-green-100 text-green-800',
        half: 'bg-yellow-100 text-yellow-800',
        one_and_a_half: 'bg-blue-100 text-blue-800',
        absent: 'bg-red-100 text-red-800',
    };

    if (!statusInfo) return null;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {statusInfo.label}
        </span>
    );
};

export default AttendanceBadge;
