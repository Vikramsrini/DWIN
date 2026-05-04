# Digital Twin Health Tracker

Digital Twin Health Tracker is a small full-stack web app for tracking daily health activity data and turning it into a live “digital twin” dashboard. It lets a user log calories, sleep, hygiene, and exercise, then visualizes the latest status with health scores, activity rings, history, and 7-day charts.

The project is built around an iterative enhancement maintenance process. That makes sense for this kind of app because health metrics, validation rules, UI details, and database behavior are likely to change over time. Instead of delivering everything in one large release, the app can be improved in small cycles: identify a change, analyze impact, implement it, test it, and deploy it safely.

## What the app does

- User registration and login with password hashing
- Activity logging, editing, deleting, and filtering
- Twin status calculation based on stored activity data
- 7-day trend charts for calories, sleep, hygiene, and exercise
- SQLite-backed storage with seeded demo data
- API and UI test coverage with Node test runner and Playwright

## Tech Stack

- Backend: Node.js, Express
- Database: SQLite via better-sqlite3
- Validation: express-validator
- Frontend: HTML, CSS, vanilla JavaScript
- Testing: node:test, Supertest, Playwright

## Project Structure

- src/server.js starts the server and database
- src/app.js wires middleware, static files, and API routes
- src/routes/users.js handles registration, login, update, and delete
- src/routes/activities.js handles activity CRUD
- src/routes/twin.js calculates the twin health summary
- public/ contains the dashboard and login UI
- tests/ contains API tests
- tests-ui/ contains Playwright end-to-end tests
- scripts/seed.js populates demo users and activity data

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Seed the database

```bash
npm run seed
```

### 3. Start the app

```bash
npm start
```

The app runs at http://localhost:3000 by default.

## Available Scripts

- npm start starts the server
- npm run dev starts the server in watch mode
- npm run seed loads demo data into SQLite
- npm test runs the API tests
- npm run test:ui runs Playwright tests headless
- npm run test:ui:headed runs Playwright tests in a visible browser
- npm run test:ui:debug runs Playwright in debug mode

## Testing

The repository includes both API and browser-level tests. API tests verify server behavior and validation, while Playwright tests cover the login flow, dashboard rendering, activity logging, and twin status display. This gives a safer way to evolve the app while keeping changes small and testable.

## Notes

- The database file defaults to data/health.db
- Demo users and activities are created by the seed script
- The UI is served directly from the public/ folder
