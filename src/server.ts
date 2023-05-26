import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';

import routes from './routes/liquidationAlerts';
import { RedisService } from './services/RedisService';
import { TelegramService } from './services/TelegramService';

const router: Express = express();
router.use(express.text());
router.use(express.json());

/** Connect to Redis */
const redisService = new RedisService();
redisService.setup();

/** Logging */
router.use(morgan('dev'));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

/** RULES OF OUR API */
router.use((req, res, next) => {
  // set the CORS policy
  res.header('Access-Control-Allow-Origin', '*');
  // set the CORS headers
  res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
  // set the CORS method headers
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
    return res.status(200).json({});
  }
  next();
});

/** Routes */
router.use('/', routes);

/** Error handling */
router.use((req, res, next) => {
  const error = new Error('not found');
  return res.status(404).json({
      message: error.message
  });
});

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 6060;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));

/** Telegram Bot */
export const telegramService = new TelegramService();

/** Exports */
export default redisService;
