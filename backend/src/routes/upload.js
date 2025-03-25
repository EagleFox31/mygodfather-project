const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.post('/excel', uploadController.uploadExcel);

module.exports = router;
