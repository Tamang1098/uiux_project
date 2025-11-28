import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import AdminNavbar from './components/admin/AdminNavbar';
import UserNavbar from './components/user/UserNavbar';
import UserWelcome from './components/UserWelcome';
import AdminLogin from './components/AdminLogin';
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
              <>
                <UserNavbar />
                <LandingPage />
              </>
            } />
            <Route path="/product/:id" element={
              <>
                <UserNavbar />
                <ProductDetail />
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
              </>
            } />
            <Route path="/checkout" element={
              <>
                <UserNavbar />
                <Checkout />
              </>
            } />
            <Route path="/orders" element={
              <>
                <UserNavbar />
                <OrderHistory />
              </>
            } />
            <Route path="/orders/:id" element={
              <>
                <UserNavbar />
                <OrderDetails />
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

