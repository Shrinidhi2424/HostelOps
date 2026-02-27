import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) return null;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand">
                    HostelOps
                </Link>
                <div className="navbar-links">
                    {isAdmin ? (
                        <Link to="/admin">Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/dashboard">My Complaints</Link>
                            <Link to="/complaints/new">New Complaint</Link>
                        </>
                    )}
                </div>
                <div className="navbar-user">
                    <span className="user-name">{user?.name}</span>
                    <span className="user-role">{user?.role}</span>
                    <button onClick={handleLogout} className="btn-logout">
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
