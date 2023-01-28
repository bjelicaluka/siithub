import axios from "axios";
import { type Repository } from "../repository/repository.service";
import { type User } from "../users/user.model";

type TagCreate = {
  name: string;
  description: string;
  version: string;
  branch: string;
  isLatest: boolean;
  isPreRelease: boolean;
};

type Tag = TagCreate & {
  _id: string;
  commitSha: string;
  repositoryId: Repository["_id"];
  author: User["_id"];
  timeStamp: Date;
};

type TagWithRepository = Tag & {
  repository: Repository;
};

function getTagsByRepo(owner: string, name: string) {
  return axios.get(`/api/repositories/${owner}/${name}/tags`);
}

function searchTagsInRepo(owner: string, name: string, tagName: string) {
  return axios.get(`/api/repositories/${owner}/${name}/tags`, { params: { name: tagName } });
}

function getTagsCountByRepo(owner: string, name: string) {
  return axios.get(`/api/repositories/${owner}/${name}/tags/count`);
}

function createTag(owner: string, name: string) {
  return (tag: TagCreate) => axios.post(`/api/repositories/${owner}/${name}/tags`, tag);
}

function deleteTag(owner: string, name: string) {
  return (version: string) => axios.delete(`/api/repositories/${owner}/${name}/tags/${version}`);
}

export { getTagsByRepo, searchTagsInRepo, getTagsCountByRepo, createTag, deleteTag };

export type { Tag, TagCreate, TagWithRepository };
