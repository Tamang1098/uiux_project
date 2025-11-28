import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import axios from 'axios';
import LoginModal from '../LoginModal';
import RegisterModal from '../RegisterModal';
import ProfileDropdown from '../ProfileDropdown';
import './UserNavbar.css';

const UserNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
    // Listen for custom event to open register modal
    const handleOpenRegister = () => {
      setShowRegisterModal(true);
    };
    window.addEventListener('openRegisterModal', handleOpenRegister);
    return () => window.removeEventListener('openRegisterModal', handleOpenRegister);
  }, []);

  // Fetch notification count for authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadNotificationCount(0);
      return;
    }

    const fetchNotificationCount = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/notifications');
        const unreadCount = res.data.filter(n => !n.read).length;
        setUnreadNotificationCount(unreadCount);
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchNotificationCount();
    // Poll for notifications every 10 seconds
    const interval = setInterval(fetchNotificationCount, 10000);
    
    // Listen for notification updates (window events)
    const handleNotificationUpdate = () => {
      fetchNotificationCount();
    };
    window.addEventListener('notificationUpdated', handleNotificationUpdate);
    
    // Listen for localStorage events (cross-tab communication)
    const handleStorageChange = (e) => {
      if (e.key === 'notificationUpdated' || e.key === 'orderStatusUpdated') {
        fetchNotificationCount();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events
    const handleCustomEvent = () => {
      fetchNotificationCount();
    };
    window.addEventListener('orderStatusUpdated', handleCustomEvent);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationUpdated', handleNotificationUpdate);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('orderStatusUpdated', handleCustomEvent);
    };
  }, [isAuthenticated]);

  return (
    <nav className="user-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <h2>EventShop Nepal</h2>
          </Link>
          {isAuthenticated && user?.role !== 'admin' && (
            <div className="navbar-welcome">
              {t('welcomeBack')}, {user?.name}! 👋
            </div>
          )}
        </div>
        
        <div className="navbar-menu">
          {isAuthenticated ? (
            // User Navbar - Product Page, My Orders, Profile Icon, Logout
            <>
              <Link 
                to="/" 
                className={`navbar-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                {t('productPage')}
              </Link>
              <Link 
                to="/orders" 
                className={`navbar-link ${location.pathname === '/orders' ? 'active' : ''}`}
                style={{ position: 'relative' }}
              >
                {t('myOrders')}
                {unreadNotificationCount > 0 && (
                  <span className="notification-badge-navbar">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </Link>
              <ProfileDropdown user={user} />
              <button onClick={() => { logout(); navigate('/'); }} className="navbar-link navbar-logout">{t('logout')}</button>
            </>
          ) : (
            <>
              <a 
                href="/admin/login" 
                target="_blank" 
                rel="noopener noreferrer"
                className="navbar-link navbar-admin-login"
              >
                {t('adminLogin')}
              </a>
              <button onClick={() => setShowLoginModal(true)} className="navbar-link">
                {t('login')}
              </button>
              <button onClick={() => setShowRegisterModal(true)} className="navbar-link">
                {t('register')}
              </button>
            </>
          )}
          {/* Language Dropdown */}
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="navbar-language-dropdown"
          >
            <option value="en">English</option>
            <option value="ne">नेपाली</option>
          </select>
        </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      
      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </nav>
  );
};

export default UserNavbar;

