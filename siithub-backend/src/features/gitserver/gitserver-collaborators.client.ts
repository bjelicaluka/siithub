import axios from "axios";
import { config } from "../../config";

async function addCollaborator(username: string, repositoryName: string): Promise<any> {
  return await axios.post(
    `${config.gitServer.url}/api/repositories/${encodeURIComponent(repositoryName)}/collaborators`,
    {
      collaborator: username,
    }
  );
}

async function removeCollaborator(username: string, repositoryName: string): Promise<any> {
  return await axios.delete(
    `${config.gitServer.url}/api/repositories/${encodeURIComponent(repositoryName)}/collaborators/${username}`
  );
}

export type GitServerCollaboratorsClient = {
  addCollaborator(username: string, repositoryName: string): Promise<any>;
  removeCollaborator(username: string, repositoryName: string): Promise<any>;
};

const gitServerCollaboratorsClient: GitServerCollaboratorsClient = {
  addCollaborator,
  removeCollaborator,
};

export { gitServerCollaboratorsClient };
