import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  address: String,
  city: String,
  state: String,
  country: String,
  zipCode: String,
  phone: String,
  email: String,
  costMultiplier: {
    type: Number,
    default: 1.0,
    min: 0.1
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Location', locationSchema);
