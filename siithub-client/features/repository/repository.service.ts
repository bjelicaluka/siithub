import * as z from "zod";
import axios from "axios";

export const repositorySchema = z.object({
  name: z.string().min(1, "Name should be provided."),
  description: z.string().optional(),
});

export type Repository = z.infer<typeof repositorySchema>;

export function createRepository(owner: string, repository: Repository) {
  return axios.post("/api/repositories", { ...repository, owner });
}
