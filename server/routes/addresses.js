const express = require('express');
const AddressController = require('../controllers/addressController');

const router = express.Router();

// Get all provinces
router.get('/provinces', AddressController.getProvinces);

// Get municipalities by province
router.get('/municipalities/:province', AddressController.getMunicipalities);

// Get barangays by province and municipality
router.get('/barangays/:province/:municipality', AddressController.getBarangays);

// Get all municipalities with their barangays for a specific province
router.get('/municipalities-with-barangays/:province', AddressController.getMunicipalitiesWithBarangays);

// Sync all Philippine address data (admin only)
router.post('/sync', AddressController.syncAllAddresses);

module.exports = router;