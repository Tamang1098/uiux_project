import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import ProductReview from '../components/ProductReview';
import PaymentMethodModal from '../components/PaymentMethodModal';
import QRCodeModal from '../components/QRCodeModal';
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
  const [processing, setProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

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
    if (!isAuthenticated) {
      // Directly open register modal without alert
      window.dispatchEvent(new CustomEvent('openRegisterModal'));
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (method) => {
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
        setShowQRModal(true);
      } else {
        // COD - directly navigate to orders page
        alert('Order placed successfully! Your order will be delivered soon.');
        navigate('/orders');
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
        <div className="product-reviews-section">
          <ProductReview product={product} onReviewAdded={fetchProduct} />
        </div>
        <button onClick={() => navigate(-1)} className="back-btn">
          ← {t('back')}
        </button>
      </div>

      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSelectMethod={handlePaymentMethodSelect}
        totalAmount={totalPrice}
      />

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
        }}
        paymentId={paymentId}
        amount={totalPrice}
      />
    </div>
  );
};

export default ProductDetail;
