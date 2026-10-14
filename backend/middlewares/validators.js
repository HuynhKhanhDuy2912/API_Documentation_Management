const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map((e) => e.msg),
    });
  }

  next();
};

const validateProject = [
  body('name')
    .notEmpty().withMessage('Tên project là bắt buộc')
    .trim(),
  body('baseUrl')
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ require_protocol: true })
    .withMessage('Base URL không hợp lệ (VD: https://api.example.com/v1)'),
  body('description')
    .optional()
    .trim(),
  handleValidation,
];

const validateApiDoc = [
  body('name')
    .notEmpty().withMessage('Tên API là bắt buộc')
    .trim(),
  body('url')
    .notEmpty().withMessage('URL là bắt buộc')
    .trim(),
  body('method')
    .notEmpty().withMessage('Method là bắt buộc')
    .isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    .withMessage('Method phải là GET, POST, PUT, PATCH hoặc DELETE'),
  body('description')
    .optional()
    .trim(),
  body('headers')
    .optional()
    .isArray().withMessage('Headers phải là mảng'),
  body('headers.*.key')
    .optional()
    .notEmpty().withMessage('Header key không được để trống'),
  body('requestParams')
    .optional()
    .isArray().withMessage('Request Params phải là mảng'),
  body('requestParams.*.name')
    .optional()
    .notEmpty().withMessage('Tên trường request param không được để trống'),
  body('requestBody')
    .optional()
    .isArray().withMessage('Request Body phải là mảng'),
  body('requestBody.*.name')
    .optional()
    .notEmpty().withMessage('Tên trường request body không được để trống'),
  body('response')
    .optional()
    .isArray().withMessage('Response phải là mảng'),
  body('response.*.name')
    .optional()
    .notEmpty().withMessage('Tên trường response không được để trống'),
  handleValidation,
];

const validateRegister = [
  body('name')
    .notEmpty().withMessage('Tên hiển thị là bắt buộc')
    .trim(),
  body('email')
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('confirmPassword')
    .notEmpty().withMessage('Xác nhận mật khẩu là bắt buộc')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      return true;
    }),
  handleValidation,
];

const validateLogin = [
  body('email')
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ'),
  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc'),
  handleValidation,
];

module.exports = {
  validateProject,
  validateApiDoc,
  validateRegister,
  validateLogin,
};

