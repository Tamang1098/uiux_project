import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navbar
    welcomeBack: 'Welcome back',
    productPage: 'Product Page',
    myOrders: 'My Orders',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    adminLogin: 'Admin Login',
    
    // Landing Page
    filterByCategory: 'Filter by Category',
    allCategories: 'All Categories',
    showProducts: 'Show Products',
    allProducts: 'All Products',
    featuredProducts: 'Featured Products',
    noProducts: 'No products available',
    inThisCategory: 'in this category',
    showing: 'Showing',
    of: 'of',
    products: 'products',
    adminCanAdd: 'Admin can add products from the admin panel',
    
    // Login/Register
    email: 'Email',
    password: 'Password',
    name: 'Name',
    phone: 'Mobile Number',
    confirmPassword: 'Confirm Password',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    enterName: 'Enter your name',
    enterPhone: 'Enter your mobile number',
    enterConfirmPassword: 'Confirm your password',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    switchToRegister: 'Register here',
    switchToLogin: 'Login here',
    createAccount: 'Create Account',
    loggingIn: 'Logging in...',
    registering: 'Registering...',
    passwordsNotMatch: 'Passwords do not match',
    passwordMinLength: 'Password must be at least 6 characters',
    registrationSuccess: 'Registration successful! Please login to continue.',
    loginSuccess: 'Login successful! Welcome back!',
    
    // Product
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    viewDetails: 'View Details',
    price: 'Price',
    quantity: 'Quantity',
    total: 'Total',
    originalPrice: 'Original Price',
    stock: 'Stock',
    remaining: 'remaining',
    available: 'available',
    outOfStock: 'Out of Stock',
    processing: 'Processing...',
    productNotFound: 'Product not found',
    loadingProduct: 'Loading product...',
    
    // Cart
    cart: 'Cart',
    yourCart: 'Your Cart',
    items: 'items',
    emptyCart: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    proceedToCheckout: 'Proceed to Checkout',
    remove: 'Remove',
    orderSummary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    free: 'Free',
    loadingCart: 'Loading cart...',
    errorUpdatingCart: 'Error updating cart',
    errorRemovingItem: 'Error removing item',
    
    // Checkout
    checkout: 'Checkout',
    shippingAddress: 'Shipping Address',
    paymentMethod: 'Payment Method',
    cashOnDelivery: 'Cash on Delivery',
    onlinePayment: 'Online Payment',
    placeOrder: 'Place Order',
    placingOrder: 'Placing Order...',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    address: 'Address',
    city: 'City',
    postalCode: 'Postal Code',
    payWhenReceive: 'Pay when you receive the order',
    payViaQR: 'Pay via QR code',
    orderPlacedSuccess: 'Order placed successfully! Your order will be delivered soon.',
    errorPlacingOrder: 'Error placing order. Please try again.',
    paymentVerificationProgress: 'Payment verification is in progress. Please wait for admin confirmation.',
    paymentSuccessful: 'Payment successful! Your payment has been verified.',
    onlinePayment: 'Online Payment',
    totalAmount: 'Total Amount',
    scanQRCode: 'Scan the QR code below to pay',
    remarks: 'In Remarks: Please enter your E-mail',
    paymentDone: 'Payment Done',
    
    // Orders
    orderHistory: 'Order History',
    orderNumber: 'Order Number',
    orderDate: 'Order Date',
    orderStatus: 'Order Status',
    orderTotal: 'Order Total',
    viewOrder: 'View Order',
    viewDetails: 'View Details',
    qty: 'Qty',
    noOrdersYet: "You haven't placed any orders yet.",
    shopNow: 'Shop Now',
    orderedItems: 'Ordered Items',
    totalPrice: 'Total Price',
    loadingOrderDetails: 'Loading order details...',
    orderNotFound: 'Order not found',
    backToOrders: 'Back to Orders',
    orderDetails: 'Order Details',
    orderInformation: 'Order Information',
    paymentStatus: 'Payment Status',
    orderItems: 'Order Items',
    each: 'each',
    paymentViaQR: 'Payment via QR Code',
    scanQRCodePayment: 'Scan this QR code with your payment app to complete the payment',
    confirming: 'Confirming...',
    iHavePaid: 'I Have Paid',
    generateQRCode: 'Generate QR Code',
    youWillPayWhenReceive: 'You will pay when you receive the order.',
    amount: 'Amount',
    paymentConfirmed: 'Payment Confirmed',
    paymentConfirmedMessage: 'Your payment has been confirmed. Your order is being processed.',
    haveYouCompletedPayment: 'Have you completed the payment? This will confirm your order.',
    paymentConfirmedAlert: 'Payment confirmed! Your order will be processed.',
    errorConfirmingPayment: 'Error confirming payment',
    phone: 'Phone',
    
    // Common
    perPage: 'per page',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    select: 'Select',
    all: 'All',
    none: 'None',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    confirm: 'Confirm',
    page: 'Page',
    selectPaymentMethod: 'Select Payment Method',
    cashOnDeliveryCOD: 'Cash on Delivery (COD)'
  },
  ne: {
    // Navbar
    welcomeBack: 'फिर्ता स्वागत छ',
    productPage: 'उत्पाद पृष्ठ',
    myOrders: 'मेरो अर्डरहरू',
    logout: 'लगआउट',
    login: 'लगइन',
    register: 'दर्ता',
    adminLogin: 'एडमिन लगइन',
    
    // Landing Page
    filterByCategory: 'श्रेणी अनुसार फिल्टर',
    allCategories: 'सबै श्रेणीहरू',
    showProducts: 'उत्पादहरू देखाउनुहोस्',
    allProducts: 'सबै उत्पादहरू',
    featuredProducts: 'विशेष उत्पादहरू',
    noProducts: 'कुनै उत्पाद उपलब्ध छैन',
    inThisCategory: 'यस श्रेणीमा',
    showing: 'देखाइरहेको',
    of: 'मध्ये',
    products: 'उत्पादहरू',
    adminCanAdd: 'एडमिनले एडमिन प्यानलबाट उत्पादहरू थप्न सक्छन्',
    
    // Login/Register
    email: 'इमेल',
    password: 'पासवर्ड',
    name: 'नाम',
    phone: 'मोबाइल नम्बर',
    confirmPassword: 'पासवर्ड पुष्टि गर्नुहोस्',
    enterEmail: 'आफ्नो इमेल प्रविष्ट गर्नुहोस्',
    enterPassword: 'आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्',
    enterName: 'आफ्नो नाम प्रविष्ट गर्नुहोस्',
    enterPhone: 'आफ्नो मोबाइल नम्बर प्रविष्ट गर्नुहोस्',
    enterConfirmPassword: 'आफ्नो पासवर्ड पुष्टि गर्नुहोस्',
    dontHaveAccount: 'खाता छैन?',
    alreadyHaveAccount: 'पहिले नै खाता छ?',
    switchToRegister: 'यहाँ दर्ता गर्नुहोस्',
    switchToLogin: 'यहाँ लगइन गर्नुहोस्',
    createAccount: 'खाता सिर्जना गर्नुहोस्',
    loggingIn: 'लगइन हुँदै...',
    registering: 'दर्ता हुँदै...',
    passwordsNotMatch: 'पासवर्डहरू मेल खाँदैनन्',
    passwordMinLength: 'पासवर्ड कम्तिमा ६ वर्णको हुनुपर्छ',
    registrationSuccess: 'दर्ता सफल! कृपया लगइन गर्नुहोस्।',
    loginSuccess: 'लगइन सफल! फिर्ता स्वागत छ!',
    
    // Product
    addToCart: 'कार्टमा थप्नुहोस्',
    buyNow: 'अहिले किन्नुहोस्',
    viewDetails: 'विवरण हेर्नुहोस्',
    price: 'मूल्य',
    quantity: 'मात्रा',
    total: 'जम्मा',
    originalPrice: 'मूल मूल्य',
    stock: 'स्टक',
    remaining: 'बाँकी',
    available: 'उपलब्ध',
    outOfStock: 'स्टक बाहिर',
    processing: 'प्रक्रिया हुँदै...',
    productNotFound: 'उत्पाद फेला परेन',
    loadingProduct: 'उत्पाद लोड हुँदै...',
    
    // Cart
    cart: 'कार्ट',
    yourCart: 'तपाईंको कार्ट',
    items: 'वस्तुहरू',
    emptyCart: 'तपाईंको कार्ट खाली छ',
    continueShopping: 'खरिद जारी राख्नुहोस्',
    proceedToCheckout: 'चेकआउटमा जानुहोस्',
    remove: 'हटाउनुहोस्',
    orderSummary: 'अर्डर सारांश',
    subtotal: 'उप-जम्मा',
    shipping: 'ढुवानी',
    free: 'निःशुल्क',
    loadingCart: 'कार्ट लोड हुँदै...',
    errorUpdatingCart: 'कार्ट अपडेट गर्दा त्रुटि',
    errorRemovingItem: 'वस्तु हटाउँदा त्रुटि',
    
    // Checkout
    checkout: 'चेकआउट',
    shippingAddress: 'ढुवानी ठेगाना',
    paymentMethod: 'भुक्तानी विधि',
    cashOnDelivery: 'ढुवानीमा नगद',
    onlinePayment: 'अनलाइन भुक्तानी',
    placeOrder: 'अर्डर राख्नुहोस्',
    placingOrder: 'अर्डर राखिँदै...',
    fullName: 'पूरा नाम',
    phoneNumber: 'फोन नम्बर',
    address: 'ठेगाना',
    city: 'शहर',
    postalCode: 'डाक कोड',
    payWhenReceive: 'अर्डर प्राप्त गर्दा तिर्नुहोस्',
    payViaQR: 'QR कोड मार्फत तिर्नुहोस्',
    orderPlacedSuccess: 'अर्डर सफलतापूर्वक राखियो! तपाईंको अर्डर चाँडै वितरण हुनेछ।',
    errorPlacingOrder: 'अर्डर राख्दा त्रुटि। कृपया पुनः प्रयास गर्नुहोस्।',
    paymentVerificationProgress: 'भुक्तानी प्रमाणीकरण प्रक्रियामा छ। कृपया एडमिन पुष्टिको लागि प्रतीक्षा गर्नुहोस्।',
    paymentSuccessful: 'भुक्तानी सफल! तपाईंको भुक्तानी प्रमाणित भएको छ।',
    onlinePayment: 'अनलाइन भुक्तानी',
    totalAmount: 'जम्मा रकम',
    scanQRCode: 'तलको QR कोड स्क्यान गरेर तिर्नुहोस्',
    remarks: 'टिप्पणीमा: कृपया आफ्नो इमेल प्रविष्ट गर्नुहोस्',
    paymentDone: 'भुक्तानी भयो',
    
    // Orders
    orderHistory: 'अर्डर इतिहास',
    orderNumber: 'अर्डर नम्बर',
    orderDate: 'अर्डर मिति',
    orderStatus: 'अर्डर स्थिति',
    orderTotal: 'अर्डर जम्मा',
    viewOrder: 'अर्डर हेर्नुहोस्',
    viewDetails: 'विवरण हेर्नुहोस्',
    qty: 'मात्रा',
    noOrdersYet: 'तपाईंले अहिलेसम्म कुनै अर्डर राख्नुभएको छैन।',
    shopNow: 'अहिले खरिद गर्नुहोस्',
    orderedItems: 'अर्डर गरिएका वस्तुहरू',
    totalPrice: 'जम्मा मूल्य',
    loadingOrderDetails: 'अर्डर विवरण लोड हुँदै...',
    orderNotFound: 'अर्डर फेला परेन',
    backToOrders: 'अर्डरहरूमा फिर्ता',
    orderDetails: 'अर्डर विवरण',
    orderInformation: 'अर्डर जानकारी',
    paymentStatus: 'भुक्तानी स्थिति',
    orderItems: 'अर्डर वस्तुहरू',
    each: 'प्रत्येक',
    paymentViaQR: 'QR कोड मार्फत भुक्तानी',
    scanQRCodePayment: 'भुक्तानी पूरा गर्न आफ्नो भुक्तानी एपले यो QR कोड स्क्यान गर्नुहोस्',
    confirming: 'पुष्टि हुँदै...',
    iHavePaid: 'मैले तिरिसकेको छु',
    generateQRCode: 'QR कोड जेनरेट गर्नुहोस्',
    youWillPayWhenReceive: 'तपाईंले अर्डर प्राप्त गर्दा तिर्नुहुनेछ।',
    amount: 'रकम',
    paymentConfirmed: 'भुक्तानी पुष्टि भयो',
    paymentConfirmedMessage: 'तपाईंको भुक्तानी पुष्टि भएको छ। तपाईंको अर्डर प्रक्रियामा छ।',
    haveYouCompletedPayment: 'के तपाईंले भुक्तानी पूरा गर्नुभयो? यसले तपाईंको अर्डर पुष्टि गर्नेछ।',
    paymentConfirmedAlert: 'भुक्तानी पुष्टि भयो! तपाईंको अर्डर प्रक्रियामा जानेछ।',
    errorConfirmingPayment: 'भुक्तानी पुष्टि गर्दा त्रुटि',
    phone: 'फोन',
    
    // Common
    perPage: 'प्रति पृष्ठ',
    loading: 'लोड हुँदै...',
    error: 'त्रुटि',
    success: 'सफल',
    cancel: 'रद्द गर्नुहोस्',
    save: 'बचत गर्नुहोस्',
    delete: 'मेटाउनुहोस्',
    edit: 'सम्पादन गर्नुहोस्',
    close: 'बन्द गर्नुहोस्',
    submit: 'पेश गर्नुहोस्',
    back: 'पछाडि',
    next: 'अर्को',
    previous: 'अघिल्लो',
    search: 'खोज्नुहोस्',
    filter: 'फिल्टर',
    sort: 'क्रमबद्ध गर्नुहोस्',
    select: 'छान्नुहोस्',
    all: 'सबै',
    none: 'कुनै पनि होइन',
    yes: 'हो',
    no: 'होइन',
    ok: 'ठीक छ',
    confirm: 'पुष्टि गर्नुहोस्',
    page: 'पृष्ठ',
    selectPaymentMethod: 'भुक्तानी विधि छान्नुहोस्',
    cashOnDeliveryCOD: 'ढुवानीमा नगद (COD)'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language][key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ne' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

