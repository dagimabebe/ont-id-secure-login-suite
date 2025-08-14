
import cors from 'cors';
import config from '../config.js';

const corsOptions = {
  origin: config.CORS_ORIGIN,
  credentials: true,
};

export default cors(corsOptions);
