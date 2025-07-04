import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name must contain only letters, spaces, hyphens, and apostrophes'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name must contain only letters, spaces, hyphens, and apostrophes'),
  body('cookiesAccepted')
    .isBoolean()
    .withMessage('Cookie acceptance must be specified'),
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateGameBuild = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Build name is required and must be less than 255 characters'),
  body('version')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Version is required and must be less than 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('externalUrl')
    .optional()
    .isURL()
    .withMessage('External URL must be a valid URL'),
];

export const validateMessagePost = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content is required and must be less than 5000 characters'),
  body('parentId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parent ID must be a positive integer'),
];

export const validateBugReport = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description is required and must be less than 2000 characters'),
  body('priority')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Priority must be low, medium, high, or critical'),
  body('build_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Build ID must be a positive integer'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('assigned_to')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Assigned to must be a positive integer'),
];

export const validateReview = [
  body('build_id')
    .isInt({ min: 1 })
    .withMessage('Build ID is required and must be a positive integer'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Feedback is required and must be less than 1000 characters'),
];

export const validatePlaytestSession = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('build_id')
    .isInt({ min: 1 })
    .withMessage('Build ID is required and must be a positive integer'),
  body('scheduled_date')
    .isISO8601()
    .withMessage('Scheduled date must be a valid ISO 8601 date'),
  body('duration_minutes')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('max_participants')
    .isInt({ min: 1, max: 50 })
    .withMessage('Max participants must be between 1 and 50'),
];

export const validateFinanceTransaction = [
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('category')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category is required and must be less than 100 characters'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Description is required and must be less than 200 characters'),
  body('justification')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Justification is required and must be less than 500 characters'),
];

export const validateBudget = [
  body('category')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Category is required and must be less than 100 characters'),
  body('allocated')
    .isFloat({ min: 0 })
    .withMessage('Allocated amount must be a positive number'),
  body('period')
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Period must be monthly, quarterly, or yearly'),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};