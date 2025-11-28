import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
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
      setFormData({ email: '', password: '' });
      showToast(t('loginSuccess'), 'success');
      onClose();
      // Only navigate after successful login - regular users go to product page, admin goes to admin panel
      if (result.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message);
    }
  };

  // Handle close - just close the modal, don't navigate anywhere
  const handleClose = () => {
    setFormData({ email: '', password: '' });
    setError('');
    onClose();
  };


  // Don't show login modal if user is already authenticated
  if (!isOpen || isAuthenticated) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>×</button>
        <h2>{t('login')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder={t('enterEmail')}
            />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder={t('enterPassword')}
            />
          </div>
          {error && (
            <div className="error-message" style={{ 
              marginTop: '0.5rem', 
              marginBottom: '1rem',
              padding: '1rem',
              fontSize: '0.95rem',
              lineHeight: '1.5'
            }}>
              ⚠️ {error}
            </div>
          )}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? t('loggingIn') : t('login')}
          </button>
        </form>
        
        <p className="switch-auth">
          {t('dontHaveAccount')}{' '}
          <span onClick={onSwitchToRegister} className="switch-link">{t('register')}</span>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;

