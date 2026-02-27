import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:4000"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the public directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Import Routers
import authRouter from './router/auth.router.js';
import courseRouter from './router/course.router.js';
import learnerRouter from './router/learner.router.js';
import instructorRouter from './router/instructor.router.js';
import adminRouter from './router/admin.router.js';

// Mount Routers
app.use("/api/auth", authRouter);
app.use("/api/course", courseRouter);
app.use("/api/learner", learnerRouter);
app.use("/api/instructor", instructorRouter);
app.use("/api/admin", adminRouter);

export { app };
