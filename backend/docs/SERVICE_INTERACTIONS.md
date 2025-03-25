# Interactions entre Services MY GODFATHER

## Exemples d'Interactions Clés

### 1. Processus de Matching

```javascript
// Dans matchingService.js
async function generateMatching(menteeId) {
    // 1. Récupérer les informations utilisateur via UserService
    const mentee = await userService.getUserById(menteeId);
    const availableMentors = await userService.getAvailableMentors();

    // 2. Calculer les scores de matching
    const matches = this.calculateMatchingScores(mentee, availableMentors);

    // 3. Enregistrer les suggestions via PairService
    const pair = await pairService.createSuggestions(menteeId, matches);

    // 4. Notifier via NotificationService
    await notificationService.notifyHR('Nouveau matching', {
        menteeId,
        matches: matches.length
    });

    return pair;
}
```

### 2. Création d'une Session

```javascript
// Dans sessionService.js
async function createSession(pairId, sessionData) {
    // 1. Vérifier la paire via PairService
    const pair = await pairService.getPair(pairId);
    if (!pair.isActive()) throw new Error('Paire inactive');

    // 2. Créer la session
    const session = await this.create(sessionData);

    // 3. Créer une réunion Teams via TeamsService
    const meeting = await teamsService.createMeeting({
        title: `Session de mentorat - ${pair.mentor.name}/${pair.mentee.name}`,
        startTime: session.date,
        duration: session.duration
    });

    // 4. Notifier les participants
    await notificationService.notifyMultiple(
        [pair.mentor_id, pair.mentee_id],
        'Nouvelle session planifiée',
        { sessionId: session._id, meetingUrl: meeting.joinUrl }
    );

    return session;
}
```

### 3. Import d'Utilisateurs

```javascript
// Dans importService.js
async function importUsers(file, adminId) {
    // 1. Logger via AuditService
    const auditLog = await auditService.log('IMPORT_STARTED', adminId);

    try {
        // 2. Traiter le fichier
        const users = await this.processFile(file);

        // 3. Créer les utilisateurs via UserService
        const results = await Promise.all(
            users.map(user => userService.createUser(user))
        );

        // 4. Générer des statistiques
        const stats = this.generateImportStats(results);

        // 5. Notifier l'admin
        await notificationService.notifyUser(
            adminId,
            'Import terminé',
            `${stats.success} utilisateurs importés, ${stats.failed} échecs`
        );

        // 6. Mettre à jour l'audit
        await auditService.updateLog(auditLog._id, {
            status: 'completed',
            results: stats
        });

        return stats;
    } catch (error) {
        // Gérer les erreurs et notifier
        await auditService.updateLog(auditLog._id, {
            status: 'failed',
            error: error.message
        });
        throw error;
    }
}
```

### 4. Génération de Rapports

```javascript
// Dans statisticsService.js
async function generateMonthlyReport() {
    // 1. Collecter les données via l'agrégateur
    const stats = await this.aggregator.collectAllStats();

    // 2. Vérifier les alertes
    const alerts = await this.alerts.checkThresholds(stats);

    // 3. Générer les rapports
    const [pdfReport, excelReport] = await Promise.all([
        this.reporter.generatePDF(stats),
        this.reporter.generateExcel(stats)
    ]);

    // 4. Notifier les RH
    if (alerts.length > 0) {
        await notificationService.notifyHR(
            'Alertes dans le rapport mensuel',
            { alerts, reportUrls: [pdfReport.url, excelReport.url] }
        );
    }

    // 5. Logger via AuditService
    await auditService.log('REPORT_GENERATED', null, {
        type: 'monthly',
        alerts: alerts.length
    });

    return {
        stats,
        alerts,
        reports: {
            pdf: pdfReport,
            excel: excelReport
        }
    };
}
```

### 5. Actions Administratives

```javascript
// Dans adminService.js
async function updateSystemConfig(adminId, newConfig) {
    // 1. Vérifier les permissions via AuthService
    await authService.checkPermission(adminId, 'MANAGE_CONFIG');

    // 2. Logger le début via AuditService
    const auditLog = await auditService.log('CONFIG_UPDATE_STARTED', adminId);

    try {
        // 3. Sauvegarder l'ancienne config via SecurityService
        await securityService.backupConfig();

        // 4. Mettre à jour la config
        const result = await configService.updateConfig(newConfig);

        // 5. Notifier les admins
        await notificationService.notifyAdmins(
            'Configuration système mise à jour',
            {
                updatedBy: adminId,
                changes: result.changes
            }
        );

        // 6. Finaliser l'audit
        await auditService.updateLog(auditLog._id, {
            status: 'completed',
            changes: result.changes
        });

        return result;
    } catch (error) {
        // Gérer les erreurs
        await auditService.updateLog(auditLog._id, {
            status: 'failed',
            error: error.message
        });
        throw error;
    }
}
```

## Points Clés des Interactions

1. **Traçabilité**
   - Chaque action importante est tracée via AuditService
   - Les erreurs sont capturées et enregistrées

2. **Notifications**
   - Communication asynchrone entre services
   - Notifications en temps réel aux utilisateurs

3. **Sécurité**
   - Vérification des permissions à chaque étape
   - Sauvegarde avant modifications importantes

4. **Transactions**
   - Gestion des opérations atomiques
   - Rollback en cas d'erreur

5. **Performance**
   - Opérations asynchrones quand possible
   - Mise en cache des données fréquemment utilisées

## Bonnes Pratiques

1. **Isolation**
   - Chaque service a une responsabilité unique
   - Communication via interfaces bien définies

2. **Gestion d'Erreurs**
   - Capture et log des erreurs
   - Notifications appropriées

3. **Audit**
   - Traçage des actions importantes
   - Historique des modifications

4. **Asynchronicité**
   - Utilisation de async/await
   - Gestion des promesses

5. **Documentation**
   - JSDoc pour les méthodes importantes
   - Exemples d'utilisation
