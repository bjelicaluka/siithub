import axios from "axios";
import * as z from "zod";
import { ALPHANUMERIC_REGEX, LOWER_CASE_REGEX, NUMERIC_REGEX, SPECIAL_CHARACTERS_REGEX, UPPER_CASE_REGEX } from "../../../patterns";

const passwordSchema = z.string()
  .min(8, "Password should have at least 8 characters.")
  .regex(UPPER_CASE_REGEX, "Password should have at least 1 capital letter.")
  .regex(LOWER_CASE_REGEX, "Password should have at least 1 lower letter.")
  .regex(NUMERIC_REGEX, "Password should have at least 1 number.")
  .regex(SPECIAL_CHARACTERS_REGEX, "Password should have at least 1 special character.");

const createUserSchema = z.object({
  username: z.string()
    .min(3, "Username should have at least 3 characters.")
    .regex(ALPHANUMERIC_REGEX, "Username should contain only alphanumeric characters."),
  password: passwordSchema,
  githubUsername: z.string().optional(),
  name: z.string().min(1, "Name should be provided."),
  email: z.string().email("Email should be valid."),
  bio: z.string().default("")
});

type CreateUser = z.infer<typeof createUserSchema>;

function getUsers() {
  return axios.get('/api/users');
}

function createUser(user: CreateUser) {
  return axios.post('/api/users', user);
}

export {
  createUserSchema,
  passwordSchema,
  getUsers,
  createUser
}

export type {
  CreateUser
}