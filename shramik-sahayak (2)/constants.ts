
import { AttendanceStatus } from './types';

export const ATTENDANCE_OPTIONS: { value: AttendanceStatus; label: string, multiplier: number }[] = [
    { value: 'full', label: '1 Day', multiplier: 1 },
    { value: 'half', label: '0.5 Day', multiplier: 0.5 },
    { value: 'one_and_a_half', label: '1.5 Day', multiplier: 1.5 },
    { value: 'absent', label: 'Absent', multiplier: 0 },
];
