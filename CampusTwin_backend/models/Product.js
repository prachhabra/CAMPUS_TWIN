const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    category: {
      type: String,
      enum: ['Books', 'Electronics', 'Stationery', 'Hostel Essentials', 'Uniform/Clothing', 'Other'],
      default: 'Books',
      required: true
    },
    condition: {
      type: String,
      enum: ['New', 'Like New', 'Good', 'Fair'],
      default: 'Good',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    images: [
      {
        type: String
      }
    ],
    status: {
      type: String,
      enum: ['available', 'sold', 'reserved'],
      default: 'available'
    },
    contactPhone: {
      type: String,
      default: ''
    },
    contactEmail: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Product', productSchema);
