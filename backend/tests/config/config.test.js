const { validateConfig, schemas } = require('../../src/config/validator');
const config = require('../../src/config/config');

describe('Configuration', () => {
    describe('Validation de la configuration complète', () => {
        it('devrait valider une configuration correcte', () => {
            expect(() => validateConfig(config)).not.toThrow();
        });

        it('devrait détecter les champs manquants', () => {
            const invalidConfig = { ...config };
            delete invalidConfig.database;

            expect(() => validateConfig(invalidConfig)).toThrow(/database.*required/);
        });
    });

    describe('Validation de la base de données', () => {
        it('devrait valider une URL MongoDB valide', () => {
            const { error } = schemas.database.validate({
                url: 'mongodb://localhost:27017/godfather',
                options: {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }
            });
            expect(error).toBeUndefined();
        });

        it('devrait rejeter une URL invalide', () => {
            const { error } = schemas.database.validate({
                url: 'invalid-url',
                options: {}
            });
            expect(error).toBeDefined();
        });
    });

    describe('Validation JWT', () => {
        it('devrait valider une configuration JWT correcte', () => {
            const { error } = schemas.jwt.validate({
                secret: 'un-secret-suffisamment-long-pour-etre-securise',
                expiresIn: '24h'
            });
            expect(error).toBeUndefined();
        });

        it('devrait rejeter un secret trop court', () => {
            const { error } = schemas.jwt.validate({
                secret: 'court',
                expiresIn: '24h'
            });
            expect(error).toBeDefined();
        });

        it('devrait valider différents formats d\'expiration', () => {
            const validExpirations = ['60m', '24h', '7d', '1w', '1y'];
            validExpirations.forEach(exp => {
                const { error } = schemas.jwt.validate({
                    secret: 'un-secret-suffisamment-long-pour-etre-securise',
                    expiresIn: exp
                });
                expect(error).toBeUndefined();
            });
        });
    });

    describe('Validation de la sécurité', () => {
        it('devrait valider une configuration de sécurité correcte', () => {
            const { error } = schemas.security.validate({
                bcryptSaltRounds: 12,
                rateLimitWindow: 15,
                rateLimitMax: 100
            });
            expect(error).toBeUndefined();
        });

        it('devrait rejeter un nombre de rounds bcrypt invalide', () => {
            const { error } = schemas.security.validate({
                bcryptSaltRounds: 5,
                rateLimitWindow: 15,
                rateLimitMax: 100
            });
            expect(error).toBeDefined();
        });
    });

    describe('Validation du matching', () => {
        it('devrait valider une configuration de matching correcte', () => {
            const { error } = schemas.matching.validate({
                minMentorAge: 30,
                minMentorAnciennete: 3,
                maxMenteesPerMentor: 3,
                matchingThreshold: 0.7
            });
            expect(error).toBeUndefined();
        });

        it('devrait rejeter un seuil de matching invalide', () => {
            const { error } = schemas.matching.validate({
                minMentorAge: 30,
                minMentorAnciennete: 3,
                maxMenteesPerMentor: 3,
                matchingThreshold: 1.5
            });
            expect(error).toBeDefined();
        });
    });

    describe('Validation des sessions', () => {
        it('devrait valider une configuration de session correcte', () => {
            const { error } = schemas.sessions.validate({
                minDuration: 15,
                maxDuration: 180,
                reminderDelay: 24
            });
            expect(error).toBeUndefined();
        });

        it('devrait rejeter une durée minimale invalide', () => {
            const { error } = schemas.sessions.validate({
                minDuration: 5,
                maxDuration: 180,
                reminderDelay: 24
            });
            expect(error).toBeDefined();
        });
    });

    describe('Validation des uploads', () => {
        it('devrait valider une configuration d\'upload correcte', () => {
            const { error } = schemas.uploads.validate({
                directory: 'uploads',
                maxFileSize: 5242880,
                allowedTypes: ['image/jpeg', 'application/pdf']
            });
            expect(error).toBeUndefined();
        });

        it('devrait rejeter une taille de fichier négative', () => {
            const { error } = schemas.uploads.validate({
                directory: 'uploads',
                maxFileSize: -1,
                allowedTypes: ['image/jpeg']
            });
            expect(error).toBeDefined();
        });
    });

    describe('Validation des notifications', () => {
        it('devrait valider une configuration de notification correcte', () => {
            const { error } = schemas.notifications.validate({
                defaultChannels: ['email', 'web'],
                retentionDays: 30
            });
            expect(error).toBeUndefined();
        });

        it('devrait rejeter une rétention négative', () => {
            const { error } = schemas.notifications.validate({
                defaultChannels: ['email'],
                retentionDays: -1
            });
            expect(error).toBeDefined();
        });
    });
});
