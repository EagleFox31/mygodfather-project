/**
 * Algorithme de correspondance Mentor-Mentoré
 * Critères de matching :
 * 1. Ancienneté minimale de 3 ans pour les mentors
 * 2. Le mentor doit être plus âgé que le mentoré
 * 3. Écart d'âge optimal entre 5 et 10 ans
 * 4. Priorité au même service pour une meilleure compréhension du métier
 * 5. Charge de mentorat limitée (max 2 mentorés par mentor)
 */

const matchMentorMentee = (mentors, mentees) => {
    const matches = [];
    const mentorWorkload = new Map(); // Suivi de la charge de mentorat

    // Fonction pour calculer le score de compatibilité
    const calculateCompatibilityScore = (mentor, mentee) => {
        let score = 0;

        // Score basé sur l'ancienneté (plus d'expérience = meilleur score)
        score += mentor['Ancienneté entreprise'] * 2;

        // Score basé sur l'écart d'âge (optimal entre 5 et 10 ans)
        const ageDiff = mentor['Age du salarié en décembre 2024'] - mentee['Age du salarié en décembre 2024'];
        if (ageDiff >= 5 && ageDiff <= 10) {
            score += 10;
        } else if (ageDiff > 0 && ageDiff < 5) {
            score += 5;
        }

        // Bonus si même service
        if (mentor.Service === mentee.Service) {
            score += 15;
        }

        // Malus si le mentor a déjà beaucoup de mentorés
        const currentWorkload = mentorWorkload.get(mentor.Nom) || 0;
        score -= currentWorkload * 5;

        return score;
    };

    // Trier les mentorés par ancienneté (priorité aux plus récents)
    const sortedMentees = [...mentees].sort((a, b) => 
        a['Ancienneté entreprise'] - b['Ancienneté entreprise']
    );

    sortedMentees.forEach(mentee => {
        // Filtrer les mentors éligibles
        const eligibleMentors = mentors.filter(mentor => 
            mentor['Ancienneté entreprise'] >= 3 && // Au moins 3 ans d'expérience
            mentor['Age du salarié en décembre 2024'] > mentee['Age du salarié en décembre 2024'] && // Le mentor doit être plus âgé
            mentor['Age du salarié en décembre 2024'] - mentee['Age du salarié en décembre 2024'] <= 10 && // Écart d'âge max 10 ans
            (mentorWorkload.get(mentor.Nom) || 0) < 2 && // Max 2 mentorés par mentor
            mentor.disponibilite !== false // Mentor disponible
        );

        if (eligibleMentors.length > 0) {
            // Trier les mentors par score de compatibilité
            const sortedMentors = eligibleMentors
                .map(mentor => ({
                    mentor,
                    score: calculateCompatibilityScore(mentor, mentee)
                }))
                .sort((a, b) => b.score - a.score);

            const selectedMentor = sortedMentors[0].mentor;
            
            const match = {
                mentee: {
                    nom: mentee.Nom,
                    prenom: mentee.Prénom,
                    age: mentee['Age du salarié en décembre 2024'],
                    fonction: mentee.Fonction,
                    service: mentee.Service,
                    anciennete: mentee['Ancienneté entreprise']
                },
                mentor: {
                    nom: selectedMentor.Nom,
                    prenom: selectedMentor.Prénom,
                    age: selectedMentor['Age du salarié en décembre 2024'],
                    fonction: selectedMentor.Fonction,
                    service: selectedMentor.Service,
                    anciennete: selectedMentor['Ancienneté entreprise']
                },
                compatibilite: {
                    score: sortedMentors[0].score,
                    memeService: selectedMentor.Service === mentee.Service,
                    ecartAge: selectedMentor['Age du salarié en décembre 2024'] - mentee['Age du salarié en décembre 2024']
                }
            };
            
            matches.push(match);
            
            // Mettre à jour la charge de mentorat
            const currentWorkload = mentorWorkload.get(selectedMentor.Nom) || 0;
            mentorWorkload.set(selectedMentor.Nom, currentWorkload + 1);
        }
    });

    return matches;
};

module.exports = { matchMentorMentee };
