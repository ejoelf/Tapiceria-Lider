require('dotenv').config({ quiet: true });
const config = {
  use_env_variable: 'DATABASE_URL', dialect: 'postgres', dialectModule: require('pg'), logging: false,
  dialectOptions: process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: true } } : {},
  migrationStorage: 'sequelize', seederStorage: 'sequelize',
};
module.exports = { development: config, test: config, production: config };
