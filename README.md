# FlexFit 🏋️

> A full-stack fitness coaching platform connecting clients with certified trainers — featuring real-time messaging, workout tracking, diet logging, Stripe payments, and a complete admin verification system.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52B0E7?style=flat-square&logo=sequelize&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

FlexFit is a production-ready fitness coaching platform built for three types of users — **clients** who want personalised training, **trainers** who want to manage their coaching business, and **admins** who oversee platform quality and trainer verification.

The platform handles the full coaching lifecycle: trainer discovery → booking → program delivery → progress tracking → payments → reviews.

---

## Features

### Client
- Browse and filter certified trainers by specialisation, rating, price, and language
- Send coaching requests and manage active relationships
- View personalised daily workout schedules
- Log completed workouts and body metrics
- Track progress with visual weight and performance charts
- Log daily meals with macros (calories, protein, carbs, fat)
- Real-time messaging with assigned trainer
- Subscription management via Stripe

### Trainer
- Onboarding with document-based identity and certification verification
- Build multi-week workout programs with exercises, sets, reps, and notes
- Manage client list and monitor adherence
- Upload exercise demonstration videos
- Accept or reject incoming coaching requests
- Earnings dashboard with monthly revenue breakdown
- Stripe Connect payout integration

### Admin
- Review pending trainer verification requests
- View uploaded certification documents
- Approve or reject trainers with reason
- Monitor all platform trainers and their status
- Platform-wide user management

### Platform
- JWT-based authentication with role-based access control
- Real-time messaging via Socket.io
- File uploads (documents, images, videos) via Cloudinary
- Stripe payment intents and webhook handling
- Rate limiting, helmet security headers, CORS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS, Recharts, Lucide React |
| Backend | Node.js, Express.js (ESM) |
| Database | PostgreSQL 15 with Sequelize ORM |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Payments | Stripe (Payment Intents + Connect + Webhooks) |
| File Storage | Cloudinary + multer-storage-cloudinary |
| Real-time | Socket.io |
| Validation | express-validator |
| Notifications | react-hot-toast |

---

## Project Structure

```
flexfit/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── RoleSelection.jsx
│   │   │   ├── client/
│   │   │   │   ├── ClientDashboard.jsx
│   │   │   │   ├── DietLog.jsx
│   │   │   │   ├── ProgressTracker.jsx
│   │   │   │   ├── TrainerBrowse.jsx
│   │   │   │   └── WorkoutLogger.jsx
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── trainer/
│   │   │       ├── TrainerDashboard.jsx
│   │   │       ├── ClientList.jsx
│   │   │       ├── ProgramBuilder.jsx
│   │   │       ├── VerificationUpload.jsx
│   │   │       └── VideoUpload.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── hooks/
│   │   │   ├── useApi.js
│   │   │   └── useAuth.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Pricing.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   └── paymentService.js
│   │   ├── utils/
│   │   │   └── constants.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
│
└── backend/
    ├── config/
    │   ├── db.js
    │   └── stripe.js
    ├── controllers/
    │   ├── adminController.js
    │   ├── authController.js
    │   ├── clientController.js
    │   ├── coachingController.js
    │   ├── paymentController.js
    │   ├── trainerController.js
    │   ├── uploadController.js
    │   └── workoutController.js
    ├── middleware/
    │   ├── auth.js
    │   ├── errorHandler.js
    │   └── upload.js
    ├── models/
    │   └── index.js
    ├── routes/
    │   ├── admin.js
    │   ├── auth.js
    │   ├── clients.js
    │   ├── coaching.js
    │   ├── payments.js
    │   ├── trainers.js
    │   ├── uploads.js
    │   └── workouts.js
    ├── uploads/
    │   ├── documents/
    │   ├── images/
    │   └── videos/
    ├── .env
    ├── server.js
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- A [Cloudinary](https://cloudinary.com) account (free tier works)
- A [Stripe](https://stripe.com) account (test mode)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/flexfit.git
cd flexfit
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure environment variables

Copy the example env files and fill in your values:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

See [Environment Variables](#environment-variables) for all required keys.

### 5. Set up the database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE flexfit_db;"

# Run migrations
cd backend
npx sequelize-cli db:migrate

# (Optional) Seed test data
npx sequelize-cli db:seed:all
```

