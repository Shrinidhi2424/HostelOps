import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        block: '',
        room: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                block: formData.block || undefined,
                room: formData.room || undefined,
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                        <span className="icon">person_add</span>
                    </div>
                    <h2 className="auth-hero__title">
                        Join<br />DormDesk
                    </h2>
                    <p className="auth-hero__subtitle">
                        Create your account and start managing your hostel experience. It's fast, free, and secure.
                    </p>
                    <div className="auth-hero__features">
                        <div className="auth-hero__feature">
                            <div className="auth-hero__feature-icon">
                                <span className="icon">speed</span>
                            </div>
                            <span>Get started in under 60 seconds</span>
                        </div>
                        <div className="auth-hero__feature">
                            <div className="auth-hero__feature-icon">
                                <span className="icon">notifications_active</span>
                            </div>
                            <span>Track complaint status in real-time</span>
                        </div>
                        <div className="auth-hero__feature">
                            <div className="auth-hero__feature-icon">
                                <span className="icon">admin_panel_settings</span>
                            </div>
                            <span>Direct line to hostel administration</span>
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
                        <h1>Create account</h1>
                        <p>Fill in your details to get started</p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="name">Full name</label>
                            <div className="input-group__field">
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your full name"
                                    required
                                />
                                <span className="icon">person</span>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="email">Email address</label>
                            <div className="input-group__field">
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                />
                                <span className="icon">mail</span>
                            </div>
                        </div>

                        <div className="auth-row">
                            <div className="input-group">
                                <label htmlFor="block">Hostel block</label>
                                <div className="input-group__field">
                                    <input
                                        id="block"
                                        type="text"
                                        name="block"
                                        value={formData.block}
                                        onChange={handleChange}
                                        placeholder="e.g. Block A"
                                    />
                                    <span className="icon">domain</span>
                                </div>
                            </div>
                            <div className="input-group">
                                <label htmlFor="room">Room no.</label>
                                <div className="input-group__field">
                                    <input
                                        id="room"
                                        type="text"
                                        name="room"
                                        value={formData.room}
                                        onChange={handleChange}
                                        placeholder="e.g. 101"
                                    />
                                    <span className="icon">meeting_room</span>
                                </div>
                            </div>
                        </div>

                        <div className="auth-divider">Secure your account</div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-group__field">
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Min. 6 characters"
                                    required
                                />
                                <span className="icon">lock</span>
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">Confirm password</label>
                            <div className="input-group__field">
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter your password"
                                    required
                                />
                                <span className="icon">lock</span>
                            </div>
                        </div>

                        <button type="submit" className="btn-auth" disabled={loading}>
                            {loading ? (
                                <>Creating account...</>
                            ) : (
                                <>
                                    <span className="icon">how_to_reg</span>
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
