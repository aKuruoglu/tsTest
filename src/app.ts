import * as dotenv from 'dotenv';

import logger from './component/logger';
import mongo from './component/mongodb';
import server from './component/server';

export default async (): Promise<void> => {
  try {
    if (process.env && process.env.NODE_ENV === 'test') {
      dotenv.config({ path: '.env.test' });
    } else {
      dotenv.config({ path: '.env' });
    }
    await mongo.init();
    await server.init();
  } catch (err) {
    logger.error(err);
  }
};
