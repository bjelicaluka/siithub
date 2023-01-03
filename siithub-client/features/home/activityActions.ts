import axios from "axios";
import { type Moment } from "moment";
import { type Issue } from "../issues/issueActions";
import { type Repository } from "../repository/repository.service";
import { type User } from "../users/user.model";

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

function getActivities(upTill?: Moment) {
  return axios.get(`/api/activities`, { params: { upTill: upTill?.format() ?? "" } });
}

export { getActivities };

export type { Activity, StaringActivity, NewIssueActivity, NewCommentActivity };
