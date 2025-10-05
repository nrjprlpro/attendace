import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

const Login = lazy(() => import('./pages/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Management = lazy(() => import('./pages/admin/ManageStaffAndWorkers'));
const MemberDetail = lazy(() => import('./pages/admin/WorkerDetail'));
const MonthlySummary = lazy(() => import('./pages/admin/MonthlySummary'));
const AdminDailyEntry = lazy(() => import('./pages/admin/AdminDailyEntry'));
const StaffDailyEntry = lazy(() => import('./pages/staff/DailyEntry'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <HashRouter>
            <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>}>
                <Routes>
                    <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/staff/daily-entry'} replace />} />
                    
                    {/* Admin Routes - Use a layout route */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/admin/management" element={<Management />} />
                        <Route path="/admin/members/:memberId" element={<MemberDetail />} />
                        <Route path="/admin/monthly-summary" element={<MonthlySummary />} />
                        <Route path="/admin/daily-entry" element={<AdminDailyEntry />} />
                    </Route>

                    {/* Staff Routes - Use a layout route */}
                    <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
                        <Route path="/staff/daily-entry" element={<StaffDailyEntry />} />
                        {/* Redirect any other staff path to their single page */}
                        <Route path="/staff/*" element={<Navigate to="/staff/daily-entry" replace />} />
                    </Route>

                    {/* Root redirect */}
                    <Route path="/" element={<Navigate to={!user ? '/login' : (user.role === 'admin' ? '/admin/dashboard' : '/staff/daily-entry')} replace />} />
                    
                    {/* Not Found */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </HashRouter>
    );
};

export default App;
