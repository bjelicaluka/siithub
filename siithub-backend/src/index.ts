import express, { Express, NextFunction, Request, Response } from "express";
import { apiRoutes } from "./api.routes";
import { config } from "./config";
import { getConnection } from "./db/mongo.utils";
import { ErrorHandler } from "./error-handling/error-handler";

const app: Express = express();

const errorHandler = (error: TypeError , request: Request, response: Response, next: NextFunction) => {
  ErrorHandler.forResponse(response).handleError(error as Error);
  next(error);
};

app.use(express.json())
   .use("/api", apiRoutes)
   .use(errorHandler);

app.listen(config.port, () => {
  getConnection();
  console.log(`⚡️[server]: Server is running at https://localhost:${config.port}`);
});
