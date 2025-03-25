/**
 * Algorithme de correspondance Mentor-Mentoré avec critères flexibles
 * et suggestions multiples
 */

const matchMentorMentee = (mentors, mentees) => {
    const matches = [];
    const mentorWorkload = new Map(); // Suivi de la charge de mentorat

    // Configuration des critères et leurs poids
    const criteria = {
        anciennete: { weight: 20, min: 3 },
        ageDiff: { weight: 30, ideal: { min: 5, max: 10 }, max: 15 },
        service: { weight: 30 },
        workload: { weight: 20, max: 2 }
    };

    // Fonction pour calculer le score de compatibilité avec pourcentage
    const calculateCompatibilityScore = (mentor, mentee, relaxed = false) => {
        let score = 0;
        let maxPossibleScore = 0;
        const details = {};

        // Score basé sur l'ancienneté
        const ancienneteScore = Math.min(mentor['Ancienneté entreprise'] * 2, 20);
        score += ancienneteScore;
        maxPossibleScore += criteria.anciennete.weight;
        details.anciennete = {
            score: ancienneteScore,
            max: criteria.anciennete.weight,
            value: mentor['Ancienneté entreprise']
        };

        // Score basé sur l'écart d'âge
        const ageDiff = mentor['Age du salarié en décembre 2024'] - mentee['Age du salarié en décembre 2024'];
        let ageScore = 0;
        if (ageDiff > 0) { // Le mentor doit être plus âgé
            if (ageDiff >= criteria.ageDiff.ideal.min && ageDiff <= criteria.ageDiff.ideal.max) {
                ageScore = criteria.ageDiff.weight;
            } else if (relaxed && ageDiff <= criteria.ageDiff.max) {
                ageScore = criteria.ageDiff.weight * 0.5;
            }
        }
        score += ageScore;
        maxPossibleScore += criteria.ageDiff.weight;
        details.ageDiff = {
            score: ageScore,
            max: criteria.ageDiff.weight,
            value: ageDiff
        };

        // Score basé sur le service
        const serviceScore = mentor.Service === mentee.Service ? criteria.service.weight : 0;
        score += serviceScore;
        maxPossibleScore += criteria.service.weight;
        details.service = {
            score: serviceScore,
            max: criteria.service.weight,
            matching: mentor.Service === mentee.Service
        };

        // Score basé sur la charge de travail
        const currentWorkload = mentorWorkload.get(mentor.Nom) || 0;
        const workloadScore = Math.max(0, criteria.workload.weight - (currentWorkload * 10));
        score += workloadScore;
        maxPossibleScore += criteria.workload.weight;
        details.workload = {
            score: workloadScore,
            max: criteria.workload.weight,
            current: currentWorkload
        };

        // Calcul du pourcentage de compatibilité
        const percentage = Math.round((score / maxPossibleScore) * 100);

        return {
            score,
            percentage,
            details
        };
    };

    // Trier les mentorés par ancienneté (priorité aux plus récents)
    const sortedMentees = [...mentees].sort((a, b) => 
        a['Ancienneté entreprise'] - b['Ancienneté entreprise']
    );

    sortedMentees.forEach(mentee => {
        let mentorSuggestions = [];
        
        // Premier passage avec critères stricts
        mentors.forEach(mentor => {
            if (mentor['Ancienneté entreprise'] >= criteria.anciennete.min &&
                mentor['Age du salarié en décembre 2024'] > mentee['Age du salarié en décembre 2024'] &&
                (mentorWorkload.get(mentor.Nom) || 0) < criteria.workload.max) {
                
                const compatibility = calculateCompatibilityScore(mentor, mentee);
                if (compatibility.percentage >= 50) {
                    mentorSuggestions.push({
                        mentor,
                        compatibility
                    });
                }
            }
        });

        // Deuxième passage avec critères relaxés si aucun match trouvé
        if (mentorSuggestions.length === 0) {
            mentors.forEach(mentor => {
                if (mentor['Ancienneté entreprise'] >= criteria.anciennete.min &&
                    mentor['Age du salarié en décembre 2024'] > mentee['Age du salarié en décembre 2024']) {
                    
                    const compatibility = calculateCompatibilityScore(mentor, mentee, true);
                    if (compatibility.percentage >= 30) {
                        mentorSuggestions.push({
                            mentor,
                            compatibility
                        });
                    }
                }
            });
        }

        // Trier les suggestions par score de compatibilité
        mentorSuggestions.sort((a, b) => b.compatibility.percentage - a.compatibility.percentage);
        
        // Limiter à 3 suggestions maximum
        mentorSuggestions = mentorSuggestions.slice(0, 3);

        if (mentorSuggestions.length > 0) {
            const match = {
                mentee: {
                    nom: mentee.Nom,
                    prenom: mentee.Prénom,
                    age: mentee['Age du salarié en décembre 2024'],
                    fonction: mentee.Fonction,
                    service: mentee.Service,
                    anciennete: mentee['Ancienneté entreprise']
                },
                suggestions: mentorSuggestions.map(suggestion => ({
                    mentor: {
                        nom: suggestion.mentor.Nom,
                        prenom: suggestion.mentor.Prénom,
                        age: suggestion.mentor['Age du salarié en décembre 2024'],
                        fonction: suggestion.mentor.Fonction,
                        service: suggestion.mentor.Service,
                        anciennete: suggestion.mentor['Ancienneté entreprise']
                    },
                    compatibilite: {
                        percentage: suggestion.compatibility.percentage,
                        details: suggestion.compatibility.details
                    }
                }))
            };
            
            matches.push(match);
        }
    });

    return matches;
};

module.exports = { matchMentorMentee };
