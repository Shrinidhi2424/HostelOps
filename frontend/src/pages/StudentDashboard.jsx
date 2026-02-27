import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const StudentDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/complaints');
            setComplaints(response.data.complaints);
        } catch (err) {
            setError('Failed to load complaints.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this complaint? This cannot be undone.')) return;

        setDeletingId(id);
        try {
            await api.delete(`/complaints/${id}`);
            setComplaints(complaints.filter((c) => c.id !== id));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete complaint.');
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return 'schedule';
            case 'In Progress': return 'autorenew';
            case 'Resolved': return 'check_circle';
            default: return 'help';
        }
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

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Electrical': return 'electrical_services';
            case 'Plumbing': return 'plumbing';
            case 'Internet': return 'wifi';
            case 'Cleaning': return 'cleaning_services';
            default: return 'more_horiz';
        }
    };

    if (loading) return <div className="loading">Loading complaints...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>
                    <span className="icon">list_alt</span>
                    My Complaints
                </h2>
                <Link to="/complaints/new" className="btn btn-primary">
                    <span className="icon">add</span>
                    New Complaint
                </Link>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {complaints.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        <span className="icon">inbox</span>
                    </div>
                    <h3>No complaints yet</h3>
                    <p>You haven't submitted any complaints. Click the button above to submit your first one.</p>
                </div>
            ) : (
                <div className="complaints-grid">
                    {complaints.map((complaint, index) => (
                        <div
                            className={`complaint-card complaint-card--${complaint.status.toLowerCase().replace(' ', '-')}`}
                            key={complaint.id}
                            style={{ animationDelay: `${index * 0.06}s` }}
                        >
                            <div className="complaint-card__header">
                                <div className="complaint-card__category">
                                    <span className="icon" style={{ fontSize: '18px' }}>
                                        {getCategoryIcon(complaint.category)}
                                    </span>
                                    <span>{complaint.category}</span>
                                </div>
                                <div className="complaint-card__badges">
                                    <span className={`badge ${getPriorityClass(complaint.priority)}`}>
                                        {complaint.priority}
                                    </span>
                                    <span className={`badge ${getStatusClass(complaint.status)}`}>
                                        <span className="icon" style={{ fontSize: '12px' }}>
                                            {getStatusIcon(complaint.status)}
                                        </span>
                                        {complaint.status}
                                    </span>
                                </div>
                            </div>

                            <p className="complaint-card__desc">{complaint.description}</p>

                            <div className="complaint-card__footer">
                                <span className="complaint-card__date">
                                    <span className="icon" style={{ fontSize: '14px' }}>calendar_today</span>
                                    {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </span>
                                {complaint.status === 'Pending' && (
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(complaint.id)}
                                        disabled={deletingId === complaint.id}
                                        title="Delete complaint"
                                    >
                                        <span className="icon" style={{ fontSize: '16px' }}>
                                            {deletingId === complaint.id ? 'hourglass_empty' : 'delete'}
                                        </span>
                                        {deletingId === complaint.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
