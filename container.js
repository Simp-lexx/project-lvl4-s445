import dotenv from 'dotenv';
// import getModels from './models';
// import connect from './database';
import logger from './lib/logger';

dotenv.config();
// const models = getModels(connect);

export default { logger }; // , ...models
