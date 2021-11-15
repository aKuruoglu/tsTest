import config from 'config';
import fs from 'fs';
import { connect, Schema } from 'mongoose';
import path from 'path';
import logger from './logger';

export interface Collections {
  [key: string]: object;
}

class Mongo {
  public collections: Collections = {};

  public async init(): Promise<void> {
    await connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`, config.get('mongo'));
    this.crawler();
    logger.info('Mongo connected');
  }

  private crawler(): void {
    const res = fs.readdirSync(path.join(__dirname, '../entities'));

    this.collections = res.reduce((models, item) => {
      const pathFile = `../entities/${item}/schema`;

      try {
        const schema: Schema = require(pathFile).default;
        return{
          ...models,
          [item]: schema,
        };
      } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
          throw e;
        }
      }
    }, {});
  }
}

export default new Mongo();
