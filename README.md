# MY GODFATHER - Project Documentation

## Overview
MY GODFATHER is a web application designed to facilitate the onboarding process for new recruits through automated mentoring.

## Technologies Used
- **Frontend**: 
  - React
  - React Router
  - Tailwind CSS
  - Framer Motion for animations
- **Backend**: 
  - Node.js
  - Express
  - MongoDB
  - JWT for authentication
  - Swagger for API documentation

## Directory Structure
```
mygodfather/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Business logic
│   │   ├── routes/               # API routes
│   │   ├── services/             # Service layer for data handling
│   │   ├── models/               # Database models
│   │   └── index.js              # Entry point for the backend
│   ├── package.json               # Backend dependencies
│   └── README.md                  # Backend documentation
└── frontend/
    ├── src/
    │   ├── components/            # Reusable components
    │   ├── context/               # Context providers for state management
    │   ├── pages/                 # Page components
    │   ├── services/              # API service calls
    │   ├── App.js                 # Main application component
    │   └── Router.js              # Routing setup
    ├── package.json                # Frontend dependencies
    └── README.md                   # Frontend documentation
```

## Setup Instructions
### Backend
1. Navigate to the `backend` directory.
2. Run `npm install` to install dependencies.
3. Set up environment variables in a `.env` file.
4. Start the server with `npm start`.

### Frontend
1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Start the development server with `npm start`.

## Routing
### Frontend
- `/login`: Login page for users.
- `/dashboard`: Dashboard for authenticated users.
- `/welcome`: Welcome screen after onboarding.

### Backend
- `/api/auth/*`: Authentication endpoints.
- `/api/users/*`: User management endpoints.
- `/api/statistics/*`: Statistics management endpoints.

## Features
### Frontend
- **Dashboard**: Displays user-specific statistics and notifications.
- **User Authentication**: Login functionality with role-based access.
- **Responsive Design**: Adapts to different screen sizes with a mobile-friendly layout.
- **Theme and Language Support**: Users can toggle between light and dark themes and select their preferred language.

### Backend
- **Authentication**: Secure user login and registration.
- **User Management**: CRUD operations for user data.
- **Statistics**: Aggregation, reporting, and alert functionalities.

## Contributing
- Contributions are welcome! Please submit a pull request.




### Backend API Documentation

## Controllers and Routes

### AuthController
- **POST /api/auth/login**: Authenticates a user.
- **POST /api/auth/refresh**: Refreshes the access token.
- **POST /api/auth/logout**: Logs out a user.
- **POST /api/auth/reset-password**: Initiates a password reset.
- **POST /api/auth/reset-password/:token**: Validates the reset token.
- **POST /api/auth/change-password**: Changes the user's password.
- **POST /api/auth/admin/change-password**: Admin changes a user's password.
- **GET /api/auth/status**: Checks authentication status.
- **POST /api/auth/register**: Registers a new user.

### StatisticsController
- **GET /api/statistics/dashboard**: Obtains dashboard statistics.
- **POST /api/statistics/reports**: Generates a statistical report.
- **GET /api/statistics/alerts**: Obtains statistical alerts.
- **POST /api/statistics/export**: Exports statistical data.
- **GET /api/statistics/matching-distribution**: Obtains the distribution of matching scores.

### UserController
- **GET /api/users**: Obtains all users with pagination and filters.
- **POST /api/users**: Creates a new user.
- **GET /api/users/profile**: Obtains the current user's profile.
- **GET /api/users/:id**: Obtains a user by ID.
- **PUT /api/users/:id**: Updates a user.
- **DELETE /api/users/:id**: Deletes a user.
- **PUT /api/users/profile**: Updates the current user's profile.
- **PUT /api/users/notifications/preferences**: Updates notification preferences.
- **PUT /api/users/disponibilite**: Updates availability (for mentors).
- **PATCH /api/users/complete-onboarding**: Marks onboarding as complete for the user.

### AdminAuditController
- **GET /api/admin/audit/logs**: Obtains audit logs.
- **GET /api/admin/audit/stats**: Obtains audit statistics.
- **POST /api/admin/audit/export**: Exports audit logs.
- **DELETE /api/admin/audit/cleanup**: Cleans up old audit logs.

### AdminConfigController
- **GET /api/admin/config**: Obtains system configuration.
- **PUT /api/admin/config**: Updates system configuration.
- **GET /api/admin/status**: Obtains system status.
- **POST /api/admin/maintenance**: Performs maintenance tasks.

### AdminSecurityController
- **POST /api/admin/backup**: Creates a backup and saves it to the database.
- **POST /api/admin/restore/:backupId**: Restores a backup.
- **GET /api/admin/backups**: Obtains a list of backups.
- **GET /api/admin/backups/stats**: Obtains statistics about backups.
- **GET /api/admin/backups/:id/download**: Downloads a backup.
- **DELETE /api/admin/backups/:id**: Deletes a backup.
- **GET /api/admin/security/logs**: Obtains security logs.
- **PUT /api/admin/security/policy**: Updates the security policy.

### ImportController
- **POST /api/import/users**: Imports users from a file.
- **GET /api/import/history**: Obtains the import history.
- **GET /api/import/template**: Downloads the import template.
- **POST /api/import/validate**: Validates an import file.

### MatchingController
- **POST /api/matching/generate/:menteeId**: Generates matching suggestions for a mentee.
- **GET /api/matching/suggestions/:menteeId**: Obtains matching suggestions for a mentee.
- **POST /api/matching/validate/:matchId**: Validates a match.
- **POST /api/matching/reject/:matchId**: Rejects a match.
- **GET /api/matching/stats**: Obtains matching statistics.

### MatchingLogController
- **GET /api/matching/logs**: Obtains all matching logs.
- **GET /api/matching/logs/:id**: Obtains a specific matching log by ID.
- **GET /api/matching/rejection-logs**: Obtains all matching rejection logs.
- **GET /api/matching/rejection-logs/:id**: Obtains a specific rejection log by ID.
- **GET /api/matching/logs/stats**: Obtains statistics about matching logs.

### MatchingManagementController
- **POST /api/matching/run**: Runs the matching algorithm.
- **GET /api/matching/recommendations**: Obtains recommendations for a specific mentee.
- **POST /api/matching/confirm**: Confirms a mentor-mentee association.
- **GET /api/matching/stats**: Obtains matching statistics.

### MatchingValidationController
- **POST /api/matching/validate**: Validates matches between mentors and mentees.
