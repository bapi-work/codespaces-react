import mongoose from 'mongoose';

const assetTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['hardware', 'software', 'accessory', 'office_equipment', 'vehicle']
  },
  customFields: [{
    fieldName: String,
    fieldType: {
      type: String,
      enum: ['text', 'number', 'date', 'select', 'checkbox'],
      default: 'text'
    },
    isRequired: Boolean,
    options: [String] // For select fields
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('AssetType', assetTypeSchema);
