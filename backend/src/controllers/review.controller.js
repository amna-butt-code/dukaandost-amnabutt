import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { getSentiment } from '../services/ai/sentiment.service.js';

const hasDeliveredOrder = (customerId, productId) =>
  Order.exists({ customer: customerId, status: 'Delivered', 'items.product': productId });

// Recalculates the product's average rating and review count from its reviews
const updateProductRating = async (productId) => {
  const [stats] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.updateOne(
    { _id: productId },
    {
      averageRating: stats ? Math.round(stats.avg * 10) / 10 : 0,
      reviewCount: stats ? stats.count : 0,
    }
  );
};

// Customer: write a review (only for a product from a Delivered order)
export const createReview = async (req, res) => {
  try {
    const { product, rating, text } = req.body;
    const stars = Number(rating);

    if (!mongoose.isValidObjectId(product)) {
      return res.status(400).json({ message: 'Invalid product' });
    }
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
    }
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'Please write your review' });
    }
    if (text.trim().length > 500) {
      return res.status(400).json({ message: 'Review is too long (max 500 characters)' });
    }

    if (!(await Product.exists({ _id: product }))) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (await Review.exists({ product, customer: req.user._id })) {
      return res.status(409).json({ message: 'You have already reviewed this product' });
    }
    if (!(await hasDeliveredOrder(req.user._id, product))) {
      return res
        .status(403)
        .json({ message: 'You can only review products from an order that was delivered to you' });
    }

    // Hugging Face model decides positive / neutral / negative
    const sentiment = await getSentiment(text.trim());

    const review = await Review.create({
      product,
      customer: req.user._id,
      rating: stars,
      text: text.trim(),
      sentiment,
    });
    await updateProductRating(product);

    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Public: reviews of one product
export const getProductReviews = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id) || !(await Product.exists({ _id: req.params.id }))) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const reviews = await Review.find({ product: req.params.id })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Customer: can I review this product? (used to show or hide the review form)
export const getEligibility = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const [delivered, reviewed] = await Promise.all([
      hasDeliveredOrder(req.user._id, productId),
      Review.exists({ product: productId, customer: req.user._id }),
    ]);
    const reason = reviewed ? 'already_reviewed' : delivered ? null : 'not_delivered';
    res.json({ eligible: !reason, reason });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Seller: all reviews plus counts of positive / neutral / negative
export const getAllReviews = async (req, res) => {
  try {
    const [reviews, grouped] = await Promise.all([
      Review.find().populate('product', 'title').populate('customer', 'name').sort({ createdAt: -1 }),
      Review.aggregate([{ $group: { _id: '$sentiment', count: { $sum: 1 } } }]),
    ]);

    const counts = { positive: 0, neutral: 0, negative: 0 };
    grouped.forEach((g) => {
      counts[g._id] = g.count;
    });

    res.json({ counts, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
