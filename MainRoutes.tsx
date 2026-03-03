import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CandidateGridView from './components/CandidateGridView';
import CandidateSpreadsheetView from './components/CandidateSpreadsheetView';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { useAuth } from './AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import CategorySection from './components/CategorySection';
import Home from './components/Home';

const GridWrapper = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    return (
        <CandidateGridView
            categoryId={id ?? null}
            onBack={() => navigate('/')}
        />
    );
};

const SpreadsheetWrapper = () => {
    const navigate = useNavigate();

    return (
        <CandidateSpreadsheetView
            initialCategoryId={null}
            onBack={() => navigate('/')}
        />
    );
};

const MainRoutes: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) return <Login onSuccess={() => { }} />;

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:id" element={<GridWrapper />} />
            <Route path="/spreadsheet" element={<SpreadsheetWrapper />} />
            {isAdmin && <Route path="/admin" element={<AdminDashboard onBack={() => navigate('/')} />} />}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default MainRoutes;
