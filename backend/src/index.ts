import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import athleteRoutes from './routes/athleteRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import lineupRoutes from './routes/lineupRoutes.js';
import scoreRoutes from './routes/scoreRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use('/api', authRoutes);
app.use('/api/athletes', athleteRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/lineups', lineupRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/upload', uploadRoutes);

// Ensure uploads directory exists (simple check, ideally in a setup script)
import fs from 'fs';
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)){
    fs.mkdirSync(uploadsPath);
}
app.use('/uploads', express.static(uploadsPath));

app.get('/', (req, res) => {
  res.send('Muscle Myths API is running with Bleeding Edge Tech!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
