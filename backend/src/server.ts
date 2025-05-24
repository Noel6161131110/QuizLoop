import express from 'express';
import dotenv from 'dotenv';
import ConnectDB from './config/db.ts';
import morgan from 'morgan';
import cors from 'cors';
import FileRouter from './routes/FileRoutes.ts';
import MCQRouter from './routes/MCQRoutes.ts';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.ts';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { setupNotificationServer } from './controllers/NotificationController.ts';

dotenv.config();

ConnectDB();

const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: "*",
  methods: ["*"],
  credentials: true
}));

app.use(express.json({
  limit: '2048MB',
}));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(morgan('dev'));

app.use(express.static('public'));
// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.use('/api/files', FileRouter);
app.use('/api/mcqs', MCQRouter);

const server = http.createServer(app);

setupNotificationServer(server).catch(console.error);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI at http://localhost:${PORT}/docs`);
});