import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { LogOutIcon, LayoutDashboardIcon, UsersIcon, FileTextIcon, CalendarIcon } from './icons';

const AppHeader: React.FC = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navLinks = user?.role === 'admin' ? [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
        { href: '/admin/daily-entry', label: 'Daily Entry', icon: CalendarIcon },
        { href: '/admin/management', label: 'Management', icon: UsersIcon },
        { href: '/admin/monthly-summary', label: 'Monthly Summary', icon: FileTextIcon },
    ] : [];
    
    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                         <h1 className="text-2xl font-bold font-display text-primary-foreground">Shramik Sahayak</h1>
                        {user?.role === 'admin' && (
                             <nav className="hidden md:flex space-x-4">
                                {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            to={link.href}
                                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                                location.pathname.startsWith(link.href)
                                                    ? 'bg-primary/20 text-primary-foreground'
                                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                        >
                                            <link.icon className="h-5 w-5 mr-2" />
                                            {link.label}
                                        </Link>
                                ))}
                            </nav>
                        )}
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-4">Welcome, {user?.name}</span>
                        <Button variant="ghost" size="icon" onClick={logout}>
                            <LogOutIcon className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AppHeader;
