# Scénarios de Test Swagger

## 1. Authentication (/api/auth)

### 1.1 Login (POST /api/auth/login)
- **True Positive**: Identifiants valides
- **False Positive**: Mot de passe incorrect
- **True Negative**: Email inexistant
- **False Negative**: Format email invalide

## 2. Users (/api/users)

### 2.1 Création Utilisateur (POST /api/users)
- **True Positive**: Données utilisateur valides
- **False Positive**: Email déjà existant
- **Validation Errors**: Champs requis manquants

### 2.2 Mise à jour Utilisateur (PUT /api/users/{id})
- **True Positive**: Données de mise à jour valides
- **False Positive**: ID utilisateur invalide
- **Validation Errors**: Format de données incorrect

## 3. Matching (/api/matching)

### 3.1 Création Match (POST /api/matching)
- **True Positive**: Critères de matching valides
- **False Positive**: Mentoré déjà apparié
- **Validation Errors**: Préférences invalides

### 3.2 Validation Match (PUT /api/matching/{id}/validate)
- **True Positive**: Match valide
- **False Positive**: Match déjà validé
- **True Negative**: Match inexistant

## 4. Pairs (/api/pairs)

### 4.1 Liste des Paires (GET /api/pairs)
- **True Positive**: Filtres valides
- **False Positive**: Paramètres de filtre invalides
- **Pagination**: Test des limites

### 4.2 Détails Paire (GET /api/pairs/{id})
- **True Positive**: ID paire valide
- **True Negative**: ID paire inexistant

## 5. Pair Management (/api/pair-management)

### 5.1 Assignation Mentor (POST /api/pair-management/assign)
- **True Positive**: Assignation valide
- **False Positive**: Mentor déjà assigné
- **Validation Errors**: Données d'assignation invalides

## 6. Sessions (/api/sessions)

### 6.1 Création Session (POST /api/sessions)
- **True Positive**: Données session valides
- **False Positive**: Conflit horaire
- **Validation Errors**: Durée invalide

### 6.2 Annulation Session (PUT /api/sessions/{id}/cancel)
- **True Positive**: Annulation valide
- **False Positive**: Session déjà annulée
- **True Negative**: Session inexistante

## 7. Messages (/api/messages)

### 7.1 Envoi Message (POST /api/messages)
- **True Positive**: Message valide
- **False Positive**: Destinataire invalide
- **Validation Errors**: Contenu vide

### 7.2 Lecture Messages (GET /api/messages)
- **True Positive**: Filtres valides
- **Pagination**: Test des limites

## 8. Notifications (/api/notifications)

### 8.1 Liste Notifications (GET /api/notifications)
- **True Positive**: Filtres valides
- **Pagination**: Test des limites

### 8.2 Marquer comme Lu (PUT /api/notifications/{id}/read)
- **True Positive**: Notification non lue
- **False Positive**: Notification déjà lue

## 9. Teams (/api/teams)

### 9.1 Création Canal (POST /api/teams/channels)
- **True Positive**: Données canal valides
- **False Positive**: Canal déjà existant
- **Validation Errors**: Paramètres manquants

## 10. Import (/api/import)

### 10.1 Import Utilisateurs (POST /api/import/users)
- **True Positive**: Fichier valide
- **False Positive**: Format fichier incorrect
- **Validation Errors**: Données invalides dans le fichier

## 11. Statistics (/api/statistics)

### 11.1 Statistiques Globales (GET /api/statistics/global)
- **True Positive**: Période valide
- **False Positive**: Paramètres invalides
- **Filtres**: Test des différentes métriques

## 12. Admin (/api/admin)

### 12.1 Configuration Système (GET /api/admin/config)
- **True Positive**: Admin authentifié
- **False Positive**: Utilisateur non admin
- **True Negative**: Token invalide

### 12.2 Audit Logs (GET /api/admin/audit)
- **True Positive**: Filtres valides
- **Pagination**: Test des limites

## Notes pour les Tests

### Prérequis
1. Token JWT valide (obtenu via /api/auth/login)
2. Données de test préparées dans la base de données
3. Fichiers de test pour les imports

### Headers Requis
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Validation Commune
- Codes HTTP appropriés
- Format de réponse JSON valide
- Messages d'erreur explicites
- Validation des données sensibles

### Scénarios de Sécurité
1. **Authentication**
   - Token expiré
   - Token invalide
   - Token manquant
   - Permissions insuffisantes

2. **Validation des Données**
   - Injection SQL
   - XSS
   - Validation des types
   - Limites des champs

3. **Rate Limiting**
   - Test des limites de requêtes
   - Comportement en cas de dépassement

### Environnement de Test
1. **Base de données**
   - État initial connu
   - Données de test cohérentes
   - Nettoyage après les tests

2. **Configuration**
   - Mode développement
   - Logs activés
   - Timeouts appropriés

### Métriques à Vérifier
1. **Performance**
   - Temps de réponse
   - Utilisation mémoire
   - Charge CPU

2. **Fiabilité**
   - Gestion des erreurs
   - Récupération après erreur
   - Persistance des données

3. **Sécurité**
   - Protection des données
   - Validation des entrées
   - Gestion des sessions
