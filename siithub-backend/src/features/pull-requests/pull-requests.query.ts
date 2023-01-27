import { PullRequestState } from "./pull-requests.model";
import { type Label } from "../label/label.model";
import { type Milestone } from "../milestone/milestone.model";
import { type User } from "../user/user.model";

type PullRequestsQuery = {
  title?: string;
  state?: PullRequestState[];
  author?: User["_id"];
  assignees?: User["_id"][];
  labels?: Label["_id"][];
  milestones?: Milestone["_id"][];
  sort?: string;
};

export { PullRequestsQuery };
