import axios from "axios";
import { type Repository } from "../repository/repository.service";
import { type User } from "../users/user.model";

type AddCollaborator = { userId: User["_id"] };
type RemoveCollaborator = AddCollaborator;

type Collaborator = AddCollaborator & {
  _id: string;
  repositoryId: Repository["_id"];
  user: User;
};

function searchCollaborators(username: string, repo: string, name: string = "") {
  return axios.get(`/api/repositories/${username}/${repo}/collaborators`, { params: { name } });
}

function addCollaborator(username: string, repo: string) {
  return (collaborator: AddCollaborator) =>
    axios.post(`/api/repositories/${username}/${repo}/collaborators`, collaborator);
}

function removeCollaborator(username: string, repo: string) {
  return (collaborator: RemoveCollaborator) =>
    axios.delete(`/api/repositories/${username}/${repo}/collaborators`, { data: collaborator });
}

export { searchCollaborators, addCollaborator, removeCollaborator };
export type { AddCollaborator, RemoveCollaborator, Collaborator };
