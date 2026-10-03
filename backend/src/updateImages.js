// One-time script: points existing products to the local images
// without deleting any data (orders, reviews and users stay).
// Run with: node src/updateImages.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';
import { imageByTitle } from './seedImages.js';

const run = async () => {
  await connectDB();
  let updated = 0;
  for (const [title, path] of Object.entries(imageByTitle)) {
    const result = await Product.updateOne({ title }, { images: [path] });
    updated += result.modifiedCount;
  }
  console.log(`Updated images of ${updated} products`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Update failed:', err);
  process.exit(1);
});
