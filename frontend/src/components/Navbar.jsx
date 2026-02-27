import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) return null;

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-brand">
                    <span className="icon" style={{ marginRight: '6px', fontSize: '22px' }}>desk</span>
                    DormDesk
                </Link>
                <div className="navbar-links">
                    {isAdmin ? (
                        <Link to="/admin" className={isActive('/admin')}>
                            <span className="icon" style={{ fontSize: '16px', marginRight: '4px' }}>dashboard</span>
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link to="/dashboard" className={isActive('/dashboard')}>
                                <span className="icon" style={{ fontSize: '16px', marginRight: '4px' }}>list_alt</span>
                                My Complaints
                            </Link>
                            <Link to="/complaints/new" className={isActive('/complaints/new')}>
                                <span className="icon" style={{ fontSize: '16px', marginRight: '4px' }}>add_circle</span>
                                New Complaint
                            </Link>
                        </>
                    )}
                </div>
                <div className="navbar-user">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        <span className="icon" style={{ fontSize: '16px' }}>logout</span>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
