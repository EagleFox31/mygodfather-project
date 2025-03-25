const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const fs = require('fs');
const path = require('path');
const importController = require('../controllers/importController');
const { auth } = require('../middleware/auth');
const { roleAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const multer = require('multer');

/**
 * @swagger
 * tags:
 *   name: Import
 *   description: 📥 Gestion des imports de données
 */

// 📂 Vérifier et créer le dossier uploads si nécessaire
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 📂 Configuration de Multer pour l'upload sécurisé
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('❌ Format de fichier non supporté. Utilisez Excel (.xlsx) ou CSV.'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// 🛑 Middleware de gestion des erreurs Multer
const handleMulterErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: `Erreur Multer : ${err.message}` });
    } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
};

// 🔒 Middleware d'authentification
router.use(auth);
// 🔑 Middleware de rôle pour restreindre aux RH et Admins
router.use(roleAuth(['admin', 'rh']));

/**
 * @swagger
 * /api/import/users:
 *   post:
 *     summary: 📥 Importer des utilisateurs depuis un fichier Excel/CSV
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 📄 Fichier Excel (.xlsx) ou CSV
 *               options:
 *                 type: object
 *                 properties:
 *                   updateExisting:
 *                     type: boolean
 *                     description: 🔄 Mettre à jour les utilisateurs existants
 *                   sendNotifications:
 *                     type: boolean
 *                     description: 📧 Envoyer des notifications aux utilisateurs
 *     responses:
 *       200:
 *         description: ✅ Import réussi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 importId:
 *                   type: string
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     created:
 *                       type: integer
 *                     updated:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *       400:
 *         description: ❌ Erreur de validation ou fichier invalide
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux admin et RH
 */
router.post('/users', [
    upload.single('file'),
    handleMulterErrors,
    body('options').optional().isObject().withMessage('❌ Les options doivent être un objet'),
    body('options.updateExisting').optional().isBoolean().withMessage('❌ updateExisting doit être un booléen'),
    body('options.sendNotifications').optional().isBoolean().withMessage('❌ sendNotifications doit être un booléen')
], validateRequest, importController.importUsers);

/**
 * @swagger
 * /api/import/history:
 *   get:
 *     summary: 📜 Obtenir l'historique des imports
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 📄 Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: 🔢 Nombre d'éléments par page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *         description: 🔄 Filtrer par statut
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 📅 Date de début
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 📅 Date de fin
 *     responses:
 *       200:
 *         description: ✅ Historique récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imports:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Import'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux admin et RH
 */
router.get('/history', [
    query('page').optional().isInt({ min: 1 }).withMessage('❌ Page invalide'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('❌ Limite invalide'),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed']).withMessage('❌ Statut invalide'),
    query('startDate').optional().isISO8601().withMessage('❌ Date de début invalide'),
    query('endDate').optional().isISO8601().withMessage('❌ Date de fin invalide')
], validateRequest, importController.getImportHistory);

/**
 * @swagger
 * /api/import/template:
 *   get:
 *     summary: 📥 Télécharger le template d'import
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ✅ Template téléchargé avec succès
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux admin et RH
 */
router.get('/template', importController.downloadTemplate);

/**
 * @swagger
 * /api/import/validate:
 *   post:
 *     summary: ✅ Valider un fichier d'import sans l'exécuter
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 📄 Fichier à valider
 *               options:
 *                 type: object
 *                 description: ⚙️ Options de validation
 *     responses:
 *       200:
 *         description: ✅ Validation réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       row:
 *                         type: integer
 *                       column:
 *                         type: string
 *                       message:
 *                         type: string
 *       400:
 *         description: ❌ Fichier invalide
 *       401:
 *         description: 🔒 Non autorisé
 *       403:
 *         description: 🚫 Accès refusé - Réservé aux admin et RH
 */
router.post('/validate', [
    upload.single('file'),
    handleMulterErrors,
    body('options').optional().isObject().withMessage('❌ Les options doivent être un objet')
], validateRequest, importController.validateFile);

/**
 * @swagger
 * components:
 *   schemas:
 *     Import:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: 🔑 ID unique de l'import
 *         filename:
 *           type: string
 *           description: 📄 Nom du fichier importé
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           description: 🔄 Statut de l'import
 *         type:
 *           type: string
 *           description: 📑 Type de données importées
 *         options:
 *           type: object
 *           description: ⚙️ Options utilisées pour l'import
 *         summary:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *             created:
 *               type: integer
 *             updated:
 *               type: integer
 *             failed:
 *               type: integer
 *           description: 📊 Résumé de l'import
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *           description: ❌ Liste des erreurs rencontrées
 *         createdBy:
 *           type: string
 *           description: 👤 ID de l'utilisateur ayant lancé l'import
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de création
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: 📅 Date de fin
 */

module.exports = router;
