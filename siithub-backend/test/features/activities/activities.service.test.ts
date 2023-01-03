import { describe, expect, it, beforeEach } from "@jest/globals";
import { setupTestEnv } from "../../jest-hooks.utils";
import { type ActivitiesService } from "../../../src/features/activities/activities.service";
import { type RepositoryRepo } from "../../../src/features/repository/repository.repo";
import { type UserRepo } from "../../../src/features/user/user.repo";
import { type StarRepo } from "../../../src/features/star/star.repo";
import { type IssueRepo } from "../../../src/features/issue/issue.repo";
import { type Repository } from "../../../src/features/repository/repository.model";
import { type User } from "../../../src/features/user/user.model";
import { type CollaboratorsRepo } from "../../../src/features/collaborators/collaborators.repo";
import { type Collaborator } from "../../../src/features/collaborators/collaborators.model";
import { type Star } from "../../../src/features/star/star.model";
import { type Issue } from "../../../src/features/issue/issue.model";
import { type Activity } from "../../../src/features/activities/activities.models";
import { ObjectId } from "mongodb";

describe("ActivitiesService", () => {
  setupTestEnv("ActivitiesService");

  let service: ActivitiesService;

  let userRepository: UserRepo;
  let repoRepository: RepositoryRepo;
  let collaboratorsRepository: CollaboratorsRepo;
  let starRepository: StarRepo;
  let issueRepository: IssueRepo;

  let repositories: Repository[];
  let users: User[];
  let collaborators: Collaborator[];
  let stars: Star[];
  let issues: Issue[];

  beforeEach(async () => {
    const { activitiesService } = await import("../../../src/features/activities/activities.service");
    const { userRepo } = await import("../../../src/features/user/user.repo");
    const { repositoryRepo } = await import("../../../src/features/repository/repository.repo");
    const { collaboratorsRepo } = await import("../../../src/features/collaborators/collaborators.repo");
    const { starRepo } = await import("../../../src/features/star/star.repo");
    const { issueRepo } = await import("../../../src/features/issue/issue.repo");

    service = activitiesService;
    userRepository = userRepo;
    repoRepository = repositoryRepo;
    collaboratorsRepository = collaboratorsRepo;
    starRepository = starRepo;
    issueRepository = issueRepo;

    await setupUsers();
    await setupRepositories();
    await setupCollaborator();
  });

  async function setupUsers() {
    users = [
      (await userRepository.crud.add({
        username: "user1",
        name: "User1",
      } as any)) as User,
      (await userRepository.crud.add({
        username: "user2",
        name: "User2",
      } as any)) as User,
      (await userRepository.crud.add({
        username: "user3",
        name: "User3",
      } as any)) as User,
    ];
  }

  async function setupRepositories() {
    repositories = [
      (await repoRepository.crud.add({
        owner: "user1",
        name: "Repo1",
        description: "Repo1Description",
        type: "public",
      })) as Repository,
      (await repoRepository.crud.add({
        owner: "user2",
        name: "Repo2",
        description: "Repo2Description",
        type: "public",
      })) as Repository,
      (await repoRepository.crud.add({
        owner: "user3",
        name: "Repo3",
        description: "Repo3Description",
        type: "public",
      })) as Repository,
    ];
  }

  async function setupCollaborator() {
    collaborators = [
      (await collaboratorsRepository.crud.add({
        userId: users[0]._id,
        repositoryId: repositories[0]._id,
      })) as Collaborator,
      (await collaboratorsRepository.crud.add({
        userId: users[0]._id,
        repositoryId: repositories[1]._id,
      })) as Collaborator,
      (await collaboratorsRepository.crud.add({
        userId: users[1]._id,
        repositoryId: repositories[0]._id,
      })) as Collaborator,
      (await collaboratorsRepository.crud.add({
        userId: users[1]._id,
        repositoryId: repositories[1]._id,
      })) as Collaborator,
      (await collaboratorsRepository.crud.add({
        userId: users[1]._id,
        repositoryId: repositories[2]._id,
      })) as Collaborator,
      (await collaboratorsRepository.crud.add({
        userId: users[2]._id,
        repositoryId: repositories[2]._id,
      })) as Collaborator,
    ];
  }

  describe("getRelevantRepos", () => {
    it("shouldn't find relevant repos", async () => {
      const userId = new ObjectId();

      const found = await service.getRelevantRepos(userId);

      expect(found.length).toBeFalsy();
    });

    it("find relevant repos", async () => {
      const userId = users[0]._id;

      const found = await service.getRelevantRepos(userId);

      expect(found.length).toBe(2);
      expect(found[0]).toHaveProperty("_id", repositories[0]._id);
      expect(found[1]).toHaveProperty("_id", repositories[1]._id);
    });
  });

  describe("getRelevantRepos", () => {
    it("should add username", async () => {
      const activities: Activity[] = [
        {
          type: "NewCommentActivity",
          userId: users[0]._id,
        } as any,
        {
          type: "NewIssueActivity",
          userId: users[2]._id,
        } as any,
      ];

      const activitiesWithUsername = await service.connectWithUsers(activities);

      expect(activitiesWithUsername.length).toBe(2);
      expect(activitiesWithUsername[0]).toHaveProperty("username", users[0].username);
      expect(activitiesWithUsername[1]).toHaveProperty("username", users[2].username);
    });
  });

  describe("getStaringActivities", () => {
    beforeEach(async () => {
      const currentDate = new Date();
      const yesterday = new Date();
      yesterday.setDate(currentDate.getDate() - 1);

      stars = [
        (await starRepository.crud.add({
          userId: users[0]._id,
          repoId: repositories[0]._id,
          date: currentDate,
        })) as Star,
        (await starRepository.crud.add({
          userId: users[1]._id,
          repoId: repositories[0]._id,
          date: currentDate,
        })) as Star,
        (await starRepository.crud.add({
          userId: users[1]._id,
          repoId: repositories[1]._id,
          date: yesterday,
        })) as Star,
      ];
    });

    it("shouldn't find any star", async () => {
      const userId = users[2]._id;
      const relevantRepos = await service.getRelevantRepos(userId);

      const starActivities = await service.getStaringActivities(relevantRepos, userId);

      expect(starActivities.length).toBeFalsy();
    });

    it("return stars for all users expect himself", async () => {
      const userId = users[0]._id;
      const relevantRepos = await service.getRelevantRepos(userId);

      const starActivities = await service.getStaringActivities(relevantRepos, userId);

      expect(starActivities.length).toBe(2);
      expect(starActivities[0]).toHaveProperty("repoId", stars[1].repoId);
      expect(starActivities[0]).toHaveProperty("userId", stars[1].userId);
      expect(starActivities[1]).toHaveProperty("repoId", stars[2].repoId);
      expect(starActivities[1]).toHaveProperty("userId", stars[2].userId);
    });

    it("return stars according to the up till date", async () => {
      const userId = users[0]._id;
      const relevantRepos = await service.getRelevantRepos(userId);
      const upTill = new Date();
      upTill.setDate(upTill.getDate() - 1);

      const starActivities = await service.getStaringActivities(relevantRepos, userId, upTill);

      expect(starActivities.length).toBe(1);
      expect(starActivities[0]).toHaveProperty("repoId", stars[1].repoId);
      expect(starActivities[0]).toHaveProperty("userId", stars[1].userId);
    });

    it("return stars connected to the repo", async () => {
      const userId = users[0]._id;
      const relevantRepos = await service.getRelevantRepos(userId);

      const starActivities = await service.getStaringActivities(relevantRepos, userId);
      const starActivity = starActivities[0];

      expect(starActivity).toHaveProperty("userId", users[1]._id);
      expect(starActivity).toHaveProperty("repoOwner", users[0].username);
      expect(starActivity).toHaveProperty("repoName", repositories[0].name);
      expect(starActivity).toHaveProperty("repoDescription", repositories[0].description);
    });
  });

  describe("getNewIssueActivities", () => {
    beforeEach(async () => {
      const currentDate = new Date();
      const yesterday = new Date();
      yesterday.setDate(currentDate.getDate() - 1);

      issues = [
        (await issueRepository.crud.add({
          repositoryId: repositories[0]._id,
          events: [
            {
              type: "IssueCreatedEvent",
              by: users[0]._id,
              timeStamp: currentDate,
              title: "Issue1",
            },
          ],
          csm: {
            title: "Issue1",
          },
        } as any)) as Issue,

        (await issueRepository.crud.add({
          repositoryId: repositories[0]._id,
          events: [
            {
              type: "IssueCreatedEvent",
              by: users[1]._id,
              timeStamp: currentDate,
              title: "Issue2",
            },
          ],
          csm: {
            title: "Issue2",
          },
        } as any)) as Issue,

        (await issueRepository.crud.add({
          repositoryId: repositories[1]._id,
          events: [
            {
              type: "IssueCreatedEvent",
              by: users[1]._id,
              timeStamp: yesterday,
              title: "Issue3",
            },
          ],
          csm: {
            title: "Issue3",
          },
        } as any)) as Issue,
      ];
    });

    it("shouldn't find any new issue", async () => {
      const userId = users[2]._id;
      const relevantRepos = await service.getRelevantRepos(userId);

      const newIssueActivities = await service.getNewIssueActivities(relevantRepos, userId);

      expect(newIssueActivities.length).toBeFalsy();
    });

    it("return new issue for all users expect himself", async () => {
      const userId = users[0]._id;
      const relevantRepos = await service.getRelevantRepos(userId);

      const newIssueActivities = await service.getNewIssueActivities(relevantRepos, userId);

      expect(newIssueActivities.length).toBe(2);
      expect(newIssueActivities[0]).toHaveProperty("repoId", issues[1].repositoryId);
      expect(newIssueActivities[0]).toHaveProperty("userId", issues[1].events[0].by);
      expect(newIssueActivities[0]).toHaveProperty("issueId", issues[1]._id);
      expect(newIssueActivities[0]).toHaveProperty("title", issues[1].csm.title);
      expect(newIssueActivities[1]).toHaveProperty("repoId", issues[2].repositoryId);
      expect(newIssueActivities[1]).toHaveProperty("userId", issues[2].events[0].by);
      expect(newIssueActivities[1]).toHaveProperty("issueId", issues[2]._id);
      expect(newIssueActivities[1]).toHaveProperty("title", issues[2].csm.title);
    });

    it("return new issue according to the up till date", async () => {
      const userId = users[0]._id;
      const relevantRepos = await service.getRelevantRepos(userId);
      const upTill = new Date();
      upTill.setDate(upTill.getDate() - 1);

      const newIssueActivities = await service.getNewIssueActivities(relevantRepos, userId, upTill);

      expect(newIssueActivities.length).toBe(1);
      expect(newIssueActivities[0]).toHaveProperty("repoId", issues[1].repositoryId);
      expect(newIssueActivities[0]).toHaveProperty("userId", issues[1].events[0].by);
      expect(newIssueActivities[0]).toHaveProperty("issueId", issues[1]._id);
      expect(newIssueActivities[0]).toHaveProperty("title", issues[1].csm.title);
    });

    it("return new isssue connected to the repo", async () => {
      const userId = users[0]._id;
      const relevantRepos = await service.getRelevantRepos(userId);

      const newIssueActivities = await service.getNewIssueActivities(relevantRepos, userId);
      const newIssueActivity = newIssueActivities[0];

      expect(newIssueActivity).toHaveProperty("userId", users[1]._id);
      expect(newIssueActivity).toHaveProperty("repoOwner", users[0].username);
      expect(newIssueActivity).toHaveProperty("repoName", repositories[0].name);
      expect(newIssueActivity).toHaveProperty("repoDescription", repositories[0].description);
    });
  });

  describe("getNewCommentActivities", () => {
    beforeEach(async () => {
      const currentDate = new Date();
      const yesterday = new Date();
      yesterday.setDate(currentDate.getDate() - 1);

      issues = [
        (await issueRepository.crud.add({
          repositoryId: repositories[0]._id,
          events: [
            {
              type: "IssueCreatedEvent",
              by: users[0]._id,
              timeStamp: currentDate,
              title: "Issue1",
            },
            {
              type: "CommentCreatedEvent",
              by: users[0]._id,
              timeStamp: currentDate,
              text: "Comment 1",
            },
            {
              type: "CommentCreatedEvent",
              by: users[1]._id,
              timeStamp: currentDate,
              text: "Comment 2",
            },
          ],
          csm: {
            title: "Issue1",
          },
        } as any)) as Issue,

        (await issueRepository.crud.add({
          repositoryId: repositories[0]._id,
          events: [
            {
              type: "IssueCreatedEvent",
              by: users[1]._id,
              timeStamp: currentDate,
              title: "Issue2",
            },
            {
              type: "CommentCreatedEvent",
              by: users[0]._id,
              timeStamp: yesterday,
              text: "Comment 2",
            },
          ],
          csm: {
            title: "Issue2",
          },
        } as any)) as Issue,
      ];
    });

    it("shouldn't find any new comment", async () => {
      const userId = users[2]._id;
      const relevantRepos = await service.getRelevantRepos(userId);

      const newIssueComments = await service.getNewCommentActivities(relevantRepos, userId);

      expect(newIssueComments.length).toBeFalsy();
    });

    it("return new comment for all users expect himself", async () => {
      const userId = users[0]._id;
      const relevantRepos = await service.getRelevantRepos(userId);

      const newIssueComments = await service.getNewCommentActivities(relevantRepos, userId);

      expect(newIssueComments.length).toBe(1);
      expect(newIssueComments[0]).toHaveProperty("repoId", issues[0].repositoryId);
      expect(newIssueComments[0]).toHaveProperty("userId", issues[0].events[2].by);
      expect(newIssueComments[0]).toHaveProperty("issueId", issues[0]._id);
      expect(newIssueComments[0]).toHaveProperty("text", (issues[0].events[2] as any).text);
    });

    it("return new issue according to the up till date", async () => {
      const userId = users[1]._id;
      const relevantRepos = await service.getRelevantRepos(userId);
      const upTill = new Date();
      upTill.setDate(upTill.getDate() - 2);

      const newIssueComments = await service.getNewCommentActivities(relevantRepos, userId, upTill);

      expect(newIssueComments.length).toBe(1);
      expect(newIssueComments[0]).toHaveProperty("repoId", issues[1].repositoryId);
      expect(newIssueComments[0]).toHaveProperty("userId", issues[1].events[1].by);
      expect(newIssueComments[0]).toHaveProperty("issueId", issues[1]._id);
      expect(newIssueComments[0]).toHaveProperty("text", (issues[1].events[1] as any).text);
    });

    it("return new isssue connected to the repo", async () => {
      const userId = users[0]._id;
      const relevantRepos = await service.getRelevantRepos(userId);

      const newIssueComments = await service.getNewCommentActivities(relevantRepos, userId);
      const newCommentActivity = newIssueComments[0];

      expect(newCommentActivity).toHaveProperty("userId", users[1]._id);
      expect(newCommentActivity).toHaveProperty("repoOwner", users[0].username);
      expect(newCommentActivity).toHaveProperty("repoName", repositories[0].name);
      expect(newCommentActivity).toHaveProperty("repoDescription", repositories[0].description);
    });
  });
});
