import express, { Express } from "express";
import { config } from "./config";

const app: Express = express();

app.listen(config.port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${config.port}`);
});
