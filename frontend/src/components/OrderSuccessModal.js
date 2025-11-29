import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './OrderSuccessModal.css';

const OrderSuccessModal = ({ isOpen, onClose, orderNumber }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      // Auto navigate to orders after 2 seconds
      const timer = setTimeout(() => {
        navigate('/orders');
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, navigate, onClose]);

  const handleViewOrders = () => {
    navigate('/orders');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="order-success-modal-overlay" onClick={onClose}>
      <div className="order-success-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="order-success-modal-close" onClick={onClose}>×</button>
        <div className="order-success-icon">✓</div>
        <h2>{t('paymentSuccessful')}</h2>
        <p className="order-success-message">
          {orderNumber ? `Order Number: ${orderNumber}` : t('paymentConfirmedMessage')}
        </p>
        <p className="order-success-submessage">
          {t('paymentConfirmedMessage')}
        </p>
        <div className="order-success-actions">
          <button onClick={handleViewOrders} className="order-success-btn">
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;

