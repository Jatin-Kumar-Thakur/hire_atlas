# HireAtlas — Job Application Tracker

![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)

A full-stack MERN application to track your job applications end-to-end — with a Chrome Extension that auto-fills job details from LinkedIn, Naukri, and Internshala with one click.

## Live Demo

| Service | URL |
|---------|-----|
| Frontend | https://hire-atlas.vercel.app |
| Backend API | https://hireatlas-api.onrender.com |

---

## Features

- **Track applications** across LinkedIn, Naukri, Internshala, and any other source
- **Kanban board** with drag-and-drop across 6 status columns
- **Chrome Extension** — one-click save from LinkedIn, Naukri, and Internshala with auto-fill
- **Analytics dashboard** — charts for status breakdown, source breakdown, weekly/monthly trends
- **Email reminders** — automatic follow-up emails via node-cron + Nodemailer
- **Interview round tracker** — log each round, update status, view timeline
- **CSV export and import** — download your data or bulk import applications
- **JWT Authentication** — register, login, forgot/reset password

---

## Tech Stack

### Frontend
| Library | Purpose |
|---------|---------|
| React 18 + Vite | UI framework and build tool |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| Recharts | Analytics charts |
| @dnd-kit | Kanban drag-and-drop |
| Axios | HTTP client |

### Backend
| Library | Purpose |
|---------|---------|
| Node.js 18 + Express | REST API server |
| MongoDB + Mongoose | Database and ODM |
| JWT (jsonwebtoken) | Authentication |
| Nodemailer | Email delivery |
| node-cron | Scheduled reminders |
| multer + csv-parser | CSV import |
| csv-writer | CSV export |
| helmet + compression | Security and performance |

### Chrome Extension
| Technology | Detail |
|------------|--------|
| Manifest V3 | Chrome Extension platform |
| Content Scripts | Auto-scrape job details |
| Service Worker | Background badge management |
| chrome.storage.local | Persist token + settings |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Gmail account with an App Password (for email reminders)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/job-application-tracker.git
cd job-application-tracker
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.production.example .env
# Edit .env with your values (see Environment Variables below)
npm run dev
```

### 3. Set up the frontend

```bash
cd frontend
npm install
# Development uses http://localhost:5000 automatically via .env.development
npm run dev
```

### 4. Load the Chrome Extension

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. The Job Tracker icon appears in the toolbar

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | 64-character random secret | `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Sender email | `your@gmail.com` |
| `EMAIL_PASS` | Gmail App Password | 16-char code |
| `CLIENT_URL` | Frontend URL (CORS) | `https://hire-atlas.vercel.app` |
| `CLIENT_URL_WWW` | Frontend www URL (CORS) | `https://www.hire-atlas.vercel.app` |
| `NODE_ENV` | Environment | `production` |

### Frontend (`frontend/.env.production`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://hireatlas-api.onrender.com/api` |

---

## Project Structure

```
job-tracker/
├── backend/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, error handler, validation
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routers
│   ├── utils/          # Cron jobs, email, analytics cache
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/        # Axios instance + service files
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React context providers
│   │   ├── hooks/      # Custom hooks
│   │   ├── pages/      # Route-level page components
│   │   └── utils/      # Helpers (CSV, keep-alive)
│   ├── vercel.json
│   └── vite.config.js
└── extension/
    ├── background/     # Service worker
    ├── content/        # Platform scrapers
    ├── icons/          # Extension icons
    ├── popup/          # Popup UI
    ├── utils/          # Storage + API helpers
    └── manifest.json
```

---

## Screenshots

> Add screenshots after deployment.

| Dashboard | Kanban | Analytics |
|-----------|--------|-----------|
| _screenshot_ | _screenshot_ | _screenshot_ |

| Chrome Extension | CSV Import | Interview Tracker |
|------------------|-----------|-------------------|
| _screenshot_ | _screenshot_ | _screenshot_ |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/verify-token` | Verify JWT |
| GET | `/api/applications` | List applications |
| POST | `/api/applications` | Create application |
| PUT | `/api/applications/:id` | Update application |
| DELETE | `/api/applications/:id` | Delete application |
| GET | `/api/applications/stats` | Dashboard stats |
| GET | `/api/applications/export` | Export CSV |
| POST | `/api/applications/import` | Import CSV |
| POST | `/api/applications/quick-add` | Extension save |
| GET | `/api/analytics/summary` | Analytics data |
| GET | `/api/notifications` | Notifications |

---

## Deployment

See [DEPLOY.md](DEPLOY.md) for full step-by-step deployment instructions.

---

## License

MIT © 2025
