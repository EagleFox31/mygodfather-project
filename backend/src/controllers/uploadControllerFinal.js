const multer = require('multer');
const path = require('path');
const xlsx = require('xlsx');
const { matchMentorMentee } = require('../utils/matchingAlgorithmUpdated');

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

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Separate mentors and mentees based on criteria
    const mentors = data.filter(employee => employee['Ancienneté entreprise'] >= 3);
    const mentees = data.filter(employee => employee['Ancienneté entreprise'] < 3);

    // Apply matching algorithm
    const matches = matchMentorMentee(mentors, mentees);

    res.json({
        message: 'File processed successfully.',
        matches: matches
    });
};

// Export the upload middleware
exports.upload = upload.single('file');
