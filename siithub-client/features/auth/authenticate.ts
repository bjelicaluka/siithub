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

export {
  credentialsSchema,
  authenticate
}

export type {
  Credentials,
  AuthenticatedUser
}