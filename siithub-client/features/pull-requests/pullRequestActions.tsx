import axios from "axios";
import { type Repository } from "../repository/repository.service";
import { type Label } from "../labels/labelActions";
import { type Milestone } from "../milestones/milestoneActions";
import { type User } from "../users/user.model";

export type PullRequestCSM = {
  base: string;
  compare: string;
  title: string;
  labels?: Label["_id"][];
  milestones?: Milestone["_id"][];
  assignees?: User["_id"][];
};

type PullRequest = {
  _id: string;
  repositoryId: Repository["_id"];
  localId: number;
  events: any[];
  csm: PullRequestCSM;
};

type CreatePullRequest = Omit<PullRequest, "_id" | "csm" | "localId">;
type UpdatePullRequest = Omit<PullRequest, "csm" | "_id">;

function getPullRequest(repositoryId: Repository["_id"], localId: number) {
  return axios.get(`/api/repositories/${repositoryId}/pull-requests/${localId}`);
}

function getPullRequests(repositoryId: Repository["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/pull-requests/`);
}

function createPullRequest(pullRequest: CreatePullRequest) {
  return axios.post(`/api/repositories/${pullRequest.repositoryId}/pull-requests`, pullRequest);
}

function updatePullRequest(pullRequest: UpdatePullRequest) {
  return axios.put(`/api/repositories/${pullRequest.repositoryId}/pull-requests/${pullRequest.localId}`, pullRequest);
}

export { getPullRequest, getPullRequests, createPullRequest, updatePullRequest };

export type { PullRequest, CreatePullRequest, UpdatePullRequest };
