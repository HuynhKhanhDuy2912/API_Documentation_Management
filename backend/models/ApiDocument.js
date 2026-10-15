const mongoose = require('mongoose');

const headerSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const requestFieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, trim: true, default: 'String' },
    description: { type: String, trim: true, default: '' },
    required: { type: Boolean, default: false },
    example: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const requestParameterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    in: { type: String, enum: ['path', 'query'] },
    type: { type: String, trim: true, default: 'String' },
    description: { type: String, trim: true, default: '' },
    required: { type: Boolean, default: false },
    example: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const responseFieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, trim: true, default: 'String' },
    description: { type: String, trim: true, default: '' },
    example: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const apiDocumentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'API phải thuộc về một Project'],
    },
    name: {
      type: String,
      required: [true, 'Tên API là bắt buộc'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL là bắt buộc'],
      trim: true,
    },
    method: {
      type: String,
      required: [true, 'Method là bắt buộc'],
      enum: {
        values: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        message: 'Method phải là GET, POST, PUT, PATCH hoặc DELETE',
      },
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    headers: {
      type: [headerSchema],
      default: [],
    },
    requestParams: {
      type: [requestParameterSchema],
      default: [],
    },
    requestBody: {
      type: [requestFieldSchema],
      default: [],
    },
    response: {
      type: [responseFieldSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

apiDocumentSchema.index({ projectId: 1 });

module.exports = mongoose.model('ApiDocument', apiDocumentSchema);
