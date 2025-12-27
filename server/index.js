import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(); // Looks in CWD
dotenv.config({ path: './server/.env' }); // Explicitly check server folder if running from root
dotenv.config({ path: '.env.local' });     // Check root .env.local if running from root
dotenv.config({ path: '../.env.local' });  // Check parent if running from server folder

console.log("[Phase Server] Environment Configured.");
console.log("- GROQ_API_KEY detected:", process.env.GROQ_API_KEY ? "YES" : "NO");
console.log("- VITE_GROQ_API_KEY detected:", process.env.VITE_GROQ_API_KEY ? "YES" : "NO");
console.log("- SMTP_USER detected:", process.env.SMTP_USER ? "YES" : "NO");
console.log("- SMTP_PASS detected:", process.env.SMTP_PASS ? "YES" : "NO");


import dbConnect from './lib/db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/project.js';
import ideaRoutes from './routes/idea.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' })); // Increased limit for base64 image uploads
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/idea', ideaRoutes);
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

// Connect to DB and Start Server
dbConnect()
    .then(() => {
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error("Failed to start server:", err);
    });
