require('./cron');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const createError = require('http-errors');
const config = require('./config/config');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const path = require('path');

// Import des routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const pairRoutes = require('./routes/pairRoutes');
const pairManagementRoutes = require('./routes/pairManagementRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const teamsRoutes = require('./routes/teamsRoutes');
const importRoutes = require('./routes/importRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Création de l'application Express
const app = express();

// Middleware de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuration CORS
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-Token'
    ],
    exposedHeaders: ['Set-Cookie', 'Authorization', 'X-Refresh-Token'],
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions)); // Use the CORS middleware with the defined options

// Middleware manuel pour autoriser Origin spécifique + credentials
app.use((req, res, next) => {
    const allowedOrigin = 'http://localhost:3000';
    const origin = req.headers.origin;
  
    if (origin === allowedOrigin) {
      res.header('Access-Control-Allow-Origin', allowedOrigin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    }
  
    next();
  });
  


// Documentation Swagger
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpecs, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'MY GODFATHER API Documentation'
    })
);

// Connexion à MongoDB
mongoose
    .connect(config.database.url, config.database.options)
    .then(() => console.log('✅ Connecté à MongoDB'))
    .catch(err => {
        console.error('❌ Erreur de connexion MongoDB:', err);
        process.exit(1);
    });

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/pairs', pairRoutes);
app.use('/api/pair-management', pairManagementRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/import', importRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/admin', adminRoutes);

// Route de test (health check)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'API opérationnelle',
        timestamp: new Date(),
        environment: process.env.NODE_ENV
    });
});

// Servir le frontend pour toutes les autres routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// Gestion des routes non trouvées
app.use((req, res, next) => {
    next(createError(404, 'Route non trouvée'));
});

// Import du gestionnaire d'erreurs global
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Démarrage du serveur
const PORT = config.server.port;
const server = app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`📝 Environnement: ${config.server.env}`);
    if (config.server.env === 'development') {
        console.log(`🔗 API accessible sur http://localhost:${PORT}`);
    }
});

// ──────────────────────────────────────────────────────────────────────────
// WebSocket (temporairement désactivé)
// const notificationService = require('./services/notificationService');
// const io = require('socket.io')(server, {
//   path: '/ws',
//   cors: corsOptions
// });
// notificationService.initializeWebSocket(io);
// ──────────────────────────────────────────────────────────────────────────

// Gestion des signaux d'arrêt (SIGTERM & SIGINT)
process.on('SIGTERM', () => {
    console.log('Signal SIGTERM reçu. Arrêt gracieux...');
    mongoose.connection
        .close()
        .then(() => {
            console.log('Connexion MongoDB fermée');
            process.exit(0);
        })
        .catch(err => {
            console.error('Erreur lors de la fermeture de MongoDB:', err);
            process.exit(1);
        });
});

process.on('SIGINT', () => {
    console.log('Signal SIGINT reçu. Arrêt gracieux...');
    mongoose.connection
        .close()
        .then(() => {
            console.log('Connexion MongoDB fermée');
            process.exit(0);
        })
        .catch(err => {
            console.error('Erreur lors de la fermeture de MongoDB:', err);
            process.exit(1);
        });
});

// Gestion des rejets de promesses non gérés
process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejet de promesse non géré:', reason);
});

// Gestion des exceptions non capturées
process.on('uncaughtException', error => {
    console.error('Exception non capturée:', error);
    mongoose.connection
        .close()
        .then(() => {
            console.log('Connexion MongoDB fermée');
            process.exit(1);
        })
        .catch(err => {
            console.error('Erreur lors de la fermeture de MongoDB:', err);
            process.exit(1);
        });
});
