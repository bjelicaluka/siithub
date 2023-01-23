import axios from "axios";
import { type Repository } from "../repository/repository.service";
import { type Label } from "../labels/labelActions";
import { type Milestone } from "../milestones/milestoneActions";
import { type User } from "../users/user.model";
import { type Comment } from "../issues/issueActions";

type PullRequestComment = Comment & {
  conversation?: string;
};

type PullRequestConversation = {
  _id: string;
  isResolved: boolean;
  topic: string;
  changes: any;
  comments?: PullRequestComment[];
};

export enum PullRequestState {
  Opened,
  ChangesRequired,
  Approved,
  Canceled,
  Merged,
}

export type PullRequestCSM = {
  author: string;
  isClosed: boolean;
  state: PullRequestState;
  base: string;
  compare: string;
  title: string;
  labels?: Label["_id"][];
  milestones?: Milestone["_id"][];
  assignees?: User["_id"][];
  comments?: PullRequestComment[];
  conversations?: PullRequestConversation[];
};

type PullRequest = {
  _id: string;
  repositoryId: Repository["_id"];
  localId: number;
  events: any[];
  csm: PullRequestCSM;
  participants: { [uid: string]: User };
};

type CreatePullRequest = Omit<PullRequest, "_id" | "csm" | "localId" | "participants">;
type UpdatePullRequest = Omit<PullRequest, "csm" | "_id" | "participants">;

type PullRequestsQuery = {
  title?: string;
  state?: PullRequestState[];
  author?: User["_id"];
  assignees?: User["_id"][];
  labels?: Label["_id"][];
  milestones?: Milestone["_id"][];
  sort?: any;
};

function getPullRequest(repositoryId: Repository["_id"], localId: number) {
  return axios.get(`/api/repositories/${repositoryId}/pull-requests/${localId}`);
}

function getPullRequests(repositoryId: Repository["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/pull-requests/`);
}

function searchPullRequests(query: PullRequestsQuery, repositoryId: Repository["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/pull-requests/search`, { params: query });
}

function createPullRequest(pullRequest: CreatePullRequest) {
  return axios.post(`/api/repositories/${pullRequest.repositoryId}/pull-requests`, pullRequest);
}

function updatePullRequest(pullRequest: UpdatePullRequest) {
  return axios.put(`/api/repositories/${pullRequest.repositoryId}/pull-requests/${pullRequest.localId}`, pullRequest);
}

export { getPullRequest, getPullRequests, searchPullRequests, createPullRequest, updatePullRequest };

export type {
  PullRequest,
  CreatePullRequest,
  UpdatePullRequest,
  PullRequestComment,
  PullRequestConversation,
  PullRequestsQuery,
};
