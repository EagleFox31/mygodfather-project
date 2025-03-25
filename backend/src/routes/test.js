const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Test route for file upload
router.post('/test-upload', uploadController.upload, (req, res) => {
    res.send('Test file uploaded successfully.');
});

module.exports = router;
