# FleetFlow

FleetFlow is a comprehensive fleet management application designed to handle drivers, vehicle maintenance, financial tracking, dispatch, and overall operational analytics.

## Project Structure

- `frontend`: The frontend web application built with React/Vite.
- `backend`: The main backend service built with FastAPI, handling the majority of operations like driver management, maintenance logging, trip completion, etc.
- `Login-Auth`: A dedicated authentication microservice managing user login, registration, and secure token generation.

## Getting Started

### Prerequisites
- Node.js (for frontend)
- Python 3.9+ (for backend services)

### Authentication Service Setup (`Login-Auth/backend`)
1. Navigate to the `Login-Auth/backend` directory.
2. Create and activate a virtual environment.
3. Install requirements using `pip install -r requirements.txt`.
4. Configure the `.env` file with appropriate values.
5. Run the application: `uvicorn app.main:app --reload`.

### Main Backend Setup (`backend`)
1. Navigate to the `backend` directory.
2. Create and activate a virtual environment.
3. Install requirements using `pip install -r requirements.txt`.
4. Configure the `.env` file with appropriate values.
5. Run the application: `uvicorn app.main:app --reload`.

### Frontend Setup (`frontend`)
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install` (or `pnpm install` / `yarn`).
3. Set environment variables to point to the correct backend API URLs.
4. Run the development server: `npm run dev`.

## License
[Add License Here]
