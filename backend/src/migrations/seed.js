const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const User = require('../models/User');
const Service = require('../models/Service');
const MentorMenteePair = require('../models/MentorMenteePair');
const MentoringSession = require('../models/MentoringSession');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const TeamsChat = require('../models/TeamsChat');

async function seedDatabase() {
    try {
        // 🔄 Connexion à la base de données
        await mongoose.connect(config.database.url, config.database.options);
        console.log('🌟 Connexion à la base de données établie');

        // 🧹 Nettoyage de la base de données
        await Promise.all([
            User.deleteMany({}),
            Service.deleteMany({}),
            MentorMenteePair.deleteMany({}),
            MentoringSession.deleteMany({}),
            Message.deleteMany({}),
            Notification.deleteMany({}),
            TeamsChat.deleteMany({})
        ]);
        console.log('🧹 Base de données nettoyée');

        // 🏢 Création des services
        const services = await Service.insertMany([
            { name: 'Développement', code: 'DEV', description: 'Équipe de développement logiciel' },
            { name: 'Design', code: 'DES', description: 'Équipe de design et UX' },
            { name: 'Marketing', code: 'MKT', description: 'Équipe marketing et communication' },
            { name: 'RH', code: 'RH', description: 'Ressources humaines' },
            { name: 'Finance', code: 'FIN', description: 'Équipe finance et comptabilité' }
        ]);
        console.log('🏢 Services créés');

        if (!services.length) {
            throw new Error("❌ Erreur : Aucun service n'a été inséré.");
        }

        // 👥 Création des utilisateurs
        const password = await bcrypt.hash('Password123!', 10);

        const [admin, rh, ...mentors] = await User.insertMany([
            {
                email: 'admin@godfather.com',
                password,
                name: 'Admin',
                prenom: 'System',
                age: 35,
                service: services[3]._id,
                fonction: 'Administrateur système',
                anciennete: 5,
                role: 'admin'
            },
            {
                email: 'rh@godfather.com',
                password,
                name: 'Dubois',
                prenom: 'Marie',
                age: 32,
                service: services[3]._id,
                fonction: 'Responsable RH',
                anciennete: 4,
                role: 'rh'
            },
            {
                email: 'mentor1@godfather.com',
                password,
                name: 'Martin',
                prenom: 'Pierre',
                age: 45,
                service: services[0]._id,
                fonction: 'Lead Developer',
                anciennete: 8,
                role: 'mentor',
                disponibilite: true
            }
        ]);

        const mentees = await User.insertMany([
            {
                email: 'mentee1@godfather.com',
                password,
                name: 'Leroy',
                prenom: 'Julie',
                age: 25,
                service: services[0]._id,
                fonction: 'Développeur Junior',
                anciennete: 0,
                role: 'mentee'
            }
        ]);

        console.log('👥 Utilisateurs créés');

        // 🤝 Création des paires mentor-mentoré
        const pairs = await MentorMenteePair.insertMany([
            {
                mentor_id: mentors[0]?._id,
                mentee_id: mentees[0]?._id,
                status: 'active',
                validated_by: rh?._id,
                validated_at: new Date(),
                start_date: new Date()
            }
        ]);
        console.log('🤝 Paires créées');

        // 📅 Création des sessions
        await MentoringSession.insertMany([
            {
                pair_id: pairs[0]?._id,
                date: new Date(Date.now() + 24 * 60 * 60 * 1000),
                duration: 60,
                status: 'scheduled',
                topic: 'Revue de code et bonnes pratiques',
                location: 'Teams'
            }
        ]);
        console.log('📅 Sessions créées');

        // 💬 Création des messages
        await Message.insertMany([
            {
                sender_id: mentors[0]?._id,
                receiver_id: mentees[0]?._id,
                content: 'Bonjour Julie, comment se passe votre intégration ?',
                status: 'read',
                created_at: new Date()
            }
        ]);
        console.log('💬 Messages créés');

        // 🔔 Création des notifications
        await Notification.insertMany([
            {
                user_id: mentees[0]?._id,
                title: 'Nouvelle session planifiée',
                message: 'Une session a été planifiée avec votre mentor',
                type: 'info',
                category: 'session', // <-- Ajout de la catégorie
                status: 'unread',
                created_at: new Date()
            }
        ]);
        console.log('🔔 Notifications créées');

        // 👥 Création des canaux Teams
        await TeamsChat.insertMany([
            {
                pair_id: pairs[0]?._id || new mongoose.Types.ObjectId(),
                teams_channel_id: `CH-${new mongoose.Types.ObjectId()}`,
                teams_chat_id: `CT-${new mongoose.Types.ObjectId()}`,
                status: 'active',
                last_activity: new Date(),
                messages_count: 15
            }
        ]);
        console.log('👥 Canaux Teams créés');

        console.log('✅ Données de test créées avec succès !');

        // **✅ Fermeture propre de la connexion**
        await mongoose.connection.close();
        console.log('🔌 Connexion MongoDB fermée.');
    } catch (error) {
        console.error('❌ Erreur lors du seeding :', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedDatabase();
