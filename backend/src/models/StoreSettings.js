import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'My Store' },
  city: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  deliveryPolicy: { type: String, default: '' },
  faqs: [{ question: String, answer: String }],
});

export default mongoose.model('StoreSettings', settingsSchema);
