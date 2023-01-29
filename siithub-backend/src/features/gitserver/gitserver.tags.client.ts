import axios from "axios";
import { config } from "../../config";
import { BadLogicException } from "../../error-handling/errors";

async function createTag(username: string, repoName: string, tagName: string, target: string): Promise<string> {
  const response = await axios.post(`${config.gitServer.url}/api/tags/${username}/${repoName}`, { tagName, target });

  if (response.status !== 200) {
    throw new BadLogicException("Error while creating a new tag.");
  }
  return response.data;
}

async function deleteTag(username: string, repoName: string, tagName: string): Promise<string> {
  const response = await axios.delete(`${config.gitServer.url}/api/tags/${username}/${repoName}/${tagName}`);

  if (response.status !== 200) {
    throw new BadLogicException("Error while deleting an existing tag.");
  }
  return response.data;
}

export type GitServerTagsClient = {
  createTag(username: string, repoName: string, tagName: string, target: string): Promise<string>;
  deleteTag(username: string, repoName: string, tagName: string): Promise<string>;
};

const gitServerTagsClient: GitServerTagsClient = {
  createTag,
  deleteTag,
};

export { gitServerTagsClient };
