const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'api_doc_manager_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const register = async (data) => {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    const error = new Error('Email đã được sử dụng');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
  });

  const token = generateToken(user._id);

  return {
    user: { _id: user._id, name: user.name, email: user.email },
    token,
  };
};

const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    const error = new Error('Email hoặc mật khẩu không đúng');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: { _id: user._id, name: user.name, email: user.email },
    token,
  };
};

const getMe = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    const error = new Error('Không tìm thấy người dùng');
    error.statusCode = 404;
    throw error;
  }

  return { _id: user._id, name: user.name, email: user.email };
};

module.exports = { register, login, getMe };
