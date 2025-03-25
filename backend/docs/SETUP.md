# Configuration et Déploiement MY GODFATHER

## Prérequis

```bash
# Versions requises
Node.js >= 14.0.0
MongoDB >= 4.4.0
npm >= 6.14.0

# Dépendances globales
npm install -g nodemon
npm install -g pm2
```

## Structure des Dossiers

```
backend/
├── src/
│   ├── config/          # Configuration
│   ├── controllers/     # Contrôleurs
│   ├── middleware/      # Middlewares
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Routes API
│   ├── services/       # Services métier
│   │   ├── admin/      # Services admin
│   │   └── statistics/ # Services stats
│   └── utils/          # Utilitaires
├── docs/              # Documentation
├── uploads/          # Fichiers uploadés
└── backups/         # Sauvegardes DB
```

## Variables d'Environnement

```env
# .env
# Base de données
MONGODB_URI=mongodb://localhost:27017/godfather
MONGODB_TEST_URI=mongodb://localhost:27017/godfather_test

# JWT
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Microsoft Teams
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
TEAMS_TEAM_ID=your-team-id

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# Serveur
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Sécurité
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Logs
LOG_LEVEL=debug
LOG_FILE=logs/app.log

# Backups
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
```

## Installation

```bash
# Cloner le projet
git clone https://github.com/your-org/godfather.git
cd godfather/backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
nano .env

# Initialiser la base de données
npm run db:init

# Lancer en développement
npm run dev

# Lancer les tests
npm test
```

## Scripts NPM

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest --coverage",
    "lint": "eslint src/",
    "db:init": "node scripts/init-db.js",
    "db:seed": "node scripts/seed-db.js",
    "db:backup": "node scripts/backup-db.js",
    "db:restore": "node scripts/restore-db.js"
  }
}
```

## Déploiement Production

### 1. Préparation

```bash
# Installer PM2
npm install -g pm2

# Construire pour production
npm run build

# Configurer les variables d'environnement
nano .env.production
```

### 2. Configuration Nginx

```nginx
server {
    listen 80;
    server_name api.godfather.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'godfather-api',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    }
  }]
};
```

### 4. Démarrage

```bash
# Démarrer l'application
pm2 start ecosystem.config.js --env production

# Sauvegarder la configuration PM2
pm2 save

# Configurer le démarrage automatique
pm2 startup
```

## Maintenance

### Backups

```bash
# Backup manuel
npm run db:backup

# Restaurer un backup
npm run db:restore backup_20230101.gz

# Nettoyer les vieux backups
npm run db:cleanup
```

### Logs

```bash
# Voir les logs PM2
pm2 logs godfather-api

# Voir les logs applicatifs
tail -f logs/app.log

# Rotation des logs
logrotate -f /etc/logrotate.d/godfather
```

### Monitoring

```bash
# Dashboard PM2
pm2 monit

# Statistiques
pm2 show godfather-api

# Métriques
pm2 reload ecosystem.config.js --env production
```

## Sécurité

### 1. Pare-feu

```bash
# UFW
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 27017/tcp
```

### 2. SSL/TLS

```bash
# Certbot
certbot --nginx -d api.godfather.com
```

### 3. MongoDB

```bash
# Activer l'authentification
security:
  authorization: enabled
```

### 4. Rate Limiting

```javascript
// Middleware de rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite par IP
}));
```

## Tests

```bash
# Exécuter tous les tests
npm test

# Tests spécifiques
npm test -- --grep="Auth"

# Couverture
npm run coverage
```

## CI/CD

```yaml
# .github/workflows/main.yml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Test
        run: |
          npm install
          npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: |
          ssh user@server 'cd /app && git pull && npm install && pm2 reload all'
```

## Troubleshooting

1. **Problèmes de connexion MongoDB**
   ```bash
   # Vérifier le statut
   systemctl status mongod
   
   # Logs MongoDB
   tail -f /var/log/mongodb/mongod.log
   ```

2. **Problèmes d'application**
   ```bash
   # Logs PM2
   pm2 logs godfather-api
   
   # Redémarrer l'application
   pm2 restart godfather-api
   ```

3. **Problèmes de mémoire**
   ```bash
   # Vérifier l'utilisation mémoire
   pm2 monit
   
   # Ajuster la limite de mémoire
   pm2 reload godfather-api --max-memory-restart 1G
