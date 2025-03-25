# Architecture des Services MY GODFATHER

## Diagramme d'Architecture

```ascii
┌─────────────────────────────────────────────────────────────────────┐
│                        Interface Client                             │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                         API Gateway / Routes                         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────────┐
│                               │                                      │
│  ┌─────────────┐    ┌────────▼───────┐    ┌──────────────┐         │
│  │   Admin     │    │     Core       │    │  Statistics  │         │
│  │  Services   │    │   Services     │    │   Services   │         │
│  └──────┬──────┘    └────────┬───────┘    └──────┬───────┘         │
│         │                     │                   │                  │
│  ┌──────▼──────┐    ┌────────▼───────┐    ┌──────▼───────┐         │
│  │   Config    │    │     Auth       │    │  Aggregator  │         │
│  └──────┬──────┘    └────────┬───────┘    └──────┬───────┘         │
│         │                     │                   │                  │
│  ┌──────▼──────┐    ┌────────▼───────┐    ┌──────▼───────┐         │
│  │  Security   │    │     User       │    │   Alerts     │         │
│  └──────┬──────┘    └────────┬───────┘    └──────┬───────┘         │
│         │                     │                   │                  │
│  ┌──────▼──────┐    ┌────────▼───────┐    ┌──────▼───────┐         │
│  │   Audit     │    │    Matching    │    │   Reporter   │         │
│  └─────────────┘    └────────┬───────┘    └──────────────┘         │
│                              │                                      │
│                     ┌────────▼───────┐                             │
│                     │     Pair       │                             │
│                     └────────┬───────┘                             │
│                              │                                     │
│                     ┌────────▼───────┐                             │
│                     │    Session     │                             │
│                     └────────┬───────┘                             │
│                              │                                     │
│                     ┌────────▼───────┐                             │
│                     │   Message      │                             │
│                     └────────┬───────┘                             │
│                              │                                     │
│                     ┌────────▼───────┐                             │
│                     │ Notification   │                             │
│                     └────────┬───────┘                             │
│                              │                                     │
│                     ┌────────▼───────┐                             │
│                     │    Teams       │                             │
│                     └────────────────┘                             │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Interactions entre les Services

### 1. Services Core → Services Core

- **AuthService → UserService**
  - Validation des identifiants
  - Gestion des rôles et permissions

- **MatchingService → UserService**
  - Récupération des profils pour le matching
  - Vérification des disponibilités

- **PairService → MatchingService**
  - Création des paires basée sur les suggestions
  - Validation des compatibilités

- **SessionService → PairService**
  - Vérification des paires actives
  - Gestion des sessions de mentorat

- **MessageService → NotificationService**
  - Notification des nouveaux messages
  - Alertes de lecture

### 2. Services Core → Services Externes

- **TeamsService → Microsoft Teams**
  - Création des canaux
  - Gestion des réunions
  - Envoi de messages

- **ImportService → Excel/CSV**
  - Import des données utilisateurs
  - Validation des formats

### 3. Services Statistics → Services Core

- **Aggregator → Tous les services Core**
  - Collecte des métriques
  - Calcul des statistiques

- **Alerts → NotificationService**
  - Envoi des alertes
  - Notifications des seuils atteints

- **Reporter → Aggregator**
  - Génération des rapports
  - Export des données

### 4. Services Admin → Tous les Services

- **ConfigService → Tous les services**
  - Configuration système
  - Paramètres applicatifs

- **SecurityService → AuthService**
  - Gestion des tokens
  - Sécurité des accès

- **AuditService → Tous les services**
  - Logging des actions
  - Traçabilité

## Flux de Données Typiques

1. **Processus de Matching**
```
UserService → MatchingService → PairService → NotificationService → TeamsService
```

2. **Gestion des Sessions**
```
SessionService → PairService → TeamsService → NotificationService
```

3. **Monitoring Système**
```
Aggregator → Alerts → NotificationService → AdminService
```

4. **Actions Administratives**
```
AdminService → AuditService → ConfigService → Services concernés
```

## Points d'Intégration

1. **Microsoft Teams**
   - Canaux de discussion
   - Réunions virtuelles
   - Notifications

2. **Base de Données**
   - MongoDB pour le stockage
   - Agrégations pour les statistiques

3. **Système de Fichiers**
   - Stockage des imports/exports
   - Backups système

4. **Sécurité**
   - JWT pour l'authentification
   - Encryption des données sensibles
   - Logs d'audit

## Évolutivité

L'architecture est conçue pour permettre :
1. L'ajout facile de nouveaux services
2. La modification des règles métier
3. L'intégration de nouvelles fonctionnalités
4. La mise à l'échelle horizontale
