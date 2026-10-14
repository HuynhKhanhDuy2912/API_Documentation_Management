const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên project là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    baseUrl: {
      type: String,
      trim: true,
      default: '',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project phải thuộc về một User'],
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ userId: 1 });
projectSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Project', projectSchema);
