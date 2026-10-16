const { body, validationResult } = require('express-validator');

const extractPathParameterNames = (url = '') => {
  const names = new Set();
  const pattern = /(?:\/:([A-Za-z_][A-Za-z0-9_]*)|\{([A-Za-z_][A-Za-z0-9_]*)\})/g;
  const routePath = String(url).split(/[?#]/, 1)[0];

  for (const match of routePath.matchAll(pattern)) {
    names.add(match[1] || match[2]);
  }

  return names;
};

const validateRequestParameterLocations = (parameters, { req }) => {
  const requestParams = Array.isArray(parameters) ? parameters : [];
  const pathNames = extractPathParameterNames(req.body?.url);
  const declaredPathNames = new Set();
  const seen = new Set();

  for (const parameter of requestParams) {
    if (!parameter || !['path', 'query'].includes(parameter.in) || !parameter.name) continue;

    const name = String(parameter.name).trim();
    const key = `${parameter.in}:${name}`;
    if (seen.has(key)) {
      throw new Error(`Tham số ${name} bị khai báo trùng trong ${parameter.in}`);
    }
    seen.add(key);

    if (parameter.in === 'path') {
      declaredPathNames.add(name);
      if (parameter.required !== true) {
        throw new Error(`Path parameter ${name} phải được đánh dấu bắt buộc`);
      }
    }
  }

  const missingPathNames = [...pathNames].filter((name) => !declaredPathNames.has(name));
  if (missingPathNames.length > 0) {
    throw new Error(`Thiếu khai báo path parameter: ${missingPathNames.join(', ')}`);
  }

  const unusedPathNames = [...declaredPathNames].filter((name) => !pathNames.has(name));
  if (unusedPathNames.length > 0) {
    throw new Error(`Path parameter không có trong URL: ${unusedPathNames.join(', ')}`);
  }

  return true;
};

const validateArrayItemField = (items, fieldName, itemLabel, fieldLabel = fieldName) => {
  if (!Array.isArray(items)) return true;

  const invalidIndex = items.findIndex(
    (item) => !item || typeof item[fieldName] !== 'string' || !item[fieldName].trim()
  );

  if (invalidIndex !== -1) {
    throw new Error(`${itemLabel} thứ ${invalidIndex + 1}: ${fieldLabel} không được để trống`);
  }

  return true;
};

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
    .isArray().withMessage('Headers phải là mảng')
    .bail()
    .custom((items) => validateArrayItemField(items, 'key', 'Header'))
    .custom((items) => validateArrayItemField(items, 'value', 'Header')),
  body('requestParams')
    .custom((value) => value === undefined || Array.isArray(value))
    .withMessage('Request Params phải là mảng')
    .bail()
    .custom(validateRequestParameterLocations)
    .custom((items) => validateArrayItemField(items, 'name', 'Request parameter', 'Tên trường')),
  body('requestParams.*.in')
    .trim()
    .notEmpty().withMessage('Vị trí parameter phải là path hoặc query')
    .isIn(['path', 'query']).withMessage('Vị trí parameter phải là path hoặc query'),
  body('requestParams.*.required')
    .isBoolean().withMessage('Trạng thái bắt buộc của parameter phải là boolean'),
  body('requestBody')
    .optional()
    .isArray().withMessage('Request Body phải là mảng')
    .bail()
    .custom((items) => validateArrayItemField(items, 'name', 'Request body', 'Tên trường')),
  body('response')
    .optional()
    .isArray().withMessage('Response phải là mảng')
    .bail()
    .custom((items) => validateArrayItemField(items, 'name', 'Response field', 'Tên trường')),
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

