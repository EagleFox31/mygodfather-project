# MY GODFATHER - Backend

Plateforme de mentorat automatisé pour l'intégration des nouvelles recrues.

## 📋 Vue d'ensemble

MY GODFATHER est une plateforme web et mobile qui révolutionne l'intégration des nouvelles recrues en :
- Automatisant le processus de mentorat
- Facilitant le matching mentor/mentoré
- Intégrant Microsoft Teams
- Fournissant un dashboard analytique
- Assurant la conformité RGPD

## 🏗 Architecture

Le backend est structuré en plusieurs couches :

```
Services → Controllers → Routes → API
   ↓
Models → Database
```

### Services Principaux

1. **Core Services**
   - Authentication
   - Users
   - Matching
   - Sessions
   - Messaging

2. **Admin Services**
   - Configuration
   - Security
   - Audit

3. **Statistics Services**
   - Aggregation
   - Reporting
   - Alerts

Voir [ARCHITECTURE.md](docs/ARCHITECTURE.md) pour plus de détails.

## 🔄 Interactions entre Services

Les services communiquent entre eux de manière modulaire :

```
AuthService ←→ UserService
     ↓
MatchingService → PairService
     ↓
SessionService → TeamsService
```

Voir [SERVICE_INTERACTIONS.md](docs/SERVICE_INTERACTIONS.md) pour plus de détails.

## 🛣 Routes API

### Statistics Services
- **GET** `/api/statistics/dashboard`: Retrieves statistics for the dashboard.
- **POST** `/api/statistics/reports`: Generates a statistical report based on specified parameters.
- **GET** `/api/statistics/alerts`: Retrieves statistical alerts.
- **GET** `/api/statistics/matching-distribution`: Retrieves the distribution of matching scores.
- **POST** `/api/statistics/export`: Exports statistical data in a specified format.


### Authentication
- **POST** `/api/auth/login`: Authenticates a user and returns a JWT token.
- **POST** `/api/auth/register`: Registers a new user.
- **POST** `/api/auth/refresh`: Refreshes the access token.
- **POST** `/api/auth/reset-password`: Initiates a password reset process.
- **GET** `/api/auth/status`: Checks if the user is authenticated.

### User Management
- **GET** `/api/users`: Retrieves a list of users with optional filtering and pagination.
- **POST** `/api/users`: Creates a new user.
- **GET** `/api/users/profile`: Retrieves the authenticated user's profile.
- **PUT** `/api/users/profile`: Updates the authenticated user's profile.
- **GET** `/api/users/{id}`: Retrieves a user by their ID.
- **PUT** `/api/users/notifications/preferences`: Updates the user's notification preferences.
- **PUT** `/api/users/disponibilite`: Updates the availability status for mentors.
- **PATCH** `/api/users/complete-onboarding`: Marks the onboarding process as complete for the user.


L'API expose les endpoints suivants :

- `/api/auth/*` - Authentification
- `/api/users/*` - Gestion utilisateurs
- `/api/matching/*` - Algorithme de matching
- `/api/pairs/*` - Gestion des paires
- `/api/sessions/*` - Sessions de mentorat
- `/api/admin/*` - Administration

Voir [API_ROUTES.md](docs/API_ROUTES.md) pour la documentation complète.

## 📊 Modèles de Données

## 🌐 Frontend Features
1. **Dashboard Mentor**: Displays statistics, upcoming sessions, and a list of mentees.
2. **Home Authenticated**: Shows user-specific statistics, recent notifications, and quick action buttons based on user roles.
3. **Home Page**: Manages routing, theme, and language preferences, and displays features of the application.


Les principales entités sont :

- `User`
- `MentorMenteePair`
- `MentoringSession`
- `MatchingLog`
- `Message`
- `TeamsChat`

Voir [DATA_MODELS.md](docs/DATA_MODELS.md) pour les schémas détaillés.

## ⚙️ Configuration

### Prérequis

- Node.js >= 14.0.0
- MongoDB >= 4.4.0
- npm >= 6.14.0

### Installation

```bash
# Installation des dépendances
npm install

# Configuration
cp .env.example .env
nano .env

# Démarrage
npm run dev
```

Voir [SETUP.md](docs/SETUP.md) pour les instructions détaillées.

## 🚀 Déploiement

### Production

```bash
# Build
npm run build

# Start avec PM2
pm2 start ecosystem.config.js --env production
```

### Docker

```bash
# Build
docker build -t godfather-api .

# Run
docker run -p 3000:3000 godfather-api
```

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Couverture
npm run coverage
```

## 📝 Documentation API

La documentation Swagger est disponible à `/api-docs` en développement.

## 🔒 Sécurité

- Authentication JWT
- Refresh tokens
- Rate limiting
- CORS configuré
- Validation des données
- Logs d'audit
- Backups automatisés

## 🛠 Maintenance

### Logs

```bash
# Application logs
tail -f logs/app.log

# PM2 logs
pm2 logs godfather-api
```

### Backups

```bash
# Backup manuel
npm run db:backup

# Restauration
npm run db:restore <backup_file>
```

## 📈 Monitoring

- Dashboard PM2 : `pm2 monit`
- Métriques système
- Alertes configurables
- Rapports périodiques

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE.md](LICENSE.md) pour plus de détails.

## 📞 Support

Pour toute question ou problème :
1. Consulter la [documentation](docs/)
2. Ouvrir une issue
3. Contacter l'équipe support

## ✨ Fonctionnalités à Venir

- [ ] Intégration Google Calendar
- [ ] Application mobile
- [ ] IA pour améliorer le matching
- [ ] Gamification du mentorat
- [ ] Analytics avancés

## 🙏 Remerciements

- Équipe de développement
- Contributeurs
- Testeurs
- Utilisateurs pilotes
