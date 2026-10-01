import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      title: String,
      price: Number,
      quantity: { type: Number, min: 1 },
    },
  ],
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  shippingAddress: { name: String, phone: String, city: String, address: String },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Order', orderSchema);
