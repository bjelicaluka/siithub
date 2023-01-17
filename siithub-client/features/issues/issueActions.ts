import axios from "axios";
import { type Label } from "../labels/labelActions";
import { type User } from "../users/user.model";
import { type Repository } from "../repository/repository.service";
import { type Milestone } from "../milestones/milestoneActions";

export enum CommentState {
  Existing,
  Hidden,
  Deleted,
}

export type Comment = {
  _id: string;
  text: string;
  state: CommentState;
  reactions: any;
};

export enum IssueState {
  Open,
  Closed,
  Reopened,
}

export type IssueCSM = {
  timeStamp?: Date;
  lastModified?: Date;
  state: IssueState;
  title?: string;
  description?: string;
  labels?: Label["_id"][];
  milestones?: Milestone["_id"][];
  assignees?: User["_id"][];
  comments?: Comment[];
};

type Issue = {
  _id: string;
  repositoryId: Repository["_id"];
  localId: number;
  events: any[];
  csm: IssueCSM;
  participants?: { [uid: string]: User };
};

type IssuesQuery = {
  title?: string;
  state?: IssueState[];
  author?: User["_id"];
  assignees?: User["_id"][];
  labels?: Label["_id"][];
  milestones?: Milestone["_id"][];
  sort?: any;
};

type CreateIssue = Omit<Issue, "_id" | "csm" | "localId">;
type UpdateIssue = Omit<Issue, "csm" | "_id">;

function getIssue(repositoryId: Repository["_id"], localId: number) {
  return axios.get(`/api/repositories/${repositoryId}/issues/${localId}`);
}

function getIssues(repositoryId: Repository["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/issues/`);
}

function searchIssues(query: IssuesQuery, repositoryId: Repository["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/issues/search`, { params: query });
}

function createIssue(issue: CreateIssue) {
  return axios.post(`/api/repositories/${issue.repositoryId}/issues`, issue);
}

function updateIssue(issue: UpdateIssue) {
  return axios.put(`/api/repositories/${issue.repositoryId}/issues/${issue.localId}`, issue);
}

export { getIssue, getIssues, searchIssues, createIssue, updateIssue };

export type { Issue, CreateIssue, UpdateIssue, IssuesQuery };
