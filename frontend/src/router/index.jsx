// src/router/AppRoutes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserProfile from '../pages/use_profile';
import Login from '../pages/login';
import Register from '../pages/register';
import FeedbackPage from '../pages/feedback';
import TransactionHistory from '../pages/transaction.history';
import Dashboard from '../pages/admin/dashboard';
import MemberManagement from '../pages/admin/member_management';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import UserLayout from '../layouts/UserLayout';
import FeedbackManagement from '../pages/admin/feedback_management';
import InteractionManagement from '../pages/admin/interaction_management';
import NotificationManagement from '../pages/admin/notification_management';
import Chat from '../pages/chat';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
                <ProtectedRoute adminOnly={true}>
                    <AdminLayout>
                        <Navigate to="/admin/dashboard" replace />
                    </AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/dashboard" element={
                <ProtectedRoute adminOnly={true}>
                    <AdminLayout>
                        <Dashboard />
                    </AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/members" element={
                <ProtectedRoute adminOnly={true}>
                    <AdminLayout>
                        <MemberManagement />
                    </AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/feedbacks" element={
                <ProtectedRoute adminOnly={true}>
                    <AdminLayout>
                        <FeedbackManagement />
                    </AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/interactions" element={
                <ProtectedRoute adminOnly={true}>
                    <AdminLayout>
                        <InteractionManagement />
                    </AdminLayout>
                </ProtectedRoute>
            } />
            <Route path="/admin/notifications" element={
                <ProtectedRoute adminOnly={true}>
                    <AdminLayout>
                        <NotificationManagement />
                    </AdminLayout>
                </ProtectedRoute>
            } />

            {/* User Routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <UserLayout>
                        <UserProfile />
                    </UserLayout>
                </ProtectedRoute>
            } />
            <Route path='/feedback' element={
                <ProtectedRoute>
                    <UserLayout>
                        <FeedbackPage />
                    </UserLayout>
                </ProtectedRoute>
            } />
            <Route path='/transaction_history' element={
                <ProtectedRoute>
                    <UserLayout>
                        <TransactionHistory />
                    </UserLayout>
                </ProtectedRoute>
            } />
            <Route path='/chat' element={
                <ProtectedRoute>
                    <UserLayout>
                        <Chat />
                    </UserLayout>
                </ProtectedRoute>
            } />
        </Routes>
    );
};

export default AppRoutes;
