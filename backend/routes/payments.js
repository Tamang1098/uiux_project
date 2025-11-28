const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/auth');

// Generate QR code for online payment
router.post('/:paymentId/generate-qr', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('order')
      .populate('user');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user owns the payment
    if (payment.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (payment.method !== 'online') {
      return res.status(400).json({ message: 'QR code only for online payments' });
    }

    // Generate payment data string
    const paymentData = {
      paymentId: payment.paymentId,
      orderNumber: payment.order.orderNumber,
      amount: payment.amount,
      merchant: 'E-Commerce Store'
    };

    const qrDataString = JSON.stringify(paymentData);

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrDataString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Update payment with QR code
    payment.qrCode = qrCodeDataURL;
    payment.qrCodeData = qrDataString;
    await payment.save();

    res.json({
      qrCode: qrCodeDataURL,
      paymentData: paymentData,
      paymentId: payment.paymentId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get payment details
router.get('/:paymentId', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('order')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Check if user owns the payment or is admin
    if (payment.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm payment (for online payments - simulate payment confirmation)
router.post('/:paymentId/confirm', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate('order');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (payment.status === 'paid') {
      return res.status(400).json({ message: 'Payment already confirmed' });
    }

    // Update payment status
    payment.status = 'paid';
    payment.paymentDate = new Date();
    payment.transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    await payment.save();

    // Update order status
    const order = payment.order;
    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    await order.save();

    res.json({ 
      message: 'Payment confirmed successfully',
      payment,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update payment status (Admin)
router.put('/:paymentId/status', adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.paymentId,
      { status },
      { new: true }
    ).populate('order').populate('user');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update order payment status
    if (payment.order) {
      payment.order.paymentStatus = status;
      if (status === 'paid') {
        payment.order.orderStatus = 'confirmed';
      }
      await payment.order.save();
    }

    // Create notification for user when payment is marked as paid (only for online payments, not COD)
    // Skip notification if skipNotification flag is set or if it's COD payment
    const skipNotification = req.query.skipNotification === 'true' || req.body.skipNotification === true;
    if (status === 'paid' && payment.user && !skipNotification && payment.method !== 'cod') {
      const Notification = require('../models/Notification');
      const order = payment.order;
      const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const day = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const time = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      await Notification.create({
        type: 'payment',
        message: `Payment successful! Your payment for Order #${order.orderNumber} has been verified. Order confirmed. - ${date}, ${day}, ${time}`,
        user: payment.user._id,
        link: `/orders/${order._id}`,
        metadata: {
          orderId: order._id,
          paymentId: payment._id
        }
      });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all payments (Admin)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user', 'name email')
      .populate('order')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

