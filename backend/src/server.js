import app from './app.js';
import env from './config/env.js';
import { sequelize } from './database/v2.js';
try {
  await sequelize.authenticate();
  const server = app.listen(env.PORT, '0.0.0.0', () =>
    console.log(`Líder API lista en http://localhost:${env.PORT}/api`),
  );
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, () =>
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      }),
    );
} catch (error) {
  console.error('No se pudo iniciar Líder API. Revisá la conexión y las migraciones.');
  process.exit(1);
}
