const express = require('express');
const multer = require('multer');
const ImportController = require('../controllers/importController');

const router = express.Router();

// Configure multer for memory storage (file will be in buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(xlsx|xls|csv)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files (.xlsx, .xls) are allowed.'));
    }
  }
});

// Clean and draft endpoint (Step 1: Generate clean Excel for review)
router.post('/clean', upload.single('file'), ImportController.cleanAndDraft);

// Bulk import endpoint (preview)
router.post('/bulk', upload.single('file'), ImportController.bulkImport);

// Farm coordinates import endpoint (preview)
router.post('/farm-coordinates', upload.single('file'), ImportController.importFarmCoordinates);

// Confirm import endpoint (final import after user review)
router.post('/confirm', ImportController.confirmImport);

module.exports = router;
