const matchMentorMentee = (mentors, mentees) => {
    const matches = [];

    mentees.forEach(mentee => {
        const eligibleMentors = mentors.filter(mentor => 
            mentor.anciennete >= 3 && // At least 3 years of experience
            Math.abs(mentor.age - mentee.age) <= 10 && // Age difference not more than 10 years
            mentor.disponibilite === true
        );

        if (eligibleMentors.length > 0) {
            // Sort eligible mentors by experience
            const sortedMentors = eligibleMentors.sort((a, b) => b.anciennete - a.anciennete);
            matches.push({
                mentee: mentee,
                mentor: sortedMentors[0] // Select the most experienced mentor
            });
            // Mark the selected mentor as unavailable
            sortedMentors[0].disponibilite = false;
        }
    });

    return matches;
};

module.exports = { matchMentorMentee };
