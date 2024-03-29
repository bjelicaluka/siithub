import axios from "axios";
import { z } from "zod";
import { Repository } from "../repository/repository.service";

const milestoneBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().default(""),
  dueDate: z.nullable(z.string()),
});

type CreateMilestone = z.infer<typeof milestoneBodySchema>;
type UpdateMilestone = CreateMilestone;
type Milestone = CreateMilestone & {
  _id: string;
  localId: number;
  isOpen: boolean;
  issuesInfo: {
    open: number;
    closed: number;
    lastUpdated: Date;
  };
};

function searchRepositoryMilestones(username: string, repo: string, title: string = "") {
  return axios.get(`/api/${username}/${repo}/milestones/search`, { params: { title } });
}
function getRepositoryMilestones(username: string, repo: string, open: boolean) {
  return axios.get(`/api/${username}/${repo}/milestones`, { params: open ? {} : { state: "closed" } });
}
function getMilestonesByRepositoryId(repositoryId: Repository["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/milestones`);
}
function getMilestone(username: string, repo: string, localId: number) {
  return axios.get(`/api/${username}/${repo}/milestones/${localId}`);
}
function createMilestoneFor(username: string, repo: string) {
  return (milestone: CreateMilestone) => axios.post(`/api/${username}/${repo}/milestones`, milestone);
}
function updateMilestoneFor(username: string, repo: string, localId: number) {
  return (milestone: UpdateMilestone) => axios.put(`/api/${username}/${repo}/milestones/${localId}`, milestone);
}
function deleteMilestoneFor(username: string, repo: string) {
  return (milestone: Milestone) => axios.delete(`/api/${username}/${repo}/milestones/${milestone?.localId}`);
}
function closeMilestoneFor(username: string, repo: string) {
  return (milestone: Milestone) => axios.put(`/api/${username}/${repo}/milestones/${milestone?.localId}/close`);
}
function openMilestoneFor(username: string, repo: string) {
  return (milestone: Milestone) => axios.put(`/api/${username}/${repo}/milestones/${milestone?.localId}/open`);
}

export {
  milestoneBodySchema,
  createMilestoneFor,
  updateMilestoneFor,
  deleteMilestoneFor,
  getRepositoryMilestones,
  getMilestone,
  closeMilestoneFor,
  openMilestoneFor,
  searchRepositoryMilestones,
  getMilestonesByRepositoryId,
};

export type { CreateMilestone, UpdateMilestone, Milestone };
