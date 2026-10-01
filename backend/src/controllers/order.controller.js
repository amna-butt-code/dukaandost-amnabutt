import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Puts back stock that was already reduced (used when something fails midway)
const restoreStock = (reserved) =>
  Promise.all(reserved.map((r) => Product.updateOne({ _id: r.id }, { $inc: { stock: r.qty } })));

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
