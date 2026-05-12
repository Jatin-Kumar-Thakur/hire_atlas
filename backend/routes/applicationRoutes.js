const express = require('express');
const multer  = require('multer');
const { body } = require('express-validator');

const router  = express.Router();
const auth     = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload   = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const {
  getAllApplications,
  createApplication,
  quickAddApplication,
  getApplicationStats,
  getApplicationById,
  updateApplication,
  deleteApplication,
  addInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
  exportApplications,
  importApplications,
} = require('../controllers/applicationController');

const VALID_STATUSES       = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Offer', 'Rejected', 'Ghosted'];
const VALID_SOURCES        = ['LinkedIn', 'Naukri', 'Internshala', 'Company Website', 'Referral', 'AngelList', 'Other'];
const VALID_ROUND_TYPES    = ['DSA', 'System Design', 'Technical', 'HR', 'Assignment', 'Culture Fit', 'Other'];
const VALID_ROUND_STATUSES = ['Pending', 'Cleared', 'Rejected'];

// Used by POST — company and role are required
const appValidation = [
  body('company').trim().notEmpty().withMessage('Company name is required')
    .isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),
  body('role').trim().notEmpty().withMessage('Job role is required')
    .isLength({ max: 100 }).withMessage('Role cannot exceed 100 characters'),
  body('source').optional().isIn(VALID_SOURCES).withMessage('Invalid source'),
  body('status').optional().isIn(VALID_STATUSES).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),
];

// Used by PUT — all fields optional (supports partial updates like status-only drag-drop)
const updateValidation = [
  body('company').optional().trim().notEmpty().withMessage('Company name cannot be empty')
    .isLength({ max: 100 }).withMessage('Company name cannot exceed 100 characters'),
  body('role').optional().trim().notEmpty().withMessage('Job role cannot be empty')
    .isLength({ max: 100 }).withMessage('Role cannot exceed 100 characters'),
  body('source').optional().isIn(VALID_SOURCES).withMessage('Invalid source'),
  body('status').optional().isIn(VALID_STATUSES).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 2000 }).withMessage('Notes cannot exceed 2000 characters'),
];

// Used by POST /:id/rounds
const roundValidation = [
  body('type').notEmpty().withMessage('Round type is required')
    .isIn(VALID_ROUND_TYPES).withMessage('Invalid round type'),
  body('date').notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Invalid date format'),
  body('status').optional().isIn(VALID_ROUND_STATUSES).withMessage('Invalid round status'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

// Used by PUT /:id/rounds/:roundId
const roundUpdateValidation = [
  body('type').optional().isIn(VALID_ROUND_TYPES).withMessage('Invalid round type'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('status').optional().isIn(VALID_ROUND_STATUSES).withMessage('Invalid round status'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

router.use(auth);

// Applications — fixed-segment routes must precede /:id
router.get('/stats',             getApplicationStats);
router.get('/export',            exportApplications);
router.post('/import',           upload.single('file'), importApplications);
router.post('/quick-add',        appValidation, validate, quickAddApplication);
router.get('/',                  getAllApplications);
router.post('/',                 appValidation,    validate, createApplication);
router.get('/:id',               getApplicationById);
router.put('/:id',               updateValidation, validate, updateApplication);
router.delete('/:id',            deleteApplication);

// Interview rounds
router.post('/:id/rounds',                roundValidation,       validate, addInterviewRound);
router.put('/:id/rounds/:roundId',        roundUpdateValidation, validate, updateInterviewRound);
router.delete('/:id/rounds/:roundId',     deleteInterviewRound);

module.exports = router;
