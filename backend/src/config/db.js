import { Sequelize } from 'sequelize';
import pg from 'pg';
import env from './env.js';
export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: pg,
  logging: false,
  define: { underscored: true, timestamps: true },
  dialectOptions: env.DB_SSL ? { ssl: { require: true, rejectUnauthorized: true } } : {},
  pool: { max: Number(process.env.DB_POOL_MAX || 5), min: 0, acquire: 30000, idle: 10000 },
});
export const connectDB = () => sequelize.authenticate();
export default sequelize;
