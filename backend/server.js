
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import corsMiddleware from './src/middlewares/cors.js';
import rateLimit from './src/middlewares/rateLimit.js';
import errorMiddleware from './src/middlewares/error.js';
import routes from './src/routes.js';
import config from './src/config.js';

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: '4kb' }));
app.use(cookieParser());
app.use('/api/auth', rateLimit);
app.use('/api', routes);
app.use(errorMiddleware);

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
