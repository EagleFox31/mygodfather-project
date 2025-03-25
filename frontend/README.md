# MY GODFATHER - Frontend

## Overview
MY GODFATHER is a web application designed to facilitate the onboarding process for new recruits through automated mentoring.

## Technologies Used
- React
- React Router
- Tailwind CSS
- Framer Motion for animations

## Directory Structure
```
frontend/
├── src/
│   ├── components/          # Reusable components
│   ├── context/             # Context providers for state management
│   ├── pages/               # Page components
│   ├── services/            # API service calls
│   ├── App.js               # Main application component
│   └── Router.js            # Routing setup
├── public/                  # Static files
├── package.json             # Project dependencies
└── README.md                # Project documentation
```

## Setup Instructions
1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Start the development server with `npm start`.

## Routing
The application uses React Router for navigation. Key routes include:
- `/login`: Login page for users.
- `/dashboard`: Dashboard for authenticated users.
- `/welcome`: Welcome screen after onboarding.

## Features
- **Dashboard**: Displays user-specific statistics and notifications.
- **User Authentication**: Login functionality with role-based access.
- **Responsive Design**: Adapts to different screen sizes with a mobile-friendly layout.
- **Theme and Language Support**: Users can toggle between light and dark themes and select their preferred language.

## Contributing
- Contributions are welcome! Please submit a pull request.


