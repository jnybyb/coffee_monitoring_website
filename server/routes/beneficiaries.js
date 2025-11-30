const express = require('express');
const BeneficiaryController = require('../controllers/beneficiaryController');
const BaseController = require('../controllers/baseController');

const router = express.Router();

// Generate beneficiary ID
router.get('/generate-id', BaseController.asyncHandler(BeneficiaryController.generateBeneficiaryId));

// Generate multiple beneficiary IDs
router.post('/generate-ids', BaseController.asyncHandler(BeneficiaryController.generateMultipleBeneficiaryIds));

// List beneficiaries
router.get('/', BaseController.asyncHandler(BeneficiaryController.listBeneficiaries));

// Get beneficiary by ID
router.get('/:id', BaseController.asyncHandler(BeneficiaryController.getBeneficiary));

// Create beneficiary
router.post('/', BeneficiaryController.getUploadMiddleware(), BaseController.asyncHandler(BeneficiaryController.createBeneficiary));

// Update beneficiary
router.put('/:id', BeneficiaryController.getUploadMiddleware(), BaseController.asyncHandler(BeneficiaryController.updateBeneficiary));

// Delete beneficiary
router.delete('/:id', BaseController.asyncHandler(BeneficiaryController.deleteBeneficiary));

module.exports = router;


