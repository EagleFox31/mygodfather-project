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

L'API expose les endpoints suivants :

- `/api/auth/*` - Authentification
- `/api/users/*` - Gestion utilisateurs
- `/api/matching/*` - Algorithme de matching
- `/api/pairs/*` - Gestion des paires
- `/api/sessions/*` - Sessions de mentorat
- `/api/admin/*` - Administration

Voir [API_ROUTES.md](docs/API_ROUTES.md) pour la documentation complète.

## 📊 Modèles de Données

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
