# HostelOps – Smart Hostel Complaint & Maintenance Management System

A full-stack web application for managing hostel complaints and maintenance requests. Students can submit and track complaints, while admins can manage, filter, and resolve them.

## Features

- **Student Module**: Register, login, submit complaints, view complaint status
- **Admin Module**: View all complaints, filter by category/status/priority, update status, dashboard statistics
- **JWT Authentication**: Secure login with 1-hour token expiry
- **Role-Based Access**: Student and Admin roles with protected routes
- **Responsive UI**: Clean, card-based layout that works on all screen sizes

## Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | React 18, Vite, Axios, React Router         |
| Backend   | Node.js, Express.js, Sequelize ORM          |
| Database  | PostgreSQL                                  |
| Auth      | JWT, bcryptjs                               |

## Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** installed and running locally
- **npm** (comes with Node.js)

## Database Setup

1. Open your PostgreSQL shell (psql) or pgAdmin
2. Create the database:

```sql
CREATE DATABASE hostelops;
```

3. Note your PostgreSQL username and password (default is usually `postgres`)

## Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
# PORT=5000
# DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/hostelops
# JWT_SECRET=your_secret_key_here

# Install dependencies
npm install

# Start the development server
npm run dev
```

The backend will start on `http://localhost:5000`.

Tables are created automatically when the server starts (Sequelize sync).

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`.

## Creating the Default Admin

After starting the backend, run:

```bash
cd backend
npm run seed:admin
```

This creates an admin account:
- **Email**: `admin@hostelops.com`
- **Password**: `admin123`

> ⚠️ Change the admin password in production.

## API Documentation

### Auth
| Method | Endpoint             | Description       | Auth |
|--------|---------------------|--------------------|------|
| POST   | `/api/auth/register` | Register a student | No   |
| POST   | `/api/auth/login`    | Login              | No   |

### Student (Authenticated)
| Method | Endpoint           | Description               | Auth     |
|--------|--------------------|---------------------------|----------|
| POST   | `/api/complaints`  | Submit a complaint        | Required |
| GET    | `/api/complaints`  | Get student's complaints  | Required |

### Admin (Admin Only)
| Method | Endpoint                     | Description               | Auth  |
|--------|------------------------------|---------------------------|-------|
| GET    | `/api/admin/complaints`      | Get all complaints        | Admin |
| PATCH  | `/api/admin/complaints/:id`  | Update complaint status   | Admin |
| GET    | `/api/admin/stats`           | Get dashboard statistics  | Admin |

### Health Check
| Method | Endpoint   | Description    |
|--------|------------|----------------|
| GET    | `/health`  | Server status  |

### Request/Response Examples

**Register**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "block": "Block A",
  "room": "101"
}
```

**Submit Complaint**
```json
POST /api/complaints
{
  "category": "Electrical",
  "description": "Fan not working in room 101",
  "priority": "High"
}
```

**Update Complaint Status (Admin)**
```json
PATCH /api/admin/complaints/1
{
  "status": "In Progress"
}
```

## Project Structure

```
HOSTEL PROJECT/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   └── complaintController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── Complaint.js
│   │   │   ├── User.js
│   │   │   └── index.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   └── complaintRoutes.js
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   └── seedAdmin.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── SubmitComplaint.jsx
│   │   ├── routes/
│   │   │   ├── AdminRoute.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```
