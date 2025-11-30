const express = require('express');

const beneficiariesRouter = require('./beneficiaries');
const seedlingsRouter = require('./seedlings');
const cropStatusRouter = require('./cropStatus');
const farmPlotsRouter = require('./farmPlots');
const addressesRouter = require('./addresses');
const statisticsRouter = require('./statistics');
const authRouter = require('./auth');
const importRouter = require('./import');
const { authenticate, requireAdmin } = require('../utils/auth');

const router = express.Router();

// Public auth endpoints
router.use('/auth', authRouter);
router.use('/statistics', statisticsRouter);

// Protected admin API
router.use(authenticate, requireAdmin);
router.use('/beneficiaries', beneficiariesRouter);
router.use('/seedlings', seedlingsRouter);
router.use('/crop-status', cropStatusRouter);
router.use('/farm-plots', farmPlotsRouter);
router.use('/addresses', addressesRouter);
router.use('/import', importRouter);

module.exports = router;


