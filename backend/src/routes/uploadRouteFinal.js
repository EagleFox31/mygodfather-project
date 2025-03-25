const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadControllerFinal');

router.post('/excel', uploadController.upload, uploadController.uploadExcel);

module.exports = router;
