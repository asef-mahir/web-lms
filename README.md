🚀 Edulearn – Scalable MERN Learning Management System

Edulearn is a full-featured, production-style Learning Management System (LMS) built with the MERN stack.
It supports learners, instructors, and administrators with role-based access control, secure payments, media handling, and revenue distribution logic.

Designed to simulate a real-world EdTech SaaS platform.

🏗 System Architecture
🧩 Architecture Overview

Frontend → React SPA (Vite)

Backend → RESTful API (Express 5)

Database → MongoDB (Mongoose ODM)

Authentication → JWT + Refresh Tokens (HTTP-only cookies)

Media Storage → Cloudinary

Revenue Engine → Automated 80/20 split logic

🔐 Role-Based Access Control

Learner

Instructor

Admin

Protected routes enforced via middleware and token validation.

✨ Core Features
👨‍🎓 Learner

Browse & filter courses

Secure enrollment flow

Video course player with progress tracking

Personal dashboard

Purchase history tracking

(Planned) Certificate generation

👨‍🏫 Instructor

Create & manage courses

Upload videos, PDFs, images, MCQs

Earnings dashboard with visual analytics

Student enrollment management

Transaction tracking

👮 Admin

Platform-wide analytics

User management

Revenue monitoring

Automatic 80/20 revenue split enforcement

💰 Revenue Model

Instructor → 80%

Platform → 20%

Revenue is calculated and distributed automatically upon enrollment.

🛠 Tech Stack
Frontend

React 19

Vite

Tailwind CSS 4

React Router 7

Recharts

Lucide Icons

Backend

Node.js

Express 5

MongoDB + Mongoose

JWT Authentication

Multer (file uploads)

Cloudinary (media storage)

📂 Project Structure
learning-management-system/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
└── frontend/
    ├── components/
    ├── pages/
    ├── context/
    ├── hooks/
    └── main.jsx
⚙️ Getting Started
Prerequisites

Node.js (v18+)

MongoDB (Local or Atlas)

Cloudinary account

🔹 Installation
1️⃣ Clone the Repository
git clone https://github.com/your-username/learning-management-system.git
cd learning-management-system
2️⃣ Backend Setup
cd backend
npm install

Create .env file:

PORT=5000
MONGODB_URL=your_mongodb_url
CLIENT_URL=http://localhost:4000
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

Run backend:

npm run dev
3️⃣ Frontend Setup
cd ../frontend
npm install
npm run dev

Frontend runs at:

http://localhost:4000
🔒 Security Highlights

HTTP-only cookie storage for refresh tokens

Access token expiration strategy

Role-based middleware

Environment variable protection

Cloud-based media storage

📄 License

ISC License
