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


