const Import = require('../models/Import');
const User = require('../models/User');
const NotificationService = require('./notificationService');
const xlsx = require('xlsx');
const csv = require('csv-stringify/sync');
const bcrypt = require('bcryptjs');

class ImportService {
    // Importer des utilisateurs depuis un fichier Excel/CSV
    async importUsers(file, importedBy) {
        try {
            // Créer un enregistrement d'import
            const importLog = new Import({
                file_name: file.originalname,
                file_type: file.originalname.endsWith('.csv') ? 'csv' : 'excel',
                imported_by: importedBy,
                status: 'processing'
            });

            await importLog.save();

            // Lire le fichier
            const workbook = xlsx.read(file.buffer);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = xlsx.utils.sheet_to_json(worksheet);

            importLog.total_records = data.length;
            await importLog.save();

            // Traiter chaque ligne
            const results = await this.processRows(data, importLog);

            // Mettre à jour le log d'import
            importLog.processed_records = results.processed;
            importLog.failed_records = results.failed;
            importLog.status = results.failed === 0 ? 'completed' : 'completed_with_errors';
            importLog.completed_at = new Date();
            await importLog.save();

            // Notifier les résultats
            await this.notifyImportResults(importLog, results);

            // Générer le fichier d'erreurs si nécessaire
            if (results.errors.length > 0) {
                await this.generateErrorReport(importLog._id, results.errors);
            }

            return importLog;
        } catch (error) {
            console.error('Erreur lors de l\'import:', error);
            throw error;
        }
    }

    // Traiter les lignes du fichier
    async processRows(data, importLog) {
        const results = {
            processed: 0,
            failed: 0,
            errors: []
        };

        for (const [index, row] of data.entries()) {
            try {
                // Valider les données requises
                const validationError = this.validateRow(row);
                if (validationError) {
                    throw new Error(validationError);
                }

                // Vérifier si l'utilisateur existe déjà
                const existingUser = await User.findOne({ email: row.email });
                if (existingUser) {
                    throw new Error('Email déjà utilisé');
                }

                // Générer un mot de passe aléatoire
                const password = this.generatePassword();
                const hashedPassword = await bcrypt.hash(password, 10);

                // Créer l'utilisateur
                const user = new User({
                    email: row.email,
                    password: hashedPassword,
                    passwordVisible: password, // Pour l'admin
                    name: row.name,
                    prenom: row.prenom,
                    age: row.age,
                    service: row.service,
                    fonction: row.fonction,
                    anciennete: row.anciennete,
                    role: row.role.toLowerCase()
                });

                await user.save();
                results.processed++;

                // Notifier l'utilisateur de son compte
                await NotificationService.notifyNewUser(user, password);

            } catch (error) {
                results.failed++;
                results.errors.push({
                    row: index + 2, // +2 car Excel commence à 1 et il y a l'en-tête
                    data: row,
                    error: error.message
                });

                // Ajouter l'erreur au log d'import
                importLog.error_log.push({
                    row: index + 2,
                    error: error.message
                });
                await importLog.save();
            }

            // Mettre à jour le nombre d'enregistrements traités
            importLog.processed_records = results.processed;
            await importLog.save();
        }

        return results;
    }

    // Valider une ligne de données
    validateRow(row) {
        const requiredFields = ['email', 'name', 'prenom', 'age', 'service', 'fonction', 'anciennete', 'role'];
        const missingFields = requiredFields.filter(field => !row[field]);
        
        if (missingFields.length > 0) {
            return `Champs requis manquants: ${missingFields.join(', ')}`;
        }

        if (!this.isValidEmail(row.email)) {
            return 'Format d\'email invalide';
        }

        if (!['admin', 'rh', 'mentor', 'mentee'].includes(row.role.toLowerCase())) {
            return 'Rôle invalide';
        }

        if (isNaN(row.age) || row.age < 18 || row.age > 100) {
            return 'Âge invalide';
        }

        if (isNaN(row.anciennete) || row.anciennete < 0) {
            return 'Ancienneté invalide';
        }

        return null;
    }

    // Générer un mot de passe aléatoire
    generatePassword() {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        return password;
    }

    // Vérifier si un email est valide
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Générer un rapport d'erreurs en CSV
    async generateErrorReport(importId, errors) {
        try {
            const csvData = errors.map(error => ({
                Ligne: error.row,
                Email: error.data.email || '',
                Nom: error.data.name || '',
                Prenom: error.data.prenom || '',
                Erreur: error.error
            }));

            const csvContent = csv.stringify(csvData, { header: true });
            
            // Sauvegarder le fichier d'erreurs
            const errorReport = {
                import_id: importId,
                content: csvContent,
                created_at: new Date()
            };

            // Vous pouvez sauvegarder ce rapport dans un nouveau modèle ErrorReport
            // ou l'attacher directement à l'import

            return errorReport;
        } catch (error) {
            console.error('Erreur lors de la génération du rapport:', error);
            throw error;
        }
    }

    // Notifier les résultats de l'import
    async notifyImportResults(importLog, results) {
        const message = `Import terminé:\n
- Total: ${importLog.total_records} enregistrements
- Traités avec succès: ${results.processed}
- Échecs: ${results.failed}
${results.failed > 0 ? '\nUn rapport d\'erreurs a été généré.' : ''}`;

        await NotificationService.notifyUser(
            importLog.imported_by,
            'Résultats de l\'import',
            message,
            results.failed > 0 ? 'warning' : 'success',
            'import'
        );

        // Si des erreurs, notifier les RH
        if (results.failed > 0) {
            await NotificationService.notifyHR(
                'Import avec erreurs',
                `L'import par ${importLog.imported_by.prenom} ${importLog.imported_by.name} contient ${results.failed} erreurs.`,
                'warning',
                'import'
            );
        }
    }

    // Récupérer l'historique des imports
    async getImportHistory(filters = {}) {
        try {
            let query = {};

            if (filters.status) {
                query.status = filters.status;
            }
            if (filters.imported_by) {
                query.imported_by = filters.imported_by;
            }
            if (filters.startDate) {
                query.created_at = { $gte: new Date(filters.startDate) };
            }
            if (filters.endDate) {
                query.created_at = { 
                    ...query.created_at,
                    $lte: new Date(filters.endDate)
                };
            }

            return await Import.find(query)
                .sort({ created_at: -1 })
                .populate('imported_by', 'name prenom');
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ImportService();
