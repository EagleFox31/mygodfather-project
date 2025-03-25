const multer = require('multer');
const path = require('path');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Controller function to handle Excel file upload
exports.uploadExcel = (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    // Process the uploaded file here (e.g., read and save to database)
    res.send('File uploaded successfully.');
};

// Export the upload middleware
exports.upload = upload.single('file');
