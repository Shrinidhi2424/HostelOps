import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const StudentDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (loading) return <div className="loading">Loading complaints...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>My Complaints</h2>
                <Link to="/complaints/new" className="btn btn-primary">
                    + New Complaint
                </Link>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            {complaints.length === 0 ? (
                <div className="empty-state">
                    <h3>No complaints yet</h3>
                    <p>You haven't submitted any complaints. Click the button above to submit one.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {complaints.map((complaint, index) => (
                                <tr key={complaint.id}>
                                    <td>{index + 1}</td>
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
