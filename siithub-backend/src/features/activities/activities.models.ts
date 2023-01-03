import { type Issue } from "../issue/issue.model";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";

type Activity = {
  type: string;
  userId: User["_id"];
  username: string;
  repoId: Repository["_id"];
  repoOwner: string;
  repoName: string;
  repoDescription: string;
  timeStamp: Date;
};

type StaringActivity = Activity & {};

type NewIssueActivity = Activity & {
  issueId: Issue["_id"];
  title: string;
};

type NewCommentActivity = Activity & {
  issueId: Issue["_id"];
  title: string;
  text: string;
};

export { Activity, StaringActivity, NewIssueActivity, NewCommentActivity };
