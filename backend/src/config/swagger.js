const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MY GODFATHER API Documentation',
      version: '1.0.0',
      description: `Documentation API pour l'application de mentorat MY GODFATHER.
      
Pour utiliser l'API :
1. Authentifiez-vous avec POST /api/auth/login
2. Utilisez le token JWT reçu dans le header Authorization: Bearer <token>`,
    },
    servers: [
      {
        url: `http://localhost:${config.server.port}`,
        description: `Serveur ${config.server.env}`,
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
