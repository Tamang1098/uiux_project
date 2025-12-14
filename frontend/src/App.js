import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import AdminNavbar from './components/admin/AdminNavbar';
import UserNavbar from './components/user/UserNavbar';
import UserWelcome from './components/UserWelcome';
import AdminLogin from './components/AdminLogin';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import AdminPanel from './pages/AdminPanel';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetails from './pages/OrderDetails';
import './App.css';
import './styles/designSystem.css';

function App() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/" element={
                  <div className="sidebar-page">
                    <UserNavbar />
                    <LandingPage />
                    <Footer />
                  </div>
                } />
                <Route path="/product/:id" element={
                  <>
                    <UserNavbar />
                    <ProductDetail />
                    <Footer />
                  </>
                } />
                <Route path="/admin" element={
                  <>
                    <AdminNavbar />
                    <UserWelcome />
                    <AdminPanel />
                  </>
                } />
                <Route path="/cart" element={
                  <>
                    <UserNavbar />
                    <Cart />
                    <Footer />
                  </>
                } />
                <Route path="/checkout" element={
                  <>
                    <UserNavbar />
                    <Checkout />
                    <Footer />
                  </>
                } />
                <Route path="/orders" element={
                  <>
                    <UserNavbar />
                    <OrderHistory />
                    <Footer />
                  </>
                } />
                <Route path="/orders/:id" element={
                  <>
                    <UserNavbar />
                    <OrderDetails />
                    <Footer />
                  </>
                } />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

export default App;

