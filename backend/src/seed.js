import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import StoreSettings from './models/StoreSettings.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Review from './models/Review.js';
import { imageByTitle } from './seedImages.js';

const products = [
  { title: 'Embroidered Lawn Suit 3-Piece', description: 'Soft cotton lawn with embroidered front and chiffon dupatta. Perfect for summer.', price: 4500, stock: 15, category: 'Clothes' },
  { title: 'Printed Lawn Suit 2-Piece', description: 'Light printed lawn shirt and trouser. Comfortable for daily wear.', price: 2800, stock: 20, category: 'Clothes' },
  { title: 'Red Cotton Kurta', description: 'Plain red cotton kurta with side slits. Sizes S, M, L.', price: 2500, stock: 12, category: 'Clothes' },
  { title: 'Black Khaddar Kurta', description: 'Warm khaddar kurta for winter, simple and classic.', price: 3200, stock: 10, category: 'Clothes' },
  { title: 'Glass Bangles Set (12 pcs)', description: 'Colorful glass bangles set, sold as a dozen. Ideal for Eid and weddings.', price: 800, stock: 40, category: 'Jewelry' },
  { title: 'Kundan Earrings', description: 'Traditional kundan jhumka earrings with golden finish.', price: 1500, stock: 25, category: 'Jewelry' },
  { title: 'Homemade Mango Achaar (500g)', description: 'Spicy homemade mango pickle in mustard oil. No preservatives.', price: 650, stock: 30, category: 'Food' },
  { title: 'Homemade Mixed Achaar (500g)', description: 'Mixed vegetable pickle made the traditional way.', price: 600, stock: 30, category: 'Food' },
  { title: 'Rose Face Cream', description: 'Hydrating rose face cream for all skin types, 50g jar.', price: 950, stock: 18, category: 'Cosmetics' },
].map((p) => ({ ...p, images: [imageByTitle[p.title]] }));

const run = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    StoreSettings.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Review.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('Test@1234', 10);

  const seller = await User.create({
    name: 'Store Owner', email: 'seller@test.com', phone: '03001234567', passwordHash, role: 'seller',
  });
  const customer = await User.create({
    name: 'Test Customer', email: 'customer@test.com', phone: '03111234567', passwordHash, role: 'customer',
  });

  await StoreSettings.create({
    storeName: 'DukaanDost Store',
    city: 'Faisalabad',
    whatsappNumber: '03001234567',
    deliveryPolicy:
      'Delivery in 2-3 days in Faisalabad, 3-5 days in other cities. Delivery charges are Rs 200 per order. Payment is Cash on Delivery only.',
    faqs: [
      { question: 'Do you offer Cash on Delivery?', answer: 'Yes, Cash on Delivery is available all over Pakistan.' },
      { question: 'Can I return a product?', answer: 'Yes, you can return a product within 3 days if it is unused and in original condition.' },
      { question: 'How can I track my order?', answer: 'Log in and open the My Orders page to see your order status.' },
      { question: 'Do you deliver to Lahore?', answer: 'Yes, delivery to Lahore takes 3-5 working days.' },
    ],
  });

  const created = await Product.insertMany(products);

  // One Delivered order so the customer can write a review (F06)
  const p = created[0];
  await Order.create({
    orderNumber: 'DD-SEED-0001',
    customer: customer._id,
    items: [{ product: p._id, title: p.title, price: p.price, quantity: 1 }],
    totalAmount: p.price,
    shippingAddress: { name: 'Test Customer', phone: '03111234567', city: 'Faisalabad', address: 'House 1, Street 2, Peoples Colony' },
    status: 'Delivered',
  });

  console.log('Seed complete');
  console.log(`Seller:   seller@test.com / Test@1234 (${seller._id})`);
  console.log('Customer: customer@test.com / Test@1234');
  console.log(`Products: ${created.length}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
