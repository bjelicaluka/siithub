import * as z from "zod";
import axios from "axios";

export const repositorySchema = z.object({
  name: z.string().min(1, "Name should be provided."),
  type: z.enum(["private", "public"]),
  description: z.string().optional(),
});

export type CreateRepository = z.infer<typeof repositorySchema>;

export type Repository = z.infer<typeof repositorySchema> & {
  _id: string;
  owner: string;
  counters?: { stars?: number; forks?: number };
  forkedFromRepo?: Repository;
};

export function createRepository(owner: string, repository: CreateRepository) {
  return axios.post("/api/repositories", { ...repository, owner });
}

export function deleteRepository(username: string, repo: string) {
  return () => axios.delete(`/api/repositories/${username}/${repo}`);
}

export function searchRepositories(owner: string, term: string) {
  return axios.get("/api/repositories", { params: { term, owner } });
}

export function getRepository(username: string, repo: string) {
  return axios.get(`/api/repositories/r/${username}/${repo}`);
}

export function getStarredRepositories(username: string) {
  return axios.get(`/api/repositories/starred-by/${username}`);
}

export function getUsersRepositories(username: string) {
  return axios.get(`/api/repositories/by-owner/${username}`);
}

export function getForks(username: string, repo: string) {
  return axios.get(`/api/repositories/forks/${username}/${repo}`);
}

export const forkSchema = z.object({
  name: z.string().min(1, "Name should be provided."),
  description: z.string().optional(),
  only1Branch: z.string().optional(),
});

export type CreateFork = z.infer<typeof forkSchema>;

export function createFork(createFork: CreateFork, username: string, repo: string) {
  return axios.post(`/api/repositories/fork/${username}/${repo}`, createFork);
}

export function findFork(username: string, repo: string, forkOwner: string) {
  return axios.get(`/api/repositories/fork/${username}/${repo}/${forkOwner}`);
}
