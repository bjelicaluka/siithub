import axios from "axios";
import { Label } from "../labels/labelActions";

export enum IssueState {
  Open,
  Closed,
  Reopened
}

export type IssueCSM = {
  timeStamp?: Date,
  lastModified?: Date,
  state?: IssueState,
  title?: string,
  description?: string,
  labels?: Label['_id'][],
  // TODO: Srediti TIP
  assignees?: Label['_id'][],
};

type Issue = {
  _id: string,
  repositoryId: string
  events: any[],
  csm: IssueCSM
}

type CreateIssue = Omit<Issue, "_id"|"csm"|"repositoryId">
type UpdateIssue = Omit<Issue, "csm"|"repositoryId">

function getIssue(repositoryId: string, id: string) {
  return axios.get(`/api/issues/${id}`);
}

function getIssues(repositoryId: string) {
  return axios.get(`/api/issues/`);
}

function searchIssues(params: any, repositoryId: string) {
  return axios.post(`/api/issues/search`, params);
}

function createIssue(issue: CreateIssue) {
  return axios.post(`/api/issues`, issue);
}

function updateIssue(issue: UpdateIssue) {
  return axios.put(`/api/issues`, issue);
}


export {
  getIssue,
  getIssues,
  searchIssues,
  createIssue,
  updateIssue
}

export type {
  Issue
}