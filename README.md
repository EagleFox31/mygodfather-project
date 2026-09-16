# MY GODFATHER

**Employee onboarding and mentoring platform built around mentor–mentee matching and follow-up workflows.**

MY GODFATHER helps structure the onboarding of new recruits by connecting mentees with suitable mentors, centralizing the matching process and giving administrators tools to monitor, validate and manage the program.

## Main capabilities

- **Mentor / mentee profiles** — roles, availability and onboarding information
- **Matching workflow** — generate mentor suggestions, validate or reject matches and keep matching history
- **Onboarding follow-up** — dashboards, user progress and program information
- **Administration** — users, configuration, imports, audit logs and operational statistics
- **Access control** — authenticated application with role-based behavior
- **Reporting** — dashboard statistics, exports and matching indicators
- **Internationalized UI** — language and theme support on the frontend

## Architecture

```text
React 18 frontend
      │
      ▼
Node.js / Express API
      │
      ├── authentication & RBAC
      ├── mentor matching services
      ├── imports / reporting
      ├── audit & admin operations
      └── Socket.IO events
      │
      ▼
MongoDB
```

The matching domain is kept separate from general user management so suggestions, validation, rejection and matching history can evolve without turning the application into a collection of controller-only CRUD endpoints.

## Stack

### Frontend

- React 18
- React Router
- Tailwind CSS / Bootstrap
- Framer Motion
- React Query
- Chart.js / Recharts
- i18next
- Socket.IO client

### Backend

- Node.js
- Express
- MongoDB / Mongoose
- JWT authentication
- Redis
- Socket.IO
- Swagger / OpenAPI
- ExcelJS / XLSX / PDFKit for imports and exports
- Jest / Supertest

## Main API domains

The backend is organized around a few clear application areas:

```text
/api/auth          authentication and sessions
/api/users         user and profile management
/api/matching      suggestions, matching and validation
/api/statistics    dashboards and reporting
/api/import        user import workflows
/api/admin         configuration, audit and security operations
```

Detailed endpoint documentation is exposed through the backend Swagger configuration rather than duplicated as a long route catalogue in this README.

## Development

Clone the repository:

```bash
git clone https://github.com/EagleFox31/mygodfather-project.git
cd mygodfather-project
```

### Backend

```bash
cd backend
npm install
npm run dev
```

Configure the required environment variables before starting the API. The backend includes migration / seed scripts for initializing development data.

Useful commands:

```bash
npm test
npm run lint
npm run seed
```

### Frontend

```bash
cd frontend
npm install
npm start
```

The frontend uses Create React App tooling and communicates with the Express API.

## Repository structure

```text
mygodfather-project/
├── backend/
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       ├── models/
│       └── migrations/
└── frontend/
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        └── services/
```

## Project status

MY GODFATHER is a full-stack mentoring/onboarding project with implemented administration, matching, reporting and security workflows. The repository is kept as a portfolio example of a larger business application rather than a minimal demo.
