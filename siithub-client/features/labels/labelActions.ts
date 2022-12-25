import axios from "axios";
import { z } from "zod";
import { ALPHANUMERIC_REGEX, COLOR_REGEX } from "../../patterns";
import { type Repository } from "../repository/repository.service";

const labelBodySchema = z.object({
  name: z.string()
    .min(3, "Name should have at least 3 characters.")
    .regex(ALPHANUMERIC_REGEX, "Name should contain only alphanumeric characters."),
  description: z.string().default(""),
  color: z.string()
    .regex(COLOR_REGEX, "Color should contain only hexadecimal numbers."),
});

type CreateLabel = z.infer<typeof labelBodySchema>;
type UpdateLabel = CreateLabel;
type Label =  CreateLabel & {
  _id: string
}; 

function getRepositoryLabels(repositoryId: Repository["_id"], name: string = "") {
  return axios.get(`/api/repositories/${repositoryId}/labels/search`, { params: { name } });
}
function createLabelFor(repositoryId: Repository["_id"]) {
  return (label: CreateLabel) => axios.post(`/api/repositories/${repositoryId}/labels`, label);
}
function updateLabelFor(repositoryId: Repository["_id"], id: Label["_id"]) {
  return (label: UpdateLabel) => axios.put(`/api/repositories/${repositoryId}/labels/${id}`, label);
}
function deleteLabelFor(repositoryId: Repository["_id"]) {
  return (label: Label) => axios.delete(`/api/repositories/${repositoryId}/labels/${label?._id}`);
}
export {
  labelBodySchema,
  createLabelFor,
  updateLabelFor,
  deleteLabelFor,
  getRepositoryLabels
}

export type {
  CreateLabel,
  UpdateLabel,
  Label
}
