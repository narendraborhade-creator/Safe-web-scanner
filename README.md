# SafeWeb Inspector & Comparator 🛡️⚡

A modern web safety inspection and comparison platform featuring a **futuristic 3D cyber UI**, **user authentication**, **MongoDB database integration**, and a cleanly **separated frontend/backend architecture**.

---

## 🌟 Key Features

- 🌌 **Futuristic 3D UI**: Interactive 3D particle mesh background reacting to cursor physics, glowing glassmorphism cards, animated score rings, and neon cyber aesthetics.
- 🔐 **Authentication & Security**: User registration, login with bcrypt password hashing, and JWT token authentication.
- 🍃 **MongoDB Integration**: Stores registered user profiles, authentication credentials, and persistent scan/comparison history.
- 🔍 **Single Site Safety Scanner**: Analyzes TLS/SSL certificates, HTTP security headers (CSP, HSTS, X-Frame-Options), DNS infrastructure, and potential phishing/typosquatting signals.
- ⚖️ **Side-by-Side Comparator**: Compares two websites head-to-head to determine the safer domain with granular score differentials.
- 📜 **Scan History**: Review past security audits and comparisons for your account.

---

## 🏗️ Architecture

The project is structured with a decoupled Frontend and Backend:

```
safeweb-inspector-&-comparator/
├── backend/                  # Node.js + Express + TypeScript Backend
│   ├── config/
│   │   └── db.ts             # MongoDB Mongoose Connection
│   ├── middleware/
│   │   └── auth.ts           # JWT Authentication Middleware
│   ├── models/
│   │   ├── User.ts           # User Mongoose Schema
│   │   └── ScanHistory.ts    # Scan History Schema
│   ├── routes/
│   │   ├── auth.ts           # Registration & Login Endpoints
│   │   └── scan.ts           # Site Scan & Compare Endpoints
│   ├── .env.example          # Backend Environment Template
│   ├── package.json          # Backend Dependencies
│   ├── server.ts             # Express Server Entrypoint
│   └── tsconfig.json         # Backend TypeScript Configuration
│
├── src/                      # React 19 + TypeScript + Tailwind Frontend
│   ├── components/
│   │   ├── Navbar.tsx        # Cyberpunk Glassmorphic Navbar
│   │   ├── ParticleField.tsx # Interactive 3D Particle Canvas
│   │   └── ScoreRing.tsx     # Animated SVG Score Ring
│   ├── context/
│   │   └── AuthContext.tsx   # React Auth State Provider
│   ├── pages/
│   │   ├── Dashboard.tsx     # Scan, Compare, and History Dashboard
│   │   └── LoginPage.tsx     # Futuristic Auth Portal (Sign In / Register)
│   ├── App.tsx               # Root App Routing
│   ├── index.css             # Cyberpunk Theme & Neon Glow CSS
│   └── main.tsx              # React Entry Point
│
├── index.html                # HTML Template
├── package.json              # Frontend Dependencies & Scripts
├── tsconfig.json             # Frontend TypeScript Configuration
└── vite.config.ts            # Vite Configuration with Backend API Proxy
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas connection string)

### 2. Backend Setup

1. Open a terminal in the project directory:
   ```bash
   cd backend
   ```
2. Configure your environment variables in `backend/.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/safeweb
   JWT_SECRET=your_custom_jwt_secret_key
   PORT=5000
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend API will run at `http://localhost:5000`.*

### 3. Frontend Setup

1. Open a second terminal in the project root:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` — Create a new account (`username`, `email`, `password`)
- `POST /api/auth/login` — Authenticate user and obtain JWT token (`email`, `password`)
- `GET /api/auth/me` — Fetch currently authenticated user profile *(Protected)*

### Scanning & Comparison
- `POST /api/scan/check-site` — Audit safety metrics for a given URL *(Protected)*
- `POST /api/scan/compare-sites` — Compare safety metrics of two URLs *(Protected)*
- `GET /api/scan/history` — Retrieve user's scan history *(Protected)*
- `GET /api/scan/samples` — Retrieve preset safe and suspicious samples *(Public)*

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, HTML5 3D Canvas
- **Backend**: Node.js, Express, TypeScript, TSX
- **Database & Auth**: MongoDB, Mongoose, JSON Web Tokens (JWT), bcryptjs
