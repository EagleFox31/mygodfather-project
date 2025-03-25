const importService = require('../services/importService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

class ImportController {
    /**
     * @desc    Importer des utilisateurs depuis un fichier
     * @route   POST /api/import/users
     * @access  Private (Admin, RH)
     */
    async importUsers(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const { file } = req;
            const importedBy = req.user.id;

            const result = await importService.importUsers(file, importedBy);

            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir l'historique des imports
     * @route   GET /api/import/history
     * @access  Private (Admin, RH)
     */
    async getImportHistory(req, res, next) {
        try {
            const history = await importService.getImportHistory();

            res.json({
                success: true,
                data: history
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Télécharger le template d'import
     * @route   GET /api/import/template
     * @access  Private (Admin, RH)
     */
    async downloadTemplate(req, res, next) {
        try {
            const template = await importService.downloadTemplate();

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename=template.xlsx');
            res.send(template);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Valider un fichier d'import
     * @route   POST /api/import/validate
     * @access  Private (Admin, RH)
     */
    async validateFile(req, res, next) {
        try {
            const { file } = req;
            const validationResult = await importService.validateFile(file);

            res.json({
                success: true,
                data: validationResult
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ImportController();
