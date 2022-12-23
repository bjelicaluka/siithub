import axios from "axios";
import { type Label } from "../labels/labelActions";
import { type User } from "../users/user.model";
import { type Repository } from "../repository/repository.service";

export enum IssueState {
  Open,
  Closed,
  Reopened
}

export type IssueCSM = {
  timeStamp?: Date,
  lastModified?: Date,
  state: IssueState,
  title?: string,
  description?: string,
  labels?: Label['_id'][],
  assignees?: User['_id'][],
};

type Issue = {
  _id: string,
  repositoryId: Repository["_id"]
  events: any[],
  csm: IssueCSM
}

type IssuesQuery = {
  title?: string,
  state?: IssueState[],
  author?: User["_id"],
  assignees?: User["_id"][],
  labels?: Label["_id"][],
  sort?: any
}

type CreateIssue = Omit<Issue, "_id"|"csm">
type UpdateIssue = Omit<Issue, "csm">

function getIssue(repositoryId: Repository["_id"], id: Issue["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/issues/${id}`);
}

function getIssues(repositoryId: Repository["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/issues/`);
}

function searchIssues(query: IssuesQuery, repositoryId: Repository["_id"]) {
  return axios.post(`/api/repositories/${repositoryId}/issues/search`, query);
}

function createIssue(issue: CreateIssue) {
  return axios.post(`/api/repositories/${issue.repositoryId}/issues`, issue);
}

function updateIssue(issue: UpdateIssue) {
  return axios.put(`/api/repositories/${issue.repositoryId}/issues`, issue);
}


export {
  getIssue,
  getIssues,
  searchIssues,
  createIssue,
  updateIssue
}

export type {
  Issue,
  CreateIssue,
  UpdateIssue,
  IssuesQuery
}