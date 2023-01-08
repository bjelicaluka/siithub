import dotenv from "dotenv";

dotenv.config();

export const homePath = "/home";

export const config = {
  port: process.env.PORT,
};
