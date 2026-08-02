# AS HRM Services — Employee Management System

A full-stack, role-based employee management system for a multi-branch HR
services company. Handles onboarding, attendance, and payroll workflows
across three permission levels: **Admin**, **Owner**, and **Operator**.

**Live demo:** [employee-management-system-roan-eta.vercel.app](https://employee-management-system-roan-eta.vercel.app)
(frontend on Vercel, backend on Render — see [Deployment](#deployment) for
cold-start notes)

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Redux, CSS |
| Backend | Express, MongoDB (native driver), JWT, bcryptjs |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

## Roles & Permissions

| Role | Capabilities |
|---|---|
| **Admin** | Registers owners, views all owners |
| **Owner** | Adds/updates employees, views salary details, manages attendance |
| **Operator** | Registers/logs in per service center, records daily attendance |

All non-auth routes are protected by a `requireAuth(...roles)` middleware
that checks a JWT and enforces role-based access per endpoint.

## API Overview

### Admin (`/admin`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Admin login |
| `POST` | `/ownerregistration` | Register a new owner (admin only) |
| `GET` | `/owners` | List all owners (admin only) |
| `POST` | `/employees` | Add an employee (owner or admin) |

### Owner (`/owner`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Owner login |
| `POST` | `/addemployee` | Add an employee |
| `PUT` | `/employees/:id` | Update employee details |
| `POST` | `/employeedetails` | Fetch employee details |
| `POST` | `/employeesalarydetails/` | Compute salary details from attendance |

### Operator (`/operator`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register an operator (per service center) |
| `POST` | `/login` | Operator login |
| `POST` | `/employeeAttendance` | Record attendance |
| `GET` | `/attendance/roster` | Get the attendance roster |
| `POST` | `/attendance/roster` | Submit/update roster entries |
| `POST` | `/attendance/finalize` | Finalize attendance for a period |
| `POST` | `/attendance/unlock` | Reopen finalized attendance (owner/admin) |
| `GET` | `/employeedetails/:serviceCenter` | List employees by service center |
| `POST` | `/fetchattendance` | Fetch attendance records |

## Database Seeding

The backend includes an idempotent seed script for MongoDB — it safely
upserts default users, employees, and attendance records without creating
duplicates, and creates unique indexes for user IDs and attendance
`{ id, month, year }`.

```bash
cd backend
npm run seed
```

Seeds: 1 admin, 2 owners, 2 operators (as `deo` employees), 48 employees
with realistic Indian names and payroll details, plus attendance records
for the current and previous month.

### Default Login Credentials (seeded data)

| Role | ID | Password |
|---|---|---|
| Admin | `admin` | `admin@123` |
| Owner | `OWN-HYD-001` | `Password@123` |
| Owner | `OWN-HYD-002` | `Password@123` |
| Operator | `EMP1012` | `Password@123` |
| Operator | `EMP1021` | `Password@123` |

> Note: the current admin frontend login uses hardcoded credentials. The
> seed script also stores the admin user in `AdminCollection` for future
> backend-backed admin authentication.

## Running Locally

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=4000
DB_URL=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority
SECRET_KEY=replace_with_a_secure_jwt_secret
```

```bash
npm run seed   # optional: populate sample data
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:4000
```

```bash
npm start
```

## Deployment

The backend is deployed on Render's free tier, which cold-starts after
inactivity. To avoid a slow first request for users, the frontend pings
the backend on load and an UptimeRobot monitor keeps the Render instance
warm.

## Project Structure

```
backend/
├── APIs/
│   ├── admin-api.js
│   ├── owner-api.js
│   └── operator-api.js
├── Middlewares/
│   └── verifyToken.js
├── scripts/
│   └── seed.js
└── server.js

frontend/src/
├── components/
│   ├── admin/
│   ├── owner/
│   ├── operator/
│   ├── Employee/
│   ├── auth/
│   ├── landing/
│   ├── rootlayout/
│   └── ui/            # Shared dashboard components (StatCard, Toast, etc.)
├── config/
├── constants/
└── utils/
```
