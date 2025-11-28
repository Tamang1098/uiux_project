const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const { adminAuth } = require('../middleware/auth');

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, items, subtotal, shippingFee, total } = req.body;
    const user = await User.findById(req.user.id).populate('cart.product');

    let orderItems = [];
    let calculatedSubtotal = 0;
    let calculatedShippingFee = 0;
    let calculatedTotal = 0;

    // If items are provided directly (Buy Now), use them
    if (items && items.length > 0) {
      orderItems = items;
      calculatedSubtotal = subtotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      calculatedShippingFee = shippingFee || (calculatedSubtotal > 1000 ? 0 : 100);
      calculatedTotal = total || (calculatedSubtotal + calculatedShippingFee);
    } else {
      // Otherwise, use cart
      if (user.cart.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Calculate totals from cart
      for (const cartItem of user.cart) {
        const product = cartItem.product;
        if (!product || product.status !== 'active') {
          continue;
        }

        if (product.stock < cartItem.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}` 
          });
        }

        const itemTotal = product.price * cartItem.quantity;
        calculatedSubtotal += itemTotal;

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: cartItem.quantity,
          image: product.image
        });

        // Update stock
        product.stock -= cartItem.quantity;
        await product.save();
      }

      calculatedShippingFee = calculatedSubtotal > 1000 ? 0 : 100;
      calculatedTotal = calculatedSubtotal + calculatedShippingFee;
    }

    // For direct orders (Buy Now), update stock
    if (items && items.length > 0) {
      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.name} not found` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Insufficient stock for ${item.name}` 
          });
        }
        product.stock -= item.quantity;
        await product.save();
      }
    }

    // Create order
    const order = new Order({
      user: user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal: calculatedSubtotal,
      shippingFee: calculatedShippingFee,
      total: calculatedTotal,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: paymentMethod === 'cod' ? 'confirmed' : 'pending' // COD orders are automatically confirmed
    });

    await order.save();

    // Create payment
    const payment = new Payment({
      order: order._id,
      user: user._id,
      method: paymentMethod,
      amount: calculatedTotal,
      status: 'pending'
    });

    await payment.save();

    order.payment = payment._id;
    await order.save();

    // Clear cart only if order was created from cart
    if (!items || items.length === 0) {
      user.cart = [];
      await user.save();
    }

    await order.populate('items.product');
    await payment.populate('order');

    // Create notification for admin
    const Notification = require('../models/Notification');
    await Notification.create({
      type: 'order',
      message: `New order #${order._id.toString().slice(-6)} from ${user.name} - Rs. ${calculatedTotal} (${paymentMethod.toUpperCase()})`,
      link: `/admin`,
      metadata: { orderId: order._id, userId: user._id }
    });

    res.status(201).json({ order, payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .populate('payment')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('payment')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (Admin)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('payment')
      .populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    await order.save();

    // Create user notification when status changes to processing or delivered
    if ((orderStatus === 'processing' || orderStatus === 'delivered') && oldStatus !== orderStatus && order.user) {
      const Notification = require('../models/Notification');
      const statusMessages = {
        processing: 'Your order is being processed',
        delivered: 'Your order has been delivered'
      };
      
      const now = new Date();
      const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      const day = now.toLocaleDateString('en-US', { weekday: 'long' });
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      await Notification.create({
        type: 'order',
        message: `${statusMessages[orderStatus]}. Order #${order.orderNumber} - ${date}, ${day}, ${time}`,
        user: order.user._id,
        link: `/orders/${order._id}`,
        metadata: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          oldStatus: oldStatus,
          newStatus: orderStatus
        }
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (Admin)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product')
      .populate('payment')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete order (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Delete associated payment if exists
    if (order.payment) {
      const Payment = require('../models/Payment');
      await Payment.findByIdAndDelete(order.payment);
    }

    // Delete the order
    await Order.findByIdAndDelete(req.params.id);
    
    console.log('Order deleted successfully from MongoDB:', req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

