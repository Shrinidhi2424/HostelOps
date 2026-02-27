import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            {/* ── Left Hero Panel ── */}
            <div className="auth-hero">
                <div className="auth-hero__shapes">
                    <div className="auth-hero__shape" />
                    <div className="auth-hero__shape" />
                    <div className="auth-hero__shape" />
                    <div className="auth-hero__shape" />
                </div>
                <div className="auth-hero__content">
                    <div className="auth-hero__icon">
                        <span className="icon">desk</span>
                    </div>
                    <h2 className="auth-hero__title">
                        Welcome to<br />DormDesk
                    </h2>
                    <p className="auth-hero__subtitle">
                        Your smart hostel companion — report issues, track resolutions, and keep your living space running smoothly.
                    </p>
                    <div className="auth-hero__features">
                        <div className="auth-hero__feature">
                            <div className="auth-hero__feature-icon">
                                <span className="icon">bolt</span>
                            </div>
                            <span>Instant complaint submission & tracking</span>
                        </div>
                        <div className="auth-hero__feature">
                            <div className="auth-hero__feature-icon">
                                <span className="icon">visibility</span>
                            </div>
                            <span>Real-time status updates on your issues</span>
                        </div>
                        <div className="auth-hero__feature">
                            <div className="auth-hero__feature-icon">
                                <span className="icon">shield</span>
                            </div>
                            <span>Secure & private — only you see your data</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right Form Panel ── */}
            <div className="auth-panel">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-header__brand">
                            <span className="icon">desk</span>
                            DormDesk
                        </div>
                        <h1>Sign in</h1>
                        <p>Enter your credentials to access your dashboard</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">Email address</label>
                            <div className="input-group__field">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                />
                                <span className="icon">mail</span>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-group__field">
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                                <span className="icon">lock</span>
                            </div>
                        </div>

                        <button type="submit" className="btn-auth" disabled={loading}>
                            {loading ? (
                                <>Signing in...</>
                            ) : (
                                <>
                                    <span className="icon">login</span>
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Don't have an account? <Link to="/register">Create one free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
