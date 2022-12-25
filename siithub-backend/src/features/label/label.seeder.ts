import { labelService } from "./label.service"
import { type Label } from "./label.model";
import { type Repository } from "../repository/repository.model";

async function seedDefaultLabels(repositoryId: Repository["_id"]): Promise<Label[]> {

  const labels = [
    {
      name: "bug",
      description: "Something isn't working",
      color: "d73a4a",
      repositoryId
    },
    {
      name: "documentation",
      description: "Improvements or additions to documentation",
      color: "0075ca",
      repositoryId
    },
    {
      name: "duplicate",
      description: "This issue or pull request already exists",
      color: "cfd3d7",
      repositoryId

    },
    {
      name: "feature",
      description: "New feature",
      color: "1be800",
      repositoryId
    },
    {
      name: "setup",
      description: "Project or environment setup",
      color: "000000",
      repositoryId

    },
    {
      name: "question",
      description: "Further information is requested",
      color: "d876e3",
      repositoryId
    },
    {
      name: "wontfix",
      description: "This will not be worked on",
      color: "ffffff",
      repositoryId
    }
  ] as Label[];

  const createdLabels: Label[] = [];
  for (const label of labels) {
    try {
      createdLabels.push(await labelService.create(label) as Label);
    } catch (error) {
      console.log(error);
    }
  }

  return createdLabels;
}

export type LabelSeeder = {
  seedDefaultLabels(repositoryId: Repository["_id"]): Promise<Label[]>
}

const labelSeeder: LabelSeeder = {
  seedDefaultLabels
}

export { labelSeeder }