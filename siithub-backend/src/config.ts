import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT,
  db: {
    url: process.env.MONGODB_URL ?? "mongodb://localhost:27017",
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
    database: process.env.MONGODB_DATABASE,
  },
  gitServer: {
    url: process.env.GITSERVER_URL,
  },
};
