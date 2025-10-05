
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const NotFound: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-6xl font-bold font-display text-primary-foreground">404</h1>
            <p className="text-2xl mt-4">Page Not Found</p>
            <p className="text-gray-500 mt-2">The page you are looking for does not exist.</p>
            <Link to="/">
                <Button className="mt-6">Go Home</Button>
            </Link>
        </div>
    );
};

export default NotFound;
