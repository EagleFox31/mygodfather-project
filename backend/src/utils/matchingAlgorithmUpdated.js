const matchMentorMentee = (mentors, mentees) => {
    const matches = [];

    mentees.forEach(mentee => {
        const eligibleMentors = mentors.filter(mentor => 
            mentor['Ancienneté entreprise'] >= 3 && // At least 3 years of experience
            Math.abs(mentor['Age du salarié en décembre 2024'] - mentee['Age du salarié en décembre 2024']) <= 10 && // Age difference not more than 10 years
            mentor.disponibilite !== false // Mentor is available
        );

        if (eligibleMentors.length > 0) {
            // Sort eligible mentors by experience
            const sortedMentors = eligibleMentors.sort((a, b) => b['Ancienneté entreprise'] - a['Ancienneté entreprise']);
            
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
                    nom: sortedMentors[0].Nom,
                    prenom: sortedMentors[0].Prénom,
                    age: sortedMentors[0]['Age du salarié en décembre 2024'],
                    fonction: sortedMentors[0].Fonction,
                    service: sortedMentors[0].Service,
                    anciennete: sortedMentors[0]['Ancienneté entreprise']
                }
            };
            
            matches.push(match);
            
            // Mark the selected mentor as unavailable
            sortedMentors[0].disponibilite = false;
        }
    });

    return matches;
};

module.exports = { matchMentorMentee };
