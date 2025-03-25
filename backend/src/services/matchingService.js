const MatchingLog = require('../models/MatchingLog');
const User = require('../models/User');
const NotificationService = require('./notificationService');

class MatchingService {
    constructor() {
        // Critères de matching par défaut
        this.defaultCriteria = {
            anciennete: {
                weight: 0.4,
                minDiff: 3, // Différence minimale d'ancienneté
                maxDiff: 15 // Différence maximale d'ancienneté
            },
            age: {
                weight: 0.3,
                minDiff: 5, // Différence minimale d'âge
                maxDiff: 20 // Différence maximale d'âge
            },
            service: {
                weight: 0.3,
                sameService: true // Préférence pour le même service
            }
        };

        this.criteria = { ...this.defaultCriteria };
    }

    // Mettre à jour les critères de matching
    updateCriteria(newCriteria) {
        this.criteria = {
            anciennete: { ...this.criteria.anciennete, ...newCriteria.anciennete },
            age: { ...this.criteria.age, ...newCriteria.age },
            service: { ...this.criteria.service, ...newCriteria.service }
        };

        // Normaliser les poids
        const totalWeight = this.criteria.anciennete.weight + 
                          this.criteria.age.weight + 
                          this.criteria.service.weight;

        this.criteria.anciennete.weight /= totalWeight;
        this.criteria.age.weight /= totalWeight;
        this.criteria.service.weight /= totalWeight;

        return this.criteria;
    }

    // Réinitialiser les critères par défaut
    resetCriteria() {
        this.criteria = { ...this.defaultCriteria };
        return this.criteria;
    }

    // Calculer le score de compatibilité entre un mentor et un mentoré
    calculateCompatibilityScore(mentor, mentee) {
        let score = 0;

        // Score basé sur l'ancienneté
        const ancienneteDiff = Math.abs(mentor.anciennete - mentee.anciennete);
        if (ancienneteDiff >= this.criteria.anciennete.minDiff && 
            ancienneteDiff <= this.criteria.anciennete.maxDiff) {
            score += this.criteria.anciennete.weight * 
                    (1 - (ancienneteDiff - this.criteria.anciennete.minDiff) / 
                    (this.criteria.anciennete.maxDiff - this.criteria.anciennete.minDiff));
        }

        // Score basé sur l'âge
        const ageDiff = Math.abs(mentor.age - mentee.age);
        if (ageDiff >= this.criteria.age.minDiff && 
            ageDiff <= this.criteria.age.maxDiff) {
            score += this.criteria.age.weight * 
                    (1 - (ageDiff - this.criteria.age.minDiff) / 
                    (this.criteria.age.maxDiff - this.criteria.age.minDiff));
        }

        // Score basé sur le service
        if (!this.criteria.service.sameService || mentor.service === mentee.service) {
            score += this.criteria.service.weight;
        }

        return Math.round(score * 100); // Convertir en pourcentage
    }

    // Générer des suggestions de matching pour un mentoré
    async generateSuggestions(menteeId) {
        try {
            const mentee = await User.findById(menteeId);
            if (!mentee) {
                throw new Error('Mentoré non trouvé');
            }

            // Récupérer tous les mentors disponibles
            const mentors = await User.find({
                role: 'mentor',
                disponibilite: true,
                deletedAt: null
            });

            // Calculer les scores de compatibilité
            const suggestions = mentors.map(mentor => ({
                mentorId: mentor._id,
                compatibilityScore: this.calculateCompatibilityScore(mentor, mentee),
                details: {
                    anciennete: Math.abs(mentor.anciennete - mentee.anciennete),
                    ageDiff: Math.abs(mentor.age - mentee.age),
                    service: mentor.service === mentee.service
                }
            }));

            // Trier par score de compatibilité
            suggestions.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

            // Enregistrer les suggestions
            const matchingLog = new MatchingLog({
                menteeId: menteeId,
                suggestions: suggestions
            });
            await matchingLog.save();

            // Notifier les RH des nouvelles suggestions
            await NotificationService.notifyHR(
                'Nouvelles suggestions de matching',
                `${suggestions.length} suggestions générées pour ${mentee.prenom} ${mentee.name}`,
                'info',
                'matching'
            );

            return matchingLog;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer les suggestions de matching pour un mentoré
    async getSuggestions(menteeId) {
        try {
            const matchingLog = await MatchingLog.findOne({ menteeId })
                .sort({ createdAt: -1 })
                .populate('suggestions.mentorId', 'name prenom age service fonction anciennete');

            if (!matchingLog) {
                return [];
            }

            return matchingLog.suggestions;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer l'historique des matchings pour un mentoré
    async getMatchingHistory(menteeId) {
        try {
            return await MatchingLog.find({ menteeId })
                .sort({ 'suggestions.createdAt': -1 })
                .populate('menteeId', 'name prenom')
                .populate('suggestions.mentorId', 'name prenom');
        } catch (error) {
            throw error;
        }
    }

    // Récupérer les statistiques de matching
    async getMatchingStats() {
        try {
            const stats = await MatchingLog.aggregate([
                {
                    $unwind: '$suggestions'
                },
                {
                    $group: {
                        _id: null,
                        totalSuggestions: { $sum: 1 },
                        averageScore: { $avg: '$suggestions.compatibilityScore' },
                        highScoreMatches: {
                            $sum: {
                                $cond: [
                                    { $gte: ['$suggestions.compatibilityScore', 80] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            return stats[0] || {
                totalSuggestions: 0,
                averageScore: 0,
                highScoreMatches: 0
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new MatchingService();
