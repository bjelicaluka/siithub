import * as z from "zod";
import axios from "axios";

export const repositorySchema = z.object({
  name: z.string().min(1, "Name should be provided."),
  type: z.enum(["private", "public"]),
  description: z.string().optional(),
});

export type CreateRepository = z.infer<typeof repositorySchema>;

export type Repository = z.infer<typeof repositorySchema> & { _id: string };

export function createRepository(owner: string, repository: CreateRepository) {
  return axios.post("/api/repositories", { ...repository, owner });
}
