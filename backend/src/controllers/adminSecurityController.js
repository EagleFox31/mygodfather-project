const fs = require('fs');
const path = require('path');
const Backup = require('../models/Backup');
const securityService = require('../services/admin/securityService');
const { validationResult } = require('express-validator');
const createError = require('http-errors');

class AdminSecurityController {
    /**
     * @desc    Créer une sauvegarde et l'enregistrer en base
     * @route   POST /api/admin/backup
     * @access  Private (Admin)
     */
    async createBackup(req, res, next) {
        try {
            // 📦 Créer la sauvegarde via `securityService`
            const backupPath = await securityService.createBackup();
            const filename = path.basename(backupPath); // Extraire le nom du fichier

            // 📏 Récupérer automatiquement la taille du fichier
            const stats = fs.statSync(backupPath);
            const fileSize = stats.size; // Taille en octets

            // 💾 Enregistrer la sauvegarde en base de données
            const backup = await Backup.create({
                filename,
                size: fileSize,
                status: 'success'
            });

            res.json({
                success: true,
                message: '✅ Sauvegarde créée avec succès',
                data: backup
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Restaurer une sauvegarde
     * @route   POST /api/admin/restore/:backupId
     * @access  Private (Admin)
     */
    async restoreBackup(req, res, next) {
        try {
            const { backupId } = req.params;

            // ✅ Vérifier si la sauvegarde existe
            const backup = await Backup.findById(backupId);
            if (!backup) {
                throw createError(404, '❌ Sauvegarde introuvable');
            }

            // 🛠 Restaurer la sauvegarde (en utilisant `filename` stocké en base)
            const result = await securityService.restoreBackup(backup.filename);

            res.json({
                success: true,
                message: '🔄 Sauvegarde restaurée avec succès',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Récupérer la liste des sauvegardes
     * @route   GET /api/admin/backups
     * @access  Private (Admin)
     */
    async getBackups(req, res, next) {
        try {
            // 📋 Récupérer toutes les sauvegardes, triées par date de création (la plus récente en premier)
            const backups = await Backup.find()
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                data: backups
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir les statistiques des sauvegardes
     * @route   GET /api/admin/backups/stats
     * @access  Private (Admin)
     */
    async getBackupStats(req, res, next) {
        try {
            // 🔢 Compter le nombre total de sauvegardes
            const count = await Backup.countDocuments({ status: 'success' });

            // 📅 Récupérer la dernière sauvegarde
            const latestBackup = await Backup.findOne({ status: 'success' })
                .sort({ createdAt: -1 });

            // 📊 Calculer la taille totale des sauvegardes
            const sizeResult = await Backup.aggregate([
                { $match: { status: 'success' } },
                { $group: { _id: null, totalSize: { $sum: '$size' } } }
            ]);

            const totalSize = sizeResult.length > 0 ? sizeResult[0].totalSize : 0;
            const latest = latestBackup ?
                new Date(latestBackup.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'Aucune';

            res.json({
                success: true,
                data: {
                    count,
                    latest,
                    totalSize
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Télécharger une sauvegarde
     * @route   GET /api/admin/backups/:id/download
     * @access  Private (Admin)
     */
    async downloadBackup(req, res, next) {
        try {
            const { id } = req.params;

            // ✅ Vérifier si la sauvegarde existe
            const backup = await Backup.findById(id);
            if (!backup) {
                throw createError(404, '❌ Sauvegarde introuvable');
            }

            // 📂 Construire le chemin complet du fichier de sauvegarde
            const backupPath = path.join(backup.path, backup.filename);

            // ✅ Vérifier si le fichier existe
            if (!fs.existsSync(backupPath)) {
                throw createError(404, '❌ Fichier de sauvegarde introuvable sur le système');
            }

            // 📤 Envoyer le fichier avec le bon type MIME et en incitant au téléchargement
            res.setHeader('Content-Disposition', `attachment; filename=${backup.filename}`);
            res.setHeader('Content-Type', 'application/gzip');

            // 📚 Créer un stream de lecture et l'envoyer comme réponse
            const fileStream = fs.createReadStream(backupPath);
            fileStream.pipe(res);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Supprimer une sauvegarde
     * @route   DELETE /api/admin/backups/:id
     * @access  Private (Admin)
     */
    async deleteBackup(req, res, next) {
        try {
            const { id } = req.params;

            // ✅ Vérifier si la sauvegarde existe
            const backup = await Backup.findById(id);
            if (!backup) {
                throw createError(404, '❌ Sauvegarde introuvable');
            }

            // 📂 Construire le chemin complet du fichier de sauvegarde
            const backupPath = path.join(backup.path, backup.filename);

            // 🗑️ Supprimer le fichier physique si possible
            try {
                if (fs.existsSync(backupPath)) {
                    fs.unlinkSync(backupPath);
                }
            } catch (fileError) {
                console.error('Erreur lors de la suppression du fichier physique:', fileError);
                // On continue même si la suppression du fichier échoue
            }

            // 🗑️ Supprimer l'entrée en base de données
            await Backup.findByIdAndDelete(id);

            res.json({
                success: true,
                message: '🗑️ Sauvegarde supprimée avec succès'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir les logs de sécurité
     * @route   GET /api/admin/security/logs
     * @access  Private (Admin)
     */
    async getSecurityLogs(req, res, next) {
        try {
            const logs = await securityService.getSecurityLogs();

            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Mettre à jour la politique de sécurité
     * @route   PUT /api/admin/security/policy
     * @access  Private (Admin)
     */
    async updateSecurityPolicy(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const policy = req.body;
            const updatedBy = req.user.id;

            const result = await securityService.updateSecurityPolicy(policy, updatedBy);

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AdminSecurityController();