Or see [Database Setup](#database-setup) to create the admin account manually.

### 6. Start the development servers

```bash
# Terminal 1 — Backend (from /backend)
npm run dev

# Terminal 2 — Frontend (from /frontend)
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

---

## Environment Variables

### `backend/.env`

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flexfit_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PLATFORM_FEE_PERCENT=15

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_APP_NAME=FlexFit
```

---

## Database Setup

### Create admin account

After running migrations, create the admin user directly in the database:

```sql
INSERT INTO users (
  user_id, first_name, last_name, email,
  password_hash, role, is_active, created_at, updated_at
)
VALUES (
  gen_random_uuid(),
  'Admin', 'FlexFit',
  'admin@flexfit.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TgxkWxR4RdJJm/aaKLSfZ9E1u2VO',
  'admin', true, NOW(), NOW()
)
ON CONFLICT (email) DO NOTHING;
```

**Admin credentials:**
- Email: `admin@flexfit.com`
- Password: `admin123`

> Change the password immediately after first login in a production environment.

### Approve trainers for testing

```sql
UPDATE trainers
SET
  is_verified         = true,
  verification_status = 'approved',
  max_clients         = 10,
  current_client_load = 0;
```

---

## API Reference

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register as trainer or client |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/me` | Auth | Get current user profile |
| PUT | `/api/auth/profile` | Auth | Update profile |

### Admin

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/pending` | Admin | Get pending trainer verifications |
| GET | `/api/admin/all` | Admin | Get all trainers |
| POST | `/api/admin/approve/:id` | Admin | Approve a trainer |
| POST | `/api/admin/reject/:id` | Admin | Reject a trainer with reason |

### Trainers

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/trainers` | Public | Browse all verified trainers |
| GET | `/api/trainers/stats` | Trainer | Get own dashboard stats |
| GET | `/api/trainers/:id` | Public | Get trainer profile |
| POST | `/api/trainers/verification` | Trainer | Submit verification document |
| PUT | `/api/trainers/availability` | Trainer | Update client capacity |

### Coaching

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/coaching/request` | Client | Send coaching request to trainer |
| POST | `/api/coaching/respond` | Trainer | Accept or reject a request |
| GET | `/api/coaching/my-clients` | Trainer | Get all clients |
| GET | `/api/coaching/my-trainer` | Client | Get assigned trainer |
| POST | `/api/coaching/message` | Auth | Send a message |
| GET | `/api/coaching/messages/:id` | Auth | Get conversation messages |

### Workouts

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/workouts/programs` | Trainer | Create workout program |
| GET | `/api/workouts/my-program` | Client | Get active program |
| GET | `/api/workouts/today` | Client | Get today's workout |
| POST | `/api/workouts/log` | Client | Log completed workout |
| GET | `/api/workouts/progress` | Client | Get progress stats |
| GET | `/api/workouts/progress-chart` | Client | Get chart data |
| POST | `/api/workouts/body-metrics` | Client | Log body measurements |

### Payments

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payments/subscription` | Client | Create platform subscription |
| POST | `/api/payments/trainer-payment` | Client | Pay a trainer |
| POST | `/api/payments/confirm` | Auth | Confirm a payment intent |
| GET | `/api/payments/history` | Client | Get payment history |
| GET | `/api/payments/earnings` | Trainer | Get earnings summary |
| GET | `/api/payments/earnings-summary` | Trainer | Get monthly breakdown |
| POST | `/api/payments/connect` | Trainer | Set up Stripe Connect |
| POST | `/api/payments/webhook` | Public | Stripe webhook handler |

### Uploads

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/uploads/document` | Auth | Upload verification document |
| POST | `/api/uploads/profile-image` | Auth | Upload profile photo |
| POST | `/api/uploads/video` | Trainer | Upload exercise video |
| POST | `/api/uploads/progress-photos` | Client | Upload progress photos |
| DELETE | `/api/uploads/:public_id` | Auth | Delete a file |

---

## User Roles

### Client
Registers via `/register/client`. Can browse trainers, request coaching, log workouts, track diet and progress, and manage subscription payments.

### Trainer
Registers via `/register/trainer`. Must upload a certification document and be approved by an admin before appearing in search results or accepting clients.

### Admin
Created directly in the database. Can log in at `/login` with admin credentials. Has access to the admin dashboard to review, approve, or reject trainer verification requests.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the existing patterns — ESM imports on the backend, functional components with hooks on the frontend, and all API calls go through `services/api.js`.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ for fitness enthusiasts everywhere</p>
  <p>
    <a href="#flexfit-">Back to top ↑</a>
  </p>
</div>
