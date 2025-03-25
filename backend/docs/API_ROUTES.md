# Routes API MY GODFATHER

## 1. Routes d'Authentification
```javascript
// authRoutes.js
router.post('/auth/login', authController.login);
router.post('/auth/refresh', authController.refreshToken);
router.post('/auth/logout', authController.logout);
```

## 2. Routes Utilisateurs
```javascript
// userRoutes.js
router.get('/users', [authMiddleware, roleMiddleware(['admin', 'rh'])], userController.getUsers);
router.post('/users', [authMiddleware, roleMiddleware(['admin'])], userController.createUser);
router.get('/users/:id', authMiddleware, userController.getUser);
router.put('/users/:id', authMiddleware, userController.updateUser);
router.delete('/users/:id', [authMiddleware, roleMiddleware(['admin'])], userController.deleteUser);
```

## 3. Routes de Matching
```javascript
// matchingRoutes.js
router.post('/matching/generate/:menteeId', [authMiddleware, roleMiddleware(['rh'])], matchingController.generateMatches);
router.get('/matching/suggestions/:menteeId', authMiddleware, matchingController.getSuggestions);
router.post('/matching/validate/:matchId', [authMiddleware, roleMiddleware(['rh'])], matchingController.validateMatch);
router.get('/matching/stats', [authMiddleware, roleMiddleware(['admin', 'rh'])], matchingController.getStats);
```

## 4. Routes des Paires
```javascript
// pairRoutes.js
router.get('/pairs', authMiddleware, pairController.getPairs);
router.post('/pairs', [authMiddleware, roleMiddleware(['rh'])], pairController.createPair);
router.get('/pairs/:id', authMiddleware, pairController.getPair);
router.put('/pairs/:id/status', [authMiddleware, roleMiddleware(['rh'])], pairController.updateStatus);
router.post('/pairs/:id/feedback', authMiddleware, pairController.addFeedback);
```

## 5. Routes des Sessions
```javascript
// sessionRoutes.js
router.get('/sessions', authMiddleware, sessionController.getSessions);
router.post('/sessions', authMiddleware, sessionController.createSession);
router.get('/sessions/:id', authMiddleware, sessionController.getSession);
router.put('/sessions/:id', authMiddleware, sessionController.updateSession);
router.post('/sessions/:id/feedback', authMiddleware, sessionController.addFeedback);
```

## 6. Routes de Messagerie
```javascript
// messageRoutes.js
router.get('/messages', authMiddleware, messageController.getMessages);
router.post('/messages', authMiddleware, messageController.sendMessage);
router.put('/messages/:id/read', authMiddleware, messageController.markAsRead);
router.delete('/messages/:id', authMiddleware, messageController.deleteMessage);
```

## 7. Routes de Notifications
```javascript
// notificationRoutes.js
router.get('/notifications', authMiddleware, notificationController.getNotifications);
router.put('/notifications/:id/read', authMiddleware, notificationController.markAsRead);
router.put('/notifications/preferences', authMiddleware, notificationController.updatePreferences);
```

## 8. Routes Teams
```javascript
// teamsRoutes.js
router.post('/teams/channels', [authMiddleware, roleMiddleware(['rh'])], teamsController.createChannel);
router.post('/teams/meetings', authMiddleware, teamsController.createMeeting);
router.put('/teams/meetings/:id', authMiddleware, teamsController.updateMeeting);
```

## 9. Routes d'Import
```javascript
// importRoutes.js
router.post('/import/users', [authMiddleware, roleMiddleware(['admin', 'rh'])], importController.importUsers);
router.get('/import/history', [authMiddleware, roleMiddleware(['admin', 'rh'])], importController.getHistory);
router.get('/import/template', [authMiddleware, roleMiddleware(['admin', 'rh'])], importController.downloadTemplate);
```

## 10. Routes de Statistiques
```javascript
// statisticsRoutes.js
router.get('/statistics/dashboard', [authMiddleware, roleMiddleware(['admin', 'rh'])], statisticsController.getDashboard);
router.get('/statistics/reports', [authMiddleware, roleMiddleware(['admin', 'rh'])], statisticsController.getReports);
router.post('/statistics/reports/generate', [authMiddleware, roleMiddleware(['admin', 'rh'])], statisticsController.generateReport);
router.get('/statistics/alerts', [authMiddleware, roleMiddleware(['admin', 'rh'])], statisticsController.getAlerts);
```

## 11. Routes Admin
```javascript
// adminRoutes.js
// Configuration
router.get('/admin/config', [authMiddleware, roleMiddleware(['admin'])], adminController.getConfig);
router.put('/admin/config', [authMiddleware, roleMiddleware(['admin'])], adminController.updateConfig);

// Sécurité
router.post('/admin/backup', [authMiddleware, roleMiddleware(['admin'])], adminController.createBackup);
router.post('/admin/restore/:backupId', [authMiddleware, roleMiddleware(['admin'])], adminController.restoreBackup);
router.get('/admin/security/logs', [authMiddleware, roleMiddleware(['admin'])], adminController.getSecurityLogs);

// Audit
router.get('/admin/audit/logs', [authMiddleware, roleMiddleware(['admin'])], adminController.getAuditLogs);
router.get('/admin/audit/stats', [authMiddleware, roleMiddleware(['admin'])], adminController.getAuditStats);

// Maintenance
router.post('/admin/maintenance', [authMiddleware, roleMiddleware(['admin'])], adminController.performMaintenance);
router.get('/admin/system/stats', [authMiddleware, roleMiddleware(['admin'])], adminController.getSystemStats);
```

## Middlewares Communs

```javascript
// Authentification
const authMiddleware = (req, res, next) => {
    // Vérifie le token JWT
};

// Vérification des rôles
const roleMiddleware = (roles) => (req, res, next) => {
    // Vérifie si l'utilisateur a les rôles requis
};

// Validation des données
const validateMiddleware = (schema) => (req, res, next) => {
    // Valide les données de la requête selon le schéma
};

// Audit
const auditMiddleware = (action) => (req, res, next) => {
    // Enregistre l'action dans les logs d'audit
};
```

## Gestion des Erreurs

```javascript
// errorHandler.js
const errorHandler = (err, req, res, next) => {
    // Log l'erreur
    console.error(err);

    // Erreurs spécifiques
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: err.details
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: err.message
        });
    }

    // Erreur par défaut
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
};
```

## Sécurité

Toutes les routes sont protégées par :
1. Authentification JWT
2. Vérification des rôles
3. Validation des données
4. Rate limiting
5. CORS
6. Protection XSS
7. Protection CSRF pour les routes non-GET

## Documentation Swagger

La documentation complète de l'API est disponible à `/api-docs` et inclut :
- Description des endpoints
- Schémas de requête/réponse
- Exemples d'utilisation
- Codes d'erreur
- Authentification requise
