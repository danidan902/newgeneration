
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import AdminDashboard from '../src/components/superadmin/AdminDashboard';
import TeacherDashboard from '../src/components/teacher/TeacherDashboard';
import StudentDashboard from '../src/components/student/StudentDashboard';
import ParentDashboard from '../src/components/parent/ParentDashboard'; // Add this import
import PrivateRoute from './components/PrivateRoute';
import ForgotPassword from './contexts/ForGotPassword'; // Add this import
import ResetPassword from './contexts/ResetPassword';
import ChangePassword from './components/ChangePassword'; // Add this import
import AchiveStudentReportCard from './components/Achived/AchiveStudentReportCard';

// Add this route

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* <Route path="/verify-certificate" element={<VerifyCertificate />} /> */}
        <Route path="/login" element={<Login />} />
        {/* <Route path="/verify" element={<StudentVerificationDisplay />} /> */}
        
        {/* Admin route */}
        <Route path="/admin/*" element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />
        
        {/* Superadmin route */}
        <Route path="/superadmin/*" element={
          <PrivateRoute role="superadmin">
            <AdminDashboard />
          </PrivateRoute>
        } />
        
        {/* Teacher route */}
        <Route path="/teacher/*" element={
          <PrivateRoute role="teacher">
            <TeacherDashboard />
          </PrivateRoute>
        } />
        
        {/* Student route */}
        <Route path="/student/*" element={
          <PrivateRoute role="student">
            <StudentDashboard />
          </PrivateRoute>
        } />
        
        {/* Parent route - ADD THIS */}
        <Route path="/parent/*" element={
          <PrivateRoute role="parent">
            <ParentDashboard />
          </PrivateRoute>
        } />

    
         
        {/* Forgot Password route - ADD THIS */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path='achive-student' element={<AchiveStudentReportCard />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/change-password" element={<ChangePassword />} />
      </Routes>
    </Router>
  );
}

export default App;