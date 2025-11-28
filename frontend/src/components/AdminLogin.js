import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      if (result.user?.role === 'admin') {
        window.location.href = '/admin';
      } else {
        setError('Access denied. Admin credentials required.');
      }
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-box">
          <div className="admin-login-header">
            <h1>👑 Admin Login</h1>
            <p>Access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="admin-login-form">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter admin email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter admin password"
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>

          <div className="back-to-site">
            <a href="/">← Back to Site</a>
            <span style={{ margin: '0 0.5rem', color: '#999' }}>|</span>
            <a href="/admin/login">Admin Login</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

