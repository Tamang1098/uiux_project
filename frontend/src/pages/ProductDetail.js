import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProductReview from '../components/ProductReview';
import PaymentMethodModal from '../components/PaymentMethodModal';
import QRCodeModal from '../components/QRCodeModal';
import OrderSuccessModal from '../components/OrderSuccessModal';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [pendingBuyNow, setPendingBuyNow] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Listen for register modal open event (from Buy Now button)
  useEffect(() => {
    const handleOpenRegister = () => {
      setShowRegisterModal(true);
      setPendingBuyNow(true);
    };
    window.addEventListener('openRegisterModal', handleOpenRegister);
    return () => window.removeEventListener('openRegisterModal', handleOpenRegister);
  }, []);

  // Monitor payment modal - close it if user becomes unauthenticated
  useEffect(() => {
    if (showPaymentModal && (!isAuthenticated || !user || user.role === 'admin')) {
      // User is not authenticated or is admin - close payment modal
      setShowPaymentModal(false);
    }
  }, [showPaymentModal, isAuthenticated, user]);

  // After login, continue with Buy Now flow
  useEffect(() => {
    // Only proceed if user is authenticated, has pending Buy Now, and no modals are open
    if (isAuthenticated && user && user.role !== 'admin' && pendingBuyNow && !showLoginModal && !showRegisterModal) {
      // Small delay to ensure modals are closed, then open payment modal
      const timer = setTimeout(() => {
        setPendingBuyNow(false);
        // Double check authentication before opening payment modal
        if (isAuthenticated && user && user.role !== 'admin') {
          setShowPaymentModal(true);
        } else {
          setPendingBuyNow(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, pendingBuyNow, showLoginModal, showRegisterModal]);

  useEffect(() => {
    // Reset quantity to 1 when product changes
    if (product) {
      setQuantity(1);
    }
  }, [product?._id]);

  useEffect(() => {
    // Ensure quantity doesn't exceed available stock
    if (product && quantity > (product?.stock || 0)) {
      setQuantity(Math.max(1, product?.stock || 0));
    }
  }, [product, quantity]);

  useEffect(() => {
    // Listen for product updates from admin or when reviews are added/deleted
    const handleProductUpdate = () => {
      console.log('Product update detected, refreshing product details...');
      fetchProduct();
    };

    // Listen for window events (same tab/window)
    window.addEventListener('productUpdated', handleProductUpdate);
    window.addEventListener('adminDataUpdated', handleProductUpdate);
    window.addEventListener('reviewUpdated', handleProductUpdate);
    
    // Listen for product-specific updates
    const handleProductSpecificUpdate = (e) => {
      const updatedProductId = e.detail?.productId || e.newValue;
      if (updatedProductId === id) {
        handleProductUpdate();
      }
    };
    window.addEventListener('productUpdatedId', handleProductSpecificUpdate);
    
    // Listen for localStorage changes (cross-tab communication)
    const handleStorageChange = (e) => {
      if (e.key === 'productUpdated' || e.key === 'adminDataUpdated' || e.key === 'reviewUpdated') {
        handleProductUpdate();
      }
      // Check if a specific product was updated
      if (e.key === 'productUpdatedId' && e.newValue === id) {
        handleProductUpdate();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Poll for changes when page is visible (backup method - checks every 5 seconds)
    let pollInterval;
    const startPolling = () => {
      // Poll every 5 seconds when page is visible
      pollInterval = setInterval(() => {
        if (!document.hidden) {
          fetchProduct();
        }
      }, 5000);
    };
    
    // Start polling when page becomes visible
    if (!document.hidden) {
      startPolling();
    }
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(pollInterval);
      } else {
        // Refresh immediately when page becomes visible (user switches back to tab)
        handleProductUpdate();
        startPolling();
      }
    };
    
    // Also refresh when window gets focus
    const handleWindowFocus = () => {
      handleProductUpdate();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      window.removeEventListener('productUpdated', handleProductUpdate);
      window.removeEventListener('adminDataUpdated', handleProductUpdate);
      window.removeEventListener('reviewUpdated', handleProductUpdate);
      window.removeEventListener('productUpdatedId', handleProductSpecificUpdate);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(pollInterval);
    };
  }, [id]); // Re-run when product ID changes

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    // Strict check: user must be authenticated and not admin
    if (!isAuthenticated || !user || user.role === 'admin') {
      // Open register modal first
      setShowRegisterModal(true);
      setPendingBuyNow(true);
      return;
    }
    // Only show payment modal if user is properly authenticated
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (method) => {
    // Double check authentication before proceeding
    if (!isAuthenticated || !user || user.role === 'admin') {
      setShowPaymentModal(false);
      setShowRegisterModal(true);
      setPendingBuyNow(true);
      return;
    }

    setShowPaymentModal(false);
    setProcessing(true);

    try {
      // Create order directly
      const orderData = {
        items: [{
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.image
        }],
        shippingAddress: {
          fullName: user.name,
          phone: user.phone || '0000000000',
          address: user.addresses?.[0]?.address || 'Default Address',
          city: user.addresses?.[0]?.city || 'Default City',
          postalCode: user.addresses?.[0]?.postalCode || '00000'
        },
        paymentMethod: method,
        subtotal: product.price * quantity,
        shippingFee: 0,
        total: product.price * quantity
      };

      const orderRes = await axios.post('http://localhost:5000/api/orders', orderData);
      const { order, payment } = orderRes.data;

      if (method === 'online') {
        // Online payment - show QR code modal
        setPaymentId(payment._id);
        setOrderId(order._id);
        setShowQRModal(true);
      } else {
        // COD - show success modal (like login modal style)
        setOrderNumber(order.orderNumber);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Error processing order');
    } finally {
      setProcessing(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/500';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:5000${imagePath}`;
    }
    // Handle case where imagePath might be just the filename without /uploads/
    if (!imagePath.includes('://') && !imagePath.startsWith('/')) {
      return `http://localhost:5000/uploads/${imagePath}`;
    }
    return imagePath;
  };

  const getProductImages = () => {
    if (!product) return [];
    const images = [];
    // Add main image
    if (product.image) {
      images.push(product.image);
    }
    // Add additional images (filter out duplicates of main image)
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      // Filter out null, undefined, empty strings, and duplicates of main image
      const additionalImages = product.images
        .filter(img => img && img.trim() !== '' && img !== product.image);
      images.push(...additionalImages);
    }
    // Return all images or placeholder
    return images.length > 0 ? images : ['https://via.placeholder.com/500'];
  };

  const totalPrice = product ? (product.price * quantity) : 0;
  const availableStock = product?.stock || 0;
  const remainingStock = availableStock - quantity; // Stock after current quantity selection

  if (loading) {
    return <div className="loading-container">{t('loadingProduct')}</div>;
  }

  if (!product) {
    return <div className="error-container">{t('productNotFound')}</div>;
  }

  const productImages = getProductImages();

  return (
    <div className="product-detail-page">
      <div className="container-small">
        <div className="product-detail-content">
          <div className="product-image-section">
            <div className="main-image-container">
              <img
                src={getImageUrl(productImages[selectedImageIndex])}
                alt={product.name}
                className="product-main-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500';
                }}
              />
            </div>
            {productImages.length > 1 && (
              <div className="image-thumbnails">
                {productImages.map((img, index) => (
                  <img
                    key={index}
                    src={getImageUrl(img)}
                    alt={`${product.name} ${index + 1}`}
                    className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="product-info-section">
            <h1 className="product-title">{product.name}</h1>
            <div className="product-price-section">
              <span className="product-price">Rs. {product.price}</span>
            </div>
            <div className="stock-info">
              <span className="stock-label">{t('stock')}:</span>
              <span className={`stock-value ${availableStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {availableStock > 0 ? (
                  quantity > 0 ? `${remainingStock} ${t('remaining')} (${availableStock} total)` : `${availableStock} ${t('available')}`
                ) : t('outOfStock')}
              </span>
            </div>
            <div className="product-actions">
              <div className="quantity-selector">
                <label>{t('quantity')}:</label>
                <div className="quantity-controls">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="quantity-btn"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button
                    onClick={() => {
                      if (quantity < availableStock) {
                        setQuantity(quantity + 1);
                      }
                    }}
                    className="quantity-btn"
                    disabled={quantity >= availableStock || availableStock === 0}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="total-price-section">
                <span className="total-label">{t('total')}:</span>
                <span className="total-price">Rs. {totalPrice.toFixed(2)}</span>
              </div>
              <div className="action-buttons">
                <button onClick={() => navigate(-1)} className="back-btn-inline">
                  ← Back to Product Page
                </button>
                <button
                  className="buy-now-btn"
                  onClick={handleBuyNow}
                  disabled={processing || availableStock === 0 || quantity === 0}
                >
                  {processing ? t('processing') : t('buyNow')}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="product-reviews-section">
          <ProductReview product={product} onReviewAdded={fetchProduct} />
        </div>
      </div>

      {/* Only show payment modal if user is authenticated and not admin */}
      {isAuthenticated && user && user.role !== 'admin' && (
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSelectMethod={handlePaymentMethodSelect}
          totalAmount={totalPrice}
        />
      )}

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
        }}
        paymentId={paymentId}
        amount={totalPrice}
        orderId={orderId}
      />
      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderNumber={orderNumber}
      />

      {/* Login Modal - shown after registration or if user clicks login */}
      <LoginModal
        isOpen={showLoginModal}
        skipNavigation={true}
        onLoginSuccess={(user) => {
          // Don't navigate - stay on product detail page for Buy Now flow
          // The useEffect will detect authentication and open payment modal
        }}
        onClose={() => {
          setShowLoginModal(false);
          // If user cancels login after registering, cancel pending Buy Now
          if (!isAuthenticated) {
            setPendingBuyNow(false);
          }
        }}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      {/* Register Modal - shown when Buy Now is clicked without login */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false);
          // If user cancels registration, cancel pending Buy Now
          if (!isAuthenticated) {
            setPendingBuyNow(false);
          }
        }}
        onSwitchToLogin={() => {
          // After registration, switch to login modal
          // Close register modal first
          setShowRegisterModal(false);
          // Open login modal immediately after register modal closes
          // Use requestAnimationFrame to ensure DOM update happens first
          requestAnimationFrame(() => {
            setShowLoginModal(true);
          });
        }}
      />
    </div>
  );
};

export default ProductDetail;
