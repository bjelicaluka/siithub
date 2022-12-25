import { type Label } from "../label/label.model"
import { type Milestone } from "../milestone/milestone.model"
import { type User } from "../user/user.model"
import { IssueState } from "./issue.model"

type IssuesQuery = {
  title?: string,
  state?: IssueState[],
  author?: User["_id"],
  assignees?: User["_id"][],
  labels?: Label["_id"][],
  milestones?: Milestone["_id"][],
  sort?: any
}

export {
  IssuesQuery
}