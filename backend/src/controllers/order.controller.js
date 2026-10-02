import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const STATUSES = ['Pending', 'Confirmed', 'Delivered', 'Cancelled'];

// The only allowed status changes. Everything else is blocked.
const ALLOWED = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Delivered'],
};

// Puts back stock (used when an order is cancelled or something fails midway)
const restoreStock = (reserved) =>
  Promise.all(reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));

const itemsToStock = (order) => order.items.map((i) => ({ id: i.product, qty: i.quantity }));

export const createOrder = async (req, res) => {
  const reserved = []; // [{ id, qty }] stock already reduced for this order
  try {
    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const { name, phone, city, address } = shippingAddress || {};
    if (!name?.trim() || !city?.trim() || !address?.trim() || !phone) {
      return res.status(400).json({ message: 'Name, phone, city and address are required' });
    }
    if (!/^03\d{9}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone must be 11 digits like 03XXXXXXXXX' });
    }

    // Merge duplicate products and validate quantities
    const qtyById = new Map();
    for (const it of items) {
      const qty = Number(it.quantity);
      if (!mongoose.isValidObjectId(it.product) || !Number.isInteger(qty) || qty < 1) {
        return res.status(400).json({ message: 'Invalid item in cart' });
      }
      const key = String(it.product);
      qtyById.set(key, (qtyById.get(key) || 0) + qty);
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const [id, qty] of qtyById) {
      // Atomic: reduces stock only if enough stock is available
      const product = await Product.findOneAndUpdate(
        { _id: id, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );

      if (!product) {
        await restoreStock(reserved);
        const existing = await Product.findById(id);
        return res.status(400).json({
          message: existing
            ? `Not enough stock for "${existing.title}"`
            : 'A product in your cart no longer exists',
        });
      }

      reserved.push({ id, qty });
      // Price and title always come from the database, never from the browser
      orderItems.push({ product: product._id, title: product.title, price: product.price, quantity: qty });
      totalAmount += product.price * qty;
    }

    const order = await Order.create({
      orderNumber: `DD-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`,
      customer: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod: 'Cash on Delivery',
      shippingAddress: { name: name.trim(), phone, city: city.trim(), address: address.trim() },
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    await restoreStock(reserved);
    res.status(500).json({ message: 'Server error' });
  }
};

// Customer: their own orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Seller: all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Seller: change status (Pending -> Confirmed -> Delivered, or Pending -> Cancelled)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!ALLOWED[order.status]?.includes(status)) {
      return res
        .status(400)
        .json({ message: `Cannot change status from ${order.status} to ${status}` });
    }

    // Only updates if the status is still what we just read (stops double updates)
    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: order.status },
      { status },
      { new: true }
    );
    if (!updated) {
      return res.status(409).json({ message: 'This order was just changed. Please refresh.' });
    }

    if (status === 'Cancelled') await restoreStock(itemsToStock(order));

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Customer: cancel own order, only while Pending. Stock is returned.
export const cancelOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Looking up by id AND customer means nobody can cancel someone else's order
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    const updated = await Order.findOneAndUpdate(
      { _id: order._id, status: 'Pending' },
      { status: 'Cancelled' },
      { new: true }
    );
    if (!updated) {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }

    await restoreStock(itemsToStock(order));

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
