const MentoringSession = require('../models/MentoringSession');
const MentorMenteePair = require('../models/MentorMenteePair');
const NotificationService = require('./notificationService');
const TeamsService = require('./teamsService');

class SessionService {
    constructor() {
        this.reminderTimes = [
            { minutes: 1440, message: '24 heures' },  // 24h avant
            { minutes: 60, message: '1 heure' },      // 1h avant
            { minutes: 15, message: '15 minutes' }    // 15min avant
        ];
    }

    // Créer une nouvelle session
    async createSession(pairId, sessionData) {
        try {
            const pair = await MentorMenteePair.findById(pairId)
                .populate('mentor_id', 'name prenom email calendar_sync')
                .populate('mentee_id', 'name prenom email calendar_sync');

            if (!pair) {
                throw new Error('Paire mentor-mentoré non trouvée');
            }

            if (pair.status !== 'active') {
                throw new Error('Cette paire n\'est pas active');
            }

            // Créer la session
            const session = new MentoringSession({
                pair_id: pairId,
                date: sessionData.date,
                duration: sessionData.duration,
                topic: sessionData.topic,
                location: sessionData.location || 'Teams',
                objectives: sessionData.objectives || [],
                materials: sessionData.materials || []
            });

            await session.save();

            // Créer l'événement Teams si nécessaire
            if (session.location === 'Teams') {
                const teamsEvent = await TeamsService.createMeeting({
                    title: `Session de mentorat: ${pair.mentor_id.prenom} ${pair.mentor_id.name} - ${pair.mentee_id.prenom} ${pair.mentee_id.name}`,
                    startTime: session.date,
                    duration: session.duration,
                    participants: [pair.mentor_id.email, pair.mentee_id.email],
                    description: this.generateMeetingDescription(session)
                });

                session.teams_meeting_id = teamsEvent.id;
                session.teams_meeting_url = teamsEvent.joinUrl;
                await session.save();
            }

            // Planifier les notifications de rappel
            await this.scheduleReminders(session, pair);

            // Notifier les participants
            await NotificationService.notifyPair(
                pair.mentor_id._id,
                pair.mentee_id._id,
                'Nouvelle session planifiée',
                `Une session de mentorat est planifiée pour le ${new Date(session.date).toLocaleString()}`,
                'info',
                'session',
                session.teams_meeting_url
            );

            return session;
        } catch (error) {
            throw error;
        }
    }

    // Planifier les rappels
    async scheduleReminders(session, pair) {
        for (const reminder of this.reminderTimes) {
            const reminderDate = new Date(session.date);
            reminderDate.setMinutes(reminderDate.getMinutes() - reminder.minutes);

            // Programmer les rappels
            setTimeout(async () => {
                await NotificationService.notifyPair(
                    pair.mentor_id._id,
                    pair.mentee_id._id,
                    'Rappel de session',
                    `Votre session de mentorat commence dans ${reminder.message}`,
                    'info',
                    'session',
                    session.teams_meeting_url
                );
            }, reminderDate.getTime() - Date.now());
        }
    }

    // Mettre à jour le statut d'une session
    async updateSessionStatus(sessionId, status, feedback = null) {
        try {
            const session = await MentoringSession.findById(sessionId)
                .populate({
                    path: 'pair_id',
                    populate: {
                        path: 'mentor_id mentee_id',
                        select: 'name prenom email'
                    }
                });

            if (!session) {
                throw new Error('Session non trouvée');
            }

            const oldStatus = session.status;
            session.status = status;

            if (status === 'completed') {
                session.completed_at = new Date();

                if (feedback) {
                    session.feedback = session.feedback || [];
                    session.feedback.push({
                        ...feedback,
                        created_at: new Date()
                    });
                }

                // Demander un feedback aux participants
                await this.requestFeedback(session);
            } else if (status === 'cancelled') {
                session.cancelled_at = new Date();
                session.cancellation_reason = feedback?.reason;

                // Annuler la réunion Teams si elle existe
                if (session.teams_meeting_id) {
                    await TeamsService.cancelMeeting(session.teams_meeting_id);
                }
            }

            await session.save();

            // Notifier les participants du changement de statut
            const statusMessages = {
                completed: 'La session a été marquée comme terminée',
                cancelled: 'La session a été annulée',
                rescheduled: 'La session a été reportée'
            };

            if (statusMessages[status]) {
                await NotificationService.notifyPair(
                    session.pair_id.mentor_id._id,
                    session.pair_id.mentee_id._id,
                    'Mise à jour de la session',
                    statusMessages[status],
                    status === 'cancelled' ? 'warning' : 'info',
                    'session'
                );
            }

            return session;
        } catch (error) {
            throw error;
        }
    }

    // Demander un feedback après une session
    async requestFeedback(session) {
        const feedbackLink = `/feedback/session/${session._id}`;

        // Notifier le mentor
        await NotificationService.notifyUser(
            session.pair_id.mentor_id._id,
            'Feedback de session requis',
            'Merci de donner votre feedback sur la session qui vient de se terminer',
            'info',
            'session',
            feedbackLink
        );

        // Notifier le mentoré
        await NotificationService.notifyUser(
            session.pair_id.mentee_id._id,
            'Feedback de session requis',
            'Merci de donner votre feedback sur la session qui vient de se terminer',
            'info',
            'session',
            feedbackLink
        );
    }

    // Enregistrer un feedback
    async saveFeedback(sessionId, userId, feedbackData) {
        try {
            const session = await MentoringSession.findById(sessionId)
                .populate('pair_id');

            if (!session) {
                throw new Error('Session non trouvée');
            }

            // Vérifier que l'utilisateur fait partie de la session
            if (!session.pair_id.mentor_id.equals(userId) &&
                !session.pair_id.mentee_id.equals(userId)) {
                throw new Error('Vous n\'êtes pas autorisé à donner un feedback pour cette session');
            }

            const role = session.pair_id.mentor_id.equals(userId) ? 'mentor' : 'mentee';

            // Ajouter le feedback
            session.feedback = session.feedback || [];
            session.feedback.push({
                user_id: userId,
                role,
                rating: feedbackData.rating,
                categories: feedbackData.categories,
                positive_points: feedbackData.positive_points,
                areas_for_improvement: feedbackData.areas_for_improvement,
                next_session_topics: feedbackData.next_session_topics,
                comment: feedbackData.comment,
                created_at: new Date()
            });

            await session.save();

            return session;
        } catch (error) {
            throw error;
        }
    }

    // Générer la description de la réunion
    generateMeetingDescription(session) {
        let description = `Session de mentorat\n\n`;

        if (session.topic) {
            description += `📝 Sujet : ${session.topic}\n\n`;
        }

        if (session.objectives && session.objectives.length > 0) {
            description += `🎯 Objectifs :\n`;
            session.objectives.forEach(obj => {
                description += `- ${obj}\n`;
            });
            description += '\n';
        }

        if (session.materials && session.materials.length > 0) {
            description += `📚 Matériel à préparer :\n`;
            session.materials.forEach(mat => {
                description += `- ${mat}\n`;
            });
        }

        return description;
    }

    // Récupérer les sessions d'une paire
    async getPairSessions(pairId, filters = {}) {
        try {
            let query = { pair_id: pairId };

            if (filters.status) {
                query.status = filters.status;
            }
            if (filters.startDate) {
                query.date = { $gte: new Date(filters.startDate) };
            }
            if (filters.endDate) {
                query.date = { ...query.date, $lte: new Date(filters.endDate) };
            }

            const sessions = await MentoringSession.find(query)
                .sort({ date: filters.sort || 'desc' });

            return sessions;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new SessionService();