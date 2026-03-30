import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, PublicRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Exams from './pages/Exams';
import Results from './pages/Results';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/students"
            element={
              <PrivateRoute allowedRoles={['admin', 'teacher']}>
                <Layout>
                  <Students />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/teachers"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <Layout>
                  <Teachers />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/classes"
            element={
              <PrivateRoute allowedRoles={['admin', 'teacher']}>
                <Layout>
                  <Classes />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/attendance"
            element={
              <PrivateRoute allowedRoles={['admin', 'teacher']}>
                <Layout>
                  <Attendance />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/fees"
            element={
              <PrivateRoute>
                <Layout>
                  <Fees />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/exams"
            element={
              <PrivateRoute>
                <Layout>
                  <Exams />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/results"
            element={
              <PrivateRoute>
                <Layout>
                  <Results />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route path="/unauthorized" element={
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
                <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
                <a href="/dashboard" className="text-blue-600 hover:underline">Go to Dashboard</a>
              </div>
            </div>
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
