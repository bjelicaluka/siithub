import axios from "axios";
import * as z from "zod";
import { GITHUB_ACCOUNT } from "../../../patterns";

const changeGithubAccountBodySchema = z.object({
  username: z.string()
    .regex(GITHUB_ACCOUNT, "Github username should be valid."),
  });


type ChangeGithubAccount = z.infer<typeof changeGithubAccountBodySchema>;

function changeGithubAccountFor(userId: string) {
  return (githubAccount: ChangeGithubAccount) => axios.put(`/api/users/${userId}/github`, githubAccount);
}

function deleteGithubAccountFor(userId: string) {
  return () => axios.delete(`/api/users/${userId}/github`);
}

export {
  changeGithubAccountBodySchema,
  changeGithubAccountFor,
  deleteGithubAccountFor
}

export type {
  ChangeGithubAccount
}