import mongoose from 'mongoose';
import Product from '../models/Product.js';

// Returns an error message string, or null if the data is valid
const validateProduct = (b) => {
  if (!b.title?.trim()) return 'Title is required';
  if (!b.description?.trim()) return 'Description is required';
  if (!b.category?.trim()) return 'Category is required';
  if (b.price === undefined || b.price === '' || Number(b.price) <= 0) {
    return 'Price must be greater than 0';
  }
  if (b.stock === undefined || b.stock === '' || Number(b.stock) < 0 || !Number.isInteger(Number(b.stock))) {
    return 'Stock must be a whole number, 0 or more';
  }
  const images = Array.isArray(b.images) ? b.images.filter((i) => i?.trim()) : [];
  if (images.length < 1) return 'At least one image is required';
  return null;
};

const pickFields = (b) => ({
  title: b.title.trim(),
  description: b.description.trim(),
  category: b.category.trim(),
  price: Number(b.price),
  stock: Number(b.stock),
  images: b.images.filter((i) => i?.trim()),
});

export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'All' ? { category } : {};
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const error = validateProduct(req.body);
    if (error) return res.status(400).json({ message: error });

    const product = await Product.create(pickFields(req.body));
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const error = validateProduct(req.body);
    if (error) return res.status(400).json({ message: error });

    const product = await Product.findByIdAndUpdate(req.params.id, pickFields(req.body), { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
