import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
    const [filters, setFilters] = useState({ category: '', status: '', priority: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const categories = ['Electrical', 'Plumbing', 'Internet', 'Cleaning', 'Other'];
    const statuses = ['Pending', 'In Progress', 'Resolved'];
    const priorities = ['Low', 'Medium', 'High'];

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.category) params.category = filters.category;
            if (filters.status) params.status = filters.status;
            if (filters.priority) params.priority = filters.priority;

            const [complaintsRes, statsRes] = await Promise.all([
                api.get('/admin/complaints', { params }),
                api.get('/admin/stats'),
            ]);

            setComplaints(complaintsRes.data.complaints);
            setStats(statsRes.data.stats);
        } catch (err) {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.patch(`/admin/complaints/${id}`, { status: newStatus });
            fetchData();
        } catch (err) {
            setError('Failed to update status.');
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({ category: '', status: '', priority: '' });
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'In Progress': return 'status-progress';
            case 'Resolved': return 'status-resolved';
            default: return '';
        }
    };

    const getPriorityClass = (priority) => {
        switch (priority) {
            case 'High': return 'priority-high';
            case 'Medium': return 'priority-medium';
            case 'Low': return 'priority-low';
            default: return '';
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>Admin Dashboard</h2>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Total Complaints</div>
                </div>
                <div className="stat-card stat-pending">
                    <div className="stat-number">{stats.pending}</div>
                    <div className="stat-label">Pending</div>
                </div>
                <div className="stat-card stat-progress">
                    <div className="stat-number">{stats.inProgress}</div>
                    <div className="stat-label">In Progress</div>
                </div>
                <div className="stat-card stat-resolved">
                    <div className="stat-number">{stats.resolved}</div>
                    <div className="stat-label">Resolved</div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <select name="category" value={filters.category} onChange={handleFilterChange}>
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <select name="status" value={filters.status} onChange={handleFilterChange}>
                    <option value="">All Statuses</option>
                    {statuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
                <select name="priority" value={filters.priority} onChange={handleFilterChange}>
                    <option value="">All Priorities</option>
                    {priorities.map((p) => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
                    Clear Filters
                </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <div className="loading">Loading complaints...</div>
            ) : complaints.length === 0 ? (
                <div className="empty-state">
                    <h3>No complaints found</h3>
                    <p>No complaints match the selected filters.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map((complaint, index) => (
                                <tr key={complaint.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="student-info">
                                            <span className="student-name">{complaint.user?.name}</span>
                                            <span className="student-email">{complaint.user?.email}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-category">{complaint.category}</span>
                                    </td>
                                    <td className="desc-cell">{complaint.description}</td>
                                    <td>
                                        <span className={`badge ${getPriorityClass(complaint.priority)}`}>
                                            {complaint.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusClass(complaint.status)}`}>
                                            {complaint.status}
                                        </span>
                                    </td>
                                    <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <select
                                            className="status-select"
                                            value={complaint.status}
                                            onChange={(e) => handleStatusUpdate(complaint.id, e.target.value)}
                                        >
                                            {statuses.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
