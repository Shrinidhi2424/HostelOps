import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SubmitComplaint = () => {
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        priority: 'Medium',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const categories = [
        { value: 'Electrical', icon: 'electrical_services' },
        { value: 'Plumbing', icon: 'plumbing' },
        { value: 'Internet', icon: 'wifi' },
        { value: 'Cleaning', icon: 'cleaning_services' },
        { value: 'Other', icon: 'more_horiz' },
    ];
    const priorities = ['Low', 'Medium', 'High'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.category) {
            setError('Please select a category.');
            return;
        }

        if (formData.description.length < 10) {
            setError('Description must be at least 10 characters.');
            return;
        }

        setLoading(true);

        try {
            await api.post('/complaints', formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit complaint.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>
                    <span className="icon">edit_note</span>
                    Submit a Complaint
                </h2>
            </div>

            <div className="form-card">
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="category">
                            <span className="icon">category</span>
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.value}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="priority">
                            <span className="icon">flag</span>
                            Priority
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                        >
                            {priorities.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">
                            <span className="icon">description</span>
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the issue in detail (minimum 10 characters)"
                            rows="5"
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            <span className="icon">close</span>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>Submitting...</>
                            ) : (
                                <>
                                    <span className="icon">send</span>
                                    Submit Complaint
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitComplaint;
