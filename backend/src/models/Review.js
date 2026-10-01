import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true, trim: true },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Review', reviewSchema);
