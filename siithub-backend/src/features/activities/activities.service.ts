import { collaboratorsService } from "../collaborators/collaborators.service";
import { repositoryService } from "../repository/repository.service";
import { issueService } from "../issue/issue.service";
import { starService } from "../star/star.service";
import { userService } from "../user/user.service";
import { type BaseEvent } from "../../db/base.repo.utils";
import { type Issue, type IssueCreatedEvent, type CommentCreatedEvent } from "../issue/issue.model";
import { type Repository } from "../repository/repository.model";
import { type Star } from "../star/star.model";
import { type User } from "../user/user.model";
import { type Collaborator } from "../collaborators/collaborators.model";
import {
  type NewCommentActivity,
  type NewIssueActivity,
  type StaringActivity,
  type Activity,
} from "./activities.models";

async function findActivities(userId: User["_id"], upTill?: Date): Promise<any> {
  const repositories = await getRelevantRepos(userId);

  const activities = await Promise.all([
    getStaringActivities(repositories, userId, upTill),
    getNewIssueActivities(repositories, userId, upTill),
    getNewCommentActivities(repositories, userId, upTill),
  ]).then(([staring, newIssues, newComments]) => {
    return [...staring, ...newIssues, ...newComments].sort(
      (a1: Activity, a2: Activity) => Number(new Date(a2.timeStamp)) - Number(new Date(a1.timeStamp))
    );
  });

  return {
    activities: await connectWithUsers(activities),
  };
}

async function getRelevantRepos(userId: User["_id"]): Promise<Repository[]> {
  const collaborations = await collaboratorsService.findByUser(userId);
  const repoIds: Repository["_id"][] = collaborations.map((collaboration: Collaborator) => collaboration.repositoryId);

  return await repositoryService.findByIds(repoIds);
}

async function getStaringActivities(
  repos: Repository[],
  userId: User["_id"],
  upTill?: Date
): Promise<StaringActivity[]> {
  const repoIds = repos.map((repo: Repository) => repo._id);
  const repositoriesMap = getRepoMap(repos);

  const stars = await starService.findByRepoIds(repoIds, {
    userId: { $ne: userId },
    ...(upTill ? { date: { $gte: upTill } } : {}),
  });

  return stars.map((star: Star) => {
    const repo: Repository = repositoriesMap[star.repoId.toString()];

    return {
      userId: star.userId,
      username: "",
      repoId: star.repoId,
      repoOwner: repo.owner,
      repoName: repo.name,
      repoDescription: repo.description || "",
      timeStamp: star.date,
      type: "StaringActivity",
    };
  });
}

async function getNewIssueActivities(
  repos: Repository[],
  userId: User["_id"],
  upTill?: Date
): Promise<NewIssueActivity[]> {
  const repoIds = repos.map((repo: Repository) => repo._id);
  const repositoriesMap = getRepoMap(repos);

  const newIssues = await issueService.findMany(
    {
      repositoryId: { $in: repoIds },
      events: {
        $elemMatch: {
          type: "IssueCreatedEvent",
          by: { $ne: userId },
          ...(upTill ? { timeStamp: { $gte: upTill } } : {}),
        },
      },
    },
    { projection: { _id: 1, repositoryId: 1, "events.$": 1 } }
  );

  return newIssues.map((issue: Issue) => {
    const issueCreated = issue.events[0] as IssueCreatedEvent;
    const repo: Repository = repositoriesMap[issue.repositoryId.toString()];

    return {
      issueId: issue._id,
      userId: issueCreated.by,
      username: "",
      repoId: issue.repositoryId,
      repoOwner: repo.owner,
      repoName: repo.name,
      repoDescription: repo.description || "",
      title: issueCreated.title,
      timeStamp: issueCreated.timeStamp,
      type: "NewIssueActivity",
    };
  });
}

async function getNewCommentActivities(
  repos: Repository[],
  userId: User["_id"],
  upTill?: Date
): Promise<NewCommentActivity[]> {
  const repoIds = repos.map((repo: Repository) => repo._id);
  const repositoriesMap = getRepoMap(repos);

  const newComments = await issueService.findMany(
    {
      repositoryId: { $in: repoIds },
      $and: [
        {
          events: {
            $elemMatch: {
              type: "CommentCreatedEvent",
              by: { $ne: userId },
              ...(upTill ? { timeStamp: { $gte: upTill } } : {}),
            },
          },
        },
        {
          events: {
            $elemMatch: {
              type: "IssueCreatedEvent",
              by: userId,
            },
          },
        },
      ],
    },
    {
      projection: {
        _id: 1,
        repositoryId: 1,
        csm: { title: 1 },
        events: { $elemMatch: { type: "CommentCreatedEvent", by: { $ne: userId } } },
      },
    }
  );

  return newComments.flatMap((issue: Issue) =>
    issue.events.map((event: BaseEvent) => {
      const issueCommented = event as CommentCreatedEvent;
      const repo: Repository = repositoriesMap[issue.repositoryId.toString()];

      return {
        issueId: issue._id,
        userId: issueCommented.by,
        username: "",
        repoId: issue.repositoryId,
        repoOwner: repo.owner,
        repoName: repo.name,
        repoDescription: repo.description || "",
        title: issue.csm.title || "",
        text: issueCommented.text,
        timeStamp: issueCommented.timeStamp,
        type: "NewCommentActivity",
      };
    })
  );
}

async function connectWithUsers(activities: Activity[]): Promise<Activity[]> {
  const userIds = activities.map((activity) => activity.userId);
  const users = await userService.findManyByIds(userIds);
  const usersMap = getUserMap(users);

  return activities.map((a: Activity) => ({
    ...a,
    username: usersMap[a.userId.toString()]?.username,
  }));
}

function getRepoMap(repos: Repository[]): any {
  return repos.reduce((acc: any, repo: Repository) => {
    acc[repo._id.toString()] = repo;
    return acc;
  }, {});
}

function getUserMap(users: User[]): any {
  return users.reduce((acc: any, user: User) => {
    acc[user._id.toString()] = user;
    return acc;
  }, {});
}

export type ActivitiesService = {
  findActivities(userId: User["_id"], upTill?: Date): Promise<any>;
  connectWithUsers(activities: Activity[]): Promise<Activity[]>;
  getRelevantRepos(userId: User["_id"]): Promise<Repository[]>;
  getStaringActivities(repos: Repository[], userId: User["_id"], upTill?: Date): Promise<StaringActivity[]>;
  getNewIssueActivities(repos: Repository[], userId: User["_id"], upTill?: Date): Promise<NewIssueActivity[]>;
  getNewCommentActivities(repos: Repository[], userId: User["_id"], upTill?: Date): Promise<NewCommentActivity[]>;
};

const activitiesService: ActivitiesService = {
  findActivities,
  connectWithUsers,
  getRelevantRepos,
  getStaringActivities,
  getNewIssueActivities,
  getNewCommentActivities,
};

export { activitiesService };
