const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    // Tên project
    name: {
      type: String,
      required: [true, 'Tên project là bắt buộc'],
      trim: true,
    },

    // Mô tả project
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
