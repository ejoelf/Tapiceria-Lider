import "./database/models/index.js";
import app from "./app.js";
import env from "./config/env.js";
import { connectDB } from "./config/db.js";

async function startServer() {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log("====================================");
      console.log(`🚀 Servidor corriendo en puerto ${env.PORT}`);
      console.log(`🌐 API: http://localhost:${env.PORT}/api`);
      console.log(`❤️ Health: http://localhost:${env.PORT}/api/health`);
      console.log("====================================");
    });
  } catch (error) {
    console.error("❌ No se pudo iniciar el servidor");
    process.exit(1);
  }
}

startServer();