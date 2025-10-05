import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// We will create this component in the next step
import HomePage from './components/HomePage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* This sets the default page to be the HomePage */}
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
