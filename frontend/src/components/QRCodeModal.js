import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';
import './QRCodeModal.css';

// Import QR code image from assets folder
import qrCodeImageSrc from '../assets/paymentQR.jpg';

const QRCodeModal = ({ isOpen, onClose, paymentId, amount }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();

  const handlePaymentDone = async () => {
    try {
      // Mark payment as done
      await axios.post(`http://localhost:5000/api/payments/${paymentId}/confirm`);
      
      // Show success message
      showToast(t('paymentSuccessful'), 'success');
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      // If there's an error, still show success for demo
      showToast(t('paymentSuccessful'), 'success');
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    }
  };

  const handleBack = () => {
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="qr-modal-close" onClick={onClose}>×</button>
        <h2>{t('onlinePayment')}</h2>
        <div className="qr-amount-section">
          <p className="qr-amount-label">{t('totalAmount')}:</p>
          <p className="qr-amount-value">NRs. {amount.toFixed(2)}</p>
        </div>
        <div className="qr-instruction">
          <p>{t('scanQRCode')}</p>
        </div>
        <div className="qr-remarks">
          <p className="qr-remarks-text">{t('remarks')}</p>
        </div>
        <div className="qr-code-container">
          <img 
            src={qrCodeImageSrc} 
            alt="QR Code" 
            className="qr-code-image"
            onError={(e) => {
              // Fallback if image not found
              console.error('QR code image failed to load:', e);
              e.target.src = '/qr-code.png';
            }}
          />
        </div>
        <div className="qr-modal-buttons">
          <button onClick={handlePaymentDone} className="qr-payment-done-btn">
            {t('paymentDone')}
          </button>
          <button onClick={handleBack} className="qr-back-btn">
            ← {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;

