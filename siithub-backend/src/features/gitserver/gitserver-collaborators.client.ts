import axios from "axios";
import { config } from "../../config";

async function addCollaborator(owner: string, repo: string, collaborator: string): Promise<any> {
  return await axios.post(`${config.gitServer.url}/api/collaborators/${owner}/${repo}`, {
    collaborator,
  });
}

async function removeCollaborator(owner: string, repo: string, collaborator: string): Promise<any> {
  return await axios.delete(`${config.gitServer.url}/api/collaborators/${owner}/${repo}/${collaborator}`);
}

export type GitServerCollaboratorsClient = {
  addCollaborator(owner: string, repo: string, collaborator: string): Promise<any>;
  removeCollaborator(owner: string, repo: string, collaborator: string): Promise<any>;
};

const gitServerCollaboratorsClient: GitServerCollaboratorsClient = {
  addCollaborator,
  removeCollaborator,
};

export { gitServerCollaboratorsClient };
