import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Contact Us Section */}
                <div className="footer-section">
                    <h3 className="footer-heading">📞 Contact Us</h3>
                    <div className="footer-content">
                        <div className="contact-item">
                            <span className="contact-icon">📱</span>
                            <a href="tel:+9779812345678" className="contact-link">
                                +977 981-2345678
                            </a>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">📱</span>
                            <a href="tel:+9779823456789" className="contact-link">
                                +977 982-3456789
                            </a>
                        </div>
                        <div className="contact-item">
                            <span className="contact-icon">✉️</span>
                            <a href="mailto:info@eventshopnepal.com" className="contact-link">
                                info@eventshopnepal.com
                            </a>
                        </div>
                    </div>
                </div>

                {/* How to Shop Section */}
                <div className="footer-section">
                    <h3 className="footer-heading">🛒 How to Shop</h3>
                    <div className="footer-content">
                        <ol className="shop-instructions">
                            <li>
                                <strong>Browse Products:</strong> Explore our categories or search for specific items
                            </li>
                            <li>
                                <strong>View Details:</strong> Click on any product to see full details and images
                            </li>
                            <li>
                                <strong>Register/Login:</strong> Create an account or login to place orders
                            </li>
                            <li>
                                <strong>Select Quantity:</strong> Choose the quantity you need
                            </li>
                            <li>
                                <strong>Buy Now:</strong> Click "Buy Now" and select payment method (Online/COD)
                            </li>
                            <li>
                                <strong>Track Order:</strong> View your order status in "My Orders" section
                            </li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} EventShop Nepal. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
