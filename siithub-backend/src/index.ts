import express, { Express } from "express";
import { apiRoutes } from "./api.routes";
import { config } from "./config";
import { getConnection } from "./db/mongo.utils";

const app: Express = express();

app.use("/api", apiRoutes);

app.listen(config.port, () => {
  getConnection();
  console.log(`⚡️[server]: Server is running at https://localhost:${config.port}`);
});
