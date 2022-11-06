import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { apiRoutes } from "./api.routes";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(apiRoutes);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
