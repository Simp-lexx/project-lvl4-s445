import Sequelize from 'sequelize';
import dotenv from 'dotenv';
import pg from 'pg';

pg.defaults.ssl = true;

dotenv.config();

export default new Sequelize(process.env.DATABASE_URL || 'sqlite:./db.dev.sqlite');
