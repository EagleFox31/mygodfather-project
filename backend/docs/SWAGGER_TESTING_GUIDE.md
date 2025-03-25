# Guide d'Utilisation de Swagger pour les Tests

## Accès à l'Interface Swagger

1. Démarrer le serveur backend
```bash
cd backend
npm run dev
```

2. Accéder à l'interface Swagger
```
http://localhost:3001/api-docs
```

## Authentification

1. Utiliser l'endpoint `/api/auth/login`
   - Cliquer sur l'endpoint
   - Cliquer sur "Try it out"
   - Entrer les credentials:
   ```json
   {
     "email": "admin@godfather.com",
     "password": "password123"
   }
   ```
   - Copier le token JWT de la réponse

2. Autoriser Swagger
   - Cliquer sur le bouton "Authorize" (🔓)
   - Entrer le token: `Bearer <votre_token_jwt>`
   - Cliquer sur "Authorize"

## Exécution des Tests

### 1. Tests Positifs
- Utiliser les payloads du fichier `SWAGGER_TEST_PAYLOADS.md`
- Vérifier les codes de réponse 2XX
- Valider le format des données retournées

### 2. Tests Négatifs
- Utiliser des données invalides
- Vérifier les codes d'erreur appropriés
- Valider les messages d'erreur

### 3. Tests de Validation
- Tester les limites des champs
- Vérifier la validation des types
- Tester les caractères spéciaux

## Interprétation des Résultats

### Codes HTTP
- 200: Succès
- 201: Création réussie
- 400: Erreur de validation
- 401: Non authentifié
- 403: Non autorisé
- 404: Ressource non trouvée
- 409: Conflit
- 500: Erreur serveur

### Format des Réponses

#### Succès
```json
{
  "status": "success",
  "data": {
    // Données retournées
  }
}
```

#### Erreur
```json
{
  "status": "error",
  "message": "Description de l'erreur",
  "code": "ERROR_CODE"
}
```

## Scénarios de Test par Module

### 1. Gestion des Utilisateurs
1. Création d'un utilisateur
2. Récupération du profil
3. Mise à jour des informations
4. Test des permissions

### 2. Matching
1. Création d'une demande
2. Validation des suggestions
3. Confirmation du matching
4. Gestion des rejets

### 3. Sessions
1. Planification
2. Modification
3. Annulation
4. Feedback

### 4. Notifications
1. Création
2. Lecture
3. Marquage comme lu
4. Filtrage

## Bonnes Pratiques

### 1. Préparation
- Vérifier l'environnement de test
- Préparer les données nécessaires
- S'assurer d'avoir les bonnes permissions

### 2. Exécution
- Tester un endpoint à la fois
- Documenter les résultats inattendus
- Vérifier les effets secondaires

### 3. Validation
- Vérifier la cohérence des données
- Valider les contraintes métier
- Tester les cas limites

## Résolution des Problèmes

### 1. Erreurs d'Authentification
- Vérifier la validité du token
- S'assurer d'avoir les bonnes permissions
- Vérifier le format du header Authorization

### 2. Erreurs de Validation
- Vérifier le format des données
- Respecter les contraintes des champs
- Vérifier les types de données

### 3. Erreurs Serveur
- Vérifier les logs du serveur
- S'assurer que MongoDB est accessible
- Vérifier la configuration

## Maintenance des Tests

### 1. Mise à Jour
- Maintenir les scénarios à jour
- Ajouter de nouveaux cas de test
- Mettre à jour les exemples

### 2. Documentation
- Documenter les changements
- Mettre à jour les payloads
- Maintenir les exemples à jour

## Sécurité

### 1. Gestion des Tokens
- Ne pas partager les tokens
- Utiliser des tokens temporaires
- Révoquer les tokens non utilisés

### 2. Données Sensibles
- Ne pas exposer de données réelles
- Utiliser des données de test
- Nettoyer après les tests

## Support

Pour toute question ou problème :
- Consulter la documentation technique
- Vérifier les logs serveur
- Contacter l'équipe technique
