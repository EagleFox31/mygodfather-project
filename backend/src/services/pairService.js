const MentorMenteePair = require('../models/MentorMenteePair');
const User = require('../models/User');
const NotificationService = require('./notificationService');
const TeamsService = require('./teamsService');

class PairService {
    // Créer une nouvelle proposition de paire
    async proposePair(mentorId, menteeId, proposedBy) {
        try {
            // Vérifier si les utilisateurs existent
            const [mentor, mentee] = await Promise.all([
                User.findById(mentorId),
                User.findById(menteeId)
            ]);

            if (!mentor || !mentee) {
                throw new Error('Mentor ou mentoré non trouvé');
            }

            // Vérifier les rôles
            if (mentor.role !== 'mentor') {
                throw new Error('L\'utilisateur sélectionné n\'est pas un mentor');
            }
            if (mentee.role !== 'mentee') {
                throw new Error('L\'utilisateur sélectionné n\'est pas un mentoré');
            }

            // Vérifier si le mentor est disponible
            if (!mentor.disponibilite) {
                throw new Error('Le mentor n\'est pas disponible');
            }

            // Vérifier si une paire active existe déjà
            const existingPair = await MentorMenteePair.findOne({
                $or: [
                    { mentor_id: mentorId, status: 'active' },
                    { mentee_id: menteeId, status: 'active' }
                ]
            });

            if (existingPair) {
                throw new Error('Le mentor ou le mentoré est déjà dans une paire active');
            }

            // Créer la paire avec statut 'pending'
            const pair = new MentorMenteePair({
                mentor_id: mentorId,
                mentee_id: menteeId,
                status: 'pending',
                proposed_by: proposedBy
            });

            await pair.save();

            // Notifier les RH pour validation
            await NotificationService.notifyHR(
                'Nouvelle paire à valider',
                `Une nouvelle paire mentor-mentoré a été proposée : ${mentor.prenom} ${mentor.name} - ${mentee.prenom} ${mentee.name}`,
                'info',
                'matching',
                `/pairs/validate/${pair._id}`
            );

            return pair;
        } catch (error) {
            throw error;
        }
    }

    // Valider une paire par un RH
    async validatePair(pairId, validatedBy, approved = true) {
        try {
            const pair = await MentorMenteePair.findById(pairId)
                .populate('mentor_id', 'name prenom email')
                .populate('mentee_id', 'name prenom email');

            if (!pair) {
                throw new Error('Paire non trouvée');
            }

            if (pair.status !== 'pending') {
                throw new Error('Cette paire a déjà été traitée');
            }

            if (approved) {
                // Mettre à jour le statut de la paire
                pair.status = 'active';
                pair.validated_by = validatedBy;
                pair.validated_at = new Date();
                await pair.save();

                // Mettre à jour la disponibilité du mentor
                await User.findByIdAndUpdate(pair.mentor_id._id, { disponibilite: false });

                // Créer un canal Teams pour la paire
                const teamsChannel = await TeamsService.createMentorshipChannel(pair);

                // Notifier le mentor et le mentoré
                await NotificationService.notifyPair(
                    pair.mentor_id._id,
                    pair.mentee_id._id,
                    'Association mentor-mentoré validée',
                    'Votre association de mentorat a été validée par les RH',
                    'success',
                    'matching',
                    teamsChannel.url
                );
            } else {
                // Refuser la paire
                pair.status = 'rejected';
                pair.validated_by = validatedBy;
                pair.validated_at = new Date();
                await pair.save();

                // Notifier le proposant du refus
                await NotificationService.notifyUser(
                    pair.proposed_by,
                    'Association mentor-mentoré refusée',
                    `L'association entre ${pair.mentor_id.prenom} ${pair.mentor_id.name} et ${pair.mentee_id.prenom} ${pair.mentee_id.name} a été refusée`,
                    'warning',
                    'matching'
                );
            }

            return pair;
        } catch (error) {
            throw error;
        }
    }

    // Terminer une paire
    async endPair(pairId, reason) {
        try {
            const pair = await MentorMenteePair.findById(pairId)
                .populate('mentor_id', 'name prenom')
                .populate('mentee_id', 'name prenom');

            if (!pair) {
                throw new Error('Paire non trouvée');
            }

            if (pair.status !== 'active') {
                throw new Error('Cette paire n\'est pas active');
            }

            // Mettre à jour le statut de la paire
            pair.status = 'inactive';
            pair.end_date = new Date();
            pair.end_reason = reason;
            await pair.save();

            // Rendre le mentor à nouveau disponible
            await User.findByIdAndUpdate(pair.mentor_id._id, { disponibilite: true });

            // Archiver le canal Teams
            await TeamsService.archiveChannel(pair.teams_channel_id);

            // Notifier les participants
            await NotificationService.notifyPair(
                pair.mentor_id._id,
                pair.mentee_id._id,
                'Fin de la relation de mentorat',
                `Votre relation de mentorat a pris fin. Raison : ${reason}`,
                'info',
                'matching'
            );

            return pair;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer toutes les paires avec filtres
    async getPairs(filters = {}) {
        try {
            let query = {};

            if (filters.status) {
                query.status = filters.status;
            }
            if (filters.mentorId) {
                query.mentor_id = filters.mentorId;
            }
            if (filters.menteeId) {
                query.mentee_id = filters.menteeId;
            }

            const pairs = await MentorMenteePair.find(query)
                .populate('mentor_id', 'name prenom email')
                .populate('mentee_id', 'name prenom email')
                .sort({ created_at: -1 });

            return pairs;
        } catch (error) {
            throw error;
        }
    }

    // Obtenir les statistiques des paires
    async getPairStats() {
        try {
            const stats = await MentorMenteePair.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        avgDuration: {
                            $avg: {
                                $cond: [
                                    { $eq: ['$status', 'inactive'] },
                                    {
                                        $divide: [
                                            { $subtract: ['$end_date', '$created_at'] },
                                            1000 * 60 * 60 * 24 // Convertir en jours
                                        ]
                                    },
                                    null
                                ]
                            }
                        }
                    }
                }
            ]);

            return stats;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PairService();
