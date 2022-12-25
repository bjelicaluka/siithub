import axios from "axios";
import * as z from "zod";
import { type AuthUser } from "../../core/contexts/Auth";

const credentialsSchema = z.object({
  username: z.string()
  .min(1, "Username should be provided."),
password: z.string()
  .min(1, "Password should be provided.")
});

type Credentials = z.infer<typeof credentialsSchema>;

type AuthenticatedUser = {
  user: AuthUser,
  token: string
}

function authenticate(credentials: Credentials) {
  return axios.post('/api/auth', credentials);
}

type GithubAuth = {
  code: string,
  state: string
}

function authenticateGithub(auth: GithubAuth) {
  return axios.post('/api/auth/github', undefined, { params: auth });
}

export {
  credentialsSchema,
  authenticate,
  authenticateGithub
}

export type {
  Credentials,
  AuthenticatedUser,
  GithubAuth
}