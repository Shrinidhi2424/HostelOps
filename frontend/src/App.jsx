import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isAuthenticated
                                ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
                                : <Login />
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            isAuthenticated
                                ? <Navigate to="/dashboard" replace />
                                : <Register />
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/complaints/new"
                        element={
                            <ProtectedRoute>
                                <SubmitComplaint />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
