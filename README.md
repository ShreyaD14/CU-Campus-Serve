# CampusServe

A smart, full-stack campus food and service ordering platform built for Chandigarh University.

## Features

- **Role-based Access**: Users, Vendors, Delivery Agents, and Admins.
- **Smart Logistics**: Order delivery to hostels or pick up from defined pickup points.
- **Microservice-style Backend**: Organized route logic and separated socket handlers.
- **Real-Time Tracking**: WebSocket-powered live order status, agent assignment, and simulated GPS movement.
- **Map View**: Interactive Leaflet map showing all food clusters, hostels, and pickup points on campus.
- **Cart System**: Multi-item cart mapped strictly to a single shop at a time to prevent complex logistics overloads.

## Tech Stack

- **Frontend**: React 18, Vite, React Router, UI created with custom deep-red design system.
- **Backend**: Node.js, Express, Socket.io.
- **Database**: SQLite (`better-sqlite3`) with WAL mode for fast concurrency and portability.

## Project Structure

```
.
├── client/          # Vite + React frontend
├── server/          # Node.js + Express backend
└── docs/            # Technical documentation
```

## Running the Application

### 1. Install Dependencies
```bash
npm run install-all
```

### 2. Seed the Database
Seed the database with mock locations, menus, shops, and dummy users.
```bash
npm run seed
```

### 3. Start Development Servers
Runs both the React Vite frontend and the Express backend concurrently.
```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

## Demo Login Flow

Use the quick-click buttons on the login screen, or enter one of these phone numbers (OTP is any 6 digits):
- **User**: `9000000004`
- **Vendor**: `9000000002`
- **Delivery**: `9000000003`
- **Admin**: `9000000001`
