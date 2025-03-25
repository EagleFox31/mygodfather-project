const MentorMenteePair = require('../models/MentorMenteePair');
const User = require('../models/User');
const TeamsChat = require('../models/TeamsChat');
const Notification = require('../models/Notification');
const createError = require('http-errors');
const { validationResult } = require('express-validator');

class PairManagementController {
    /**
     * @desc    Obtenir toutes les paires avec filtres
     * @route   GET /api/pair-management
     * @access  Private (Admin, RH)
     */
    async getPairs(req, res, next) {
        try {
            const { 
                status, 
                mentorId, 
                menteeId, 
                service,
                startDate,
                endDate,
                page = 1,
                limit = 10,
                sort = 'created_at',
                order = 'desc'
            } = req.query;

            // Construire les filtres
            const filters = {};
            if (status) filters.status = status;
            if (mentorId) filters.mentor_id = mentorId;
            if (menteeId) filters.mentee_id = menteeId;
            if (startDate) filters.created_at = { $gte: new Date(startDate) };
            if (endDate) filters.created_at = { ...filters.created_at, $lte: new Date(endDate) };

            // Si un service est spécifié, filtrer par service du mentor ou mentoré
            if (service) {
                const usersInService = await User.find({ service }, '_id');
                const userIds = usersInService.map(u => u._id);
                filters.$or = [
                    { mentor_id: { $in: userIds } },
                    { mentee_id: { $in: userIds } }
                ];
            }

            // Options de pagination et tri
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: { [sort]: order === 'desc' ? -1 : 1 },
                populate: [
                    { path: 'mentor_id', select: 'name prenom email service fonction' },
                    { path: 'mentee_id', select: 'name prenom email service fonction' }
                ]
            };

            const pairs = await MentorMenteePair.paginate(filters, options);

            res.json({
                success: true,
                data: pairs.docs,
                pagination: {
                    total: pairs.totalDocs,
                    page: pairs.page,
                    pages: pairs.totalPages,
                    hasNext: pairs.hasNextPage,
                    hasPrev: pairs.hasPrevPage
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Créer une nouvelle paire manuellement
     * @route   POST /api/pair-management
     * @access  Private (Admin, RH)
     */
    async createPair(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                throw createError(400, 'Données invalides', { errors: errors.array() });
            }

            const { mentorId, menteeId, startDate, duration, objectives, notes } = req.body;

            // Vérifier que le mentor et le mentoré existent
            const [mentor, mentee] = await Promise.all([
                User.findById(mentorId),
                User.findById(menteeId)
            ]);

            if (!mentor || !mentee) {
                throw createError(404, 'Mentor ou mentoré non trouvé');
            }

            // Vérifier que le mentor est bien un mentor
            if (mentor.role !== 'mentor') {
                throw createError(400, 'L\'utilisateur sélectionné n\'est pas un mentor');
            }

            // Vérifier que le mentoré est bien un mentoré
            if (mentee.role !== 'mentee') {
                throw createError(400, 'L\'utilisateur sélectionné n\'est pas un mentoré');
            }

            // Vérifier que le mentor est disponible
            if (!mentor.disponibilite) {
                throw createError(400, 'Le mentor n\'est pas disponible');
            }

            // Vérifier que le mentoré n'a pas déjà un mentor actif
            const existingActivePair = await MentorMenteePair.findOne({
                mentee_id: menteeId,
                status: 'active'
            });

            if (existingActivePair) {
                throw createError(400, 'Le mentoré a déjà un mentor actif');
            }

            // Créer la paire
            const pair = await MentorMenteePair.create({
                mentor_id: mentorId,
                mentee_id: menteeId,
                start_date: startDate || new Date(),
                duration,
                objectives,
                notes,
                status: 'active',
                created_by: req.user.id
            });

            // Créer un canal Teams pour la paire
            const teamsChat = await TeamsChat.create({
                pair_id: pair._id,
                status: 'active'
            });

            // Notifier le mentor et le mentoré
            await Promise.all([
                Notification.create({
                    user_id: mentorId,
                    title: 'Nouveau mentoré assigné',
                    message: `Vous avez été assigné comme mentor de ${mentee.prenom} ${mentee.name}`,
                    type: 'info',
                    category: 'matching'
                }),
                Notification.create({
                    user_id: menteeId,
                    title: 'Nouveau mentor assigné',
                    message: `${mentor.prenom} ${mentor.name} a été assigné comme votre mentor`,
                    type: 'info',
                    category: 'matching'
                })
            ]);

            res.status(201).json({
                success: true,
                data: {
                    pair,
                    teamsChat
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Obtenir les détails d'une paire
     * @route   GET /api/pair-management/:id
     * @access  Private (Admin, RH)
     */
    async getPairDetails(req, res, next) {
        try {
            const { id } = req.params;

            const pair = await MentorMenteePair.findById(id)
                .populate('mentor_id', 'name prenom email service fonction')
                .populate('mentee_id', 'name prenom email service fonction')
                .populate('created_by', 'name prenom')
                .populate('updated_by', 'name prenom');

            if (!pair) {
                throw createError(404, 'Paire non trouvée');
            }

            // Obtenir les statistiques
            const stats = await Promise.all([
                TeamsChat.findOne({ pair_id: id }).select('messages_count last_activity'),
                MentorMenteePair.countDocuments({ mentor_id: pair.mentor_id, status: 'completed' })
            ]);

            res.json({
                success: true,
                data: {
                    pair,
                    stats: {
                        messages: stats[0] || { messages_count: 0 },
                        completed_mentorships: stats[1]
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Mettre à jour une paire
     * @route   PUT /api/pair-management/:id
     * @access  Private (Admin, RH)
     */
    async updatePair(req, res, next) {
        try {
            const { id } = req.params;
            const { status, endDate, objectives, notes } = req.body;

            const pair = await MentorMenteePair.findById(id);
            if (!pair) {
                throw createError(404, 'Paire non trouvée');
            }

            // Mettre à jour les champs
            if (status) pair.status = status;
            if (endDate) pair.end_date = endDate;
            if (objectives) pair.objectives = objectives;
            if (notes) pair.notes = notes;

            pair.updated_by = req.user.id;
            pair.updated_at = new Date();

            await pair.save();

            // Si le statut change, mettre à jour le canal Teams
            if (status) {
                await TeamsChat.findOneAndUpdate(
                    { pair_id: id },
                    { status: status === 'active' ? 'active' : 'archived' }
                );
            }

            res.json({
                success: true,
                data: pair
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Ajouter un feedback RH sur la paire
     * @route   POST /api/pair-management/:id/feedback
     * @access  Private (Admin, RH)
     */
    async addFeedback(req, res, next) {
        try {
            const { id } = req.params;
            const { rating, comment, areas, recommendations } = req.body;

            const pair = await MentorMenteePair.findById(id);
            if (!pair) {
                throw createError(404, 'Paire non trouvée');
            }

            const feedback = {
                given_by: req.user.id,
                rating,
                comment,
                areas,
                recommendations,
                created_at: new Date()
            };

            pair.feedback.push(feedback);
            await pair.save();

            res.json({
                success: true,
                data: feedback
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @desc    Terminer une relation de mentorat
     * @route   POST /api/pair-management/:id/end
     * @access  Private (Admin, RH)
     */
    async endMentorship(req, res, next) {
        try {
            const { id } = req.params;
            const { reason, endDate, feedback, recommendations } = req.body;

            const pair = await MentorMenteePair.findById(id)
                .populate('mentor_id', 'name prenom')
                .populate('mentee_id', 'name prenom');

            if (!pair) {
                throw createError(404, 'Paire non trouvée');
            }

            // Mettre à jour la paire
            pair.status = 'completed';
            pair.end_date = endDate || new Date();
            pair.end_reason = reason;
            pair.updated_by = req.user.id;
            pair.updated_at = new Date();

            if (feedback) {
                pair.feedback.push({
                    ...feedback,
                    given_by: req.user.id,
                    created_at: new Date()
                });
            }

            if (recommendations) {
                pair.recommendations = recommendations;
            }

            await pair.save();

            // Archiver le canal Teams
            await TeamsChat.findOneAndUpdate(
                { pair_id: id },
                { status: 'archived' }
            );

            // Notifier le mentor et le mentoré
            await Promise.all([
                Notification.create({
                    user_id: pair.mentor_id._id,
                    title: 'Mentorat terminé',
                    message: `Votre mentorat avec ${pair.mentee_id.prenom} ${pair.mentee_id.name} est terminé`,
                    type: 'info',
                    category: 'matching'
                }),
                Notification.create({
                    user_id: pair.mentee_id._id,
                    title: 'Mentorat terminé',
                    message: `Votre mentorat avec ${pair.mentor_id.prenom} ${pair.mentor_id.name} est terminé`,
                    type: 'info',
                    category: 'matching'
                })
            ]);

            res.json({
                success: true,
                data: pair
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PairManagementController();
