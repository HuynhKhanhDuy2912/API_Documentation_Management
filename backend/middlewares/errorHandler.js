const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Xử lý lỗi validation từ Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);

    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: messages,
    });
  }

  // Xử lý lỗi CastError (ID không đúng định dạng ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID không đúng định dạng',
    });
  }

  // Lỗi chung
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi server',
  });
};

module.exports = errorHandler;
