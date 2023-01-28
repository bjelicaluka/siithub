import { type FC, useMemo } from "react";
import { usePullRequestContext } from "./PullRequestContext";
import { type Commit, useCommitsBetweenBranches } from "../commits/useCommits";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { type Repository } from "../repository/repository.service";
import moment from "moment";
import { type PullRequestComment, type PullRequestConversation } from "./pullRequestActions";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { type User } from "../users/user.model";
import { useLabels } from "../labels/useLabels";
import { useMilestonesByRepoId } from "../milestones/useMilestones";
import { type Label } from "../labels/labelActions";
import { type Milestone } from "../milestones/milestoneActions";
import { LabelPreview } from "../labels/LabelPreview";
import { CommentPreview } from "./CommentPreview";
import { ConversationCard } from "./Conversation";
import { useAuthContext } from "../../core/contexts/Auth";
import { HashtagLink } from "../../core/components/HashtagLink";
import { useCollaborators } from "../collaborators/useCollaborators";
import { type Collaborator } from "../collaborators/collaboratorAction";
import Link from "next/link";

const eventsToTake = [
  "LabelAssignedEvent",
  "LabelUnassignedEvent",
  "MilestoneAssignedEvent",
  "MilestoneUnassignedEvent",
  "UserAssignedEvent",
  "UserUnassignedEvent",
  "CommentCreatedEvent",
  "ConversationCreatedEvent",
  "PullRequestApprovedEvent",
  "PullRequestChangesRequiredEvent",
  "PullRequestMergedEvent",
  "PullRequestCanceledEvent",
];

export const PullRequestHistory = () => {
  const { repository } = useRepositoryContext();
  const { owner, name } = repository as Repository;

  const { pullRequest } = usePullRequestContext();

  const events = useMemo(
    () => pullRequest?.events.filter((e) => eventsToTake.includes(e.type)),
    [pullRequest.events.length]
  );

  const { commits } = useCommitsBetweenBranches(owner, name, pullRequest.csm.base, pullRequest.csm.compare);

  const entities = [
    ...(events || [])
      .filter((e) => e.type !== "CommentCreatedEvent" || !e.conversation)
      .filter((e) => {
        if (e.type !== "ConversationCreatedEvent") {
          return true;
        }

        const x = events?.find((e2) => e.topic === e2.conversation && e2.type === "CommentCreatedEvent");
        return !!x;
      })
      .map((e) => ({
        timeStamp: e.timeStamp,
        type: "Event",
        entity: e,
      })),
    ...(commits || []).map((c) => ({
      timeStamp: c.date,
      type: "Commit",
      entity: c,
    })),
  ].sort((e1, e2) => moment(e1.timeStamp).unix() - moment(e2.timeStamp).unix());

  return (
    <>
      <ol className="relative border-l border-gray-200">
        {entities?.map((e, i) => {
          return (
            <li key={i} className="mb-10 ml-6">
              {e?.type === "Commit" ? <CommitRow commit={e.entity as Commit} /> : <EventRow event={e.entity} />}
            </li>
          );
        })}
      </ol>
    </>
  );
};

type CommitRowProps = {
  commit: Commit;
};

const CommitRow: FC<CommitRowProps> = ({ commit }) => {
  const { repository } = useRepositoryContext();
  const { owner, name } = repository as Repository;

  return (
    <>
      <span className="flex absolute -left-3 justify-center items-center w-6 h-6 bg-blue-200 rounded-full ring-8 ring-white">
        <ProfilePicture username={commit.author.username || commit.author.email} size={40} />
      </span>
      <div className="pb-2">
        <div className="grid grid-cols-12">
          <div className="col-span-10 text-left ">
            {commit.author.name} commited{" "}
            <a className="hover:underline" href={`/${owner}/${name}/commit/${commit.sha}`}>
              <HashtagLink>{commit.message}</HashtagLink>
            </a>
          </div>

          <div className="col-span-2 text-right">
            <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
              {moment(commit.date).fromNow()}
            </time>
          </div>
        </div>
      </div>
    </>
  );
};

type EventRowProps = {
  event: any;
};

const EventRow: FC<EventRowProps> = ({ event }) => {
  const { repository } = useRepositoryContext();
  const { owner, name } = repository as Repository;
  const { pullRequest } = usePullRequestContext();

  const { user } = useAuthContext();
  const { collaborators } = useCollaborators(owner, name, "");

  const participants = {
    ...(pullRequest.participants || {}),
    [user?._id ?? ""]: user as any as User,
    ...(collaborators?.reduce((acc: any, c: Collaborator) => {
      acc[c.userId] = c.user;
      return acc;
    }, {}) ?? {}),
  };

  const { labels } = useLabels(pullRequest.repositoryId);
  const { milestones } = useMilestonesByRepoId(pullRequest.repositoryId);

  const findUser = (userId: User["_id"]) => participants[userId];
  const findLabel = (labelId: Label["_id"]) => labels?.find((l: Label) => l._id === labelId);
  const findMilestone = (milestoneId: Milestone["_id"]) => milestones?.find((m: Milestone) => m._id === milestoneId);
  const findComment = (commentId: PullRequestComment["_id"]) =>
    pullRequest.csm.comments?.find((c) => c._id === commentId);
  const findConvesation = (conversationId: PullRequestConversation["_id"]) =>
    pullRequest.csm.conversations?.find((c) => c.topic === conversationId);

  const EventComponent = () => {
    switch (event.type) {
      case "LabelAssignedEvent": {
        const label = findLabel(event.labelId);
        if (!label) return <></>;
        return (
          <>
            {findUser(event.by)?.name} added the <LabelPreview {...label} />
          </>
        );
      }

      case "LabelUnassignedEvent": {
        const label = findLabel(event.labelId);
        if (!label) return <></>;
        return (
          <>
            {findUser(event.by)?.name} added the <LabelPreview {...label} />
          </>
        );
      }

      case "MilestoneAssignedEvent": {
        const milestone = findMilestone(event.milestoneId);
        return (
          <>
            {findUser(event.by)?.name} added the{" "}
            <Link href={`/${owner}/${name}/milestones/${milestone?.localId}`}>{milestone?.title}</Link> milestone
          </>
        );
      }

      case "MilestoneUnassignedEvent": {
        const milestone = findMilestone(event.milestoneId);
        return (
          <>
            {findUser(event.by)?.name} removed the{" "}
            <Link href={`/${owner}/${name}/milestones/${milestone?.localId}`}>{milestone?.title}</Link> milestone
          </>
        );
      }

      case "UserAssignedEvent": {
        const by = findUser(event.by);
        const assigned = findUser(event.userId);
        if (by?._id === assigned?._id) {
          return (
            <>
              {by?.name} <Link href={`/users/${assigned?.username}`}>self-assigned</Link>
            </>
          );
        }
        return (
          <>
            {by?.name} assigned <Link href={`/users/${assigned?.username}`}>{assigned?.name}</Link>
          </>
        );
      }
      case "UserUnassignedEvent": {
        const by = findUser(event.by);
        const unassigned = findUser(event.userId);
        if (by?._id === unassigned?._id) {
          return (
            <>
              {by?.name} <Link href={`/users/${unassigned?.username}`}>self-unassigned</Link>
            </>
          );
        }
        return (
          <>
            {by?.name} unassigned <Link href={`/users/${unassigned?.username}`}>{unassigned?.name}</Link>
          </>
        );
      }
      case "CommentCreatedEvent": {
        const comment = findComment(event.commentId);
        return (
          <>
            <div>{findUser(event.by)?.name} has commented</div>
            {comment ? <CommentPreview comment={comment as PullRequestComment} /> : <></>}
          </>
        );
      }
      case "ConversationCreatedEvent": {
        const conversation = findConvesation(event.topic);
        return (
          <>
            <div>{findUser(event.by)?.name} has opened a new conversation</div>
            {conversation ? <ConversationCard conversation={conversation as PullRequestConversation} /> : <></>}
          </>
        );
      }
      case "PullRequestApprovedEvent": {
        return <div>{findUser(event.by)?.name} has approved this pull request</div>;
      }
      case "PullRequestChangesRequiredEvent": {
        return <div>{findUser(event.by)?.name} has requested changes for this pull request</div>;
      }
      case "PullRequestMergedEvent": {
        return <div>{findUser(event.by)?.name} has merged and closed this pull request</div>;
      }
      case "PullRequestCanceledEvent": {
        return <div>{findUser(event.by)?.name} has canceled and closed this pull request</div>;
      }
    }

    return <></>;
  };
  return (
    <>
      <span className="flex absolute -left-3 justify-center items-center w-6 h-6 bg-blue-200 rounded-full ring-8 ring-white">
        <ProfilePicture username={findUser(event.by)?.username ?? ""} size={40} />
      </span>
      <div className="pb-2">
        <div className="grid grid-cols-12">
          <div className="col-span-10 text-left ">
            <EventComponent />
          </div>

          <div className="col-span-2 text-right">
            <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
              {moment(event.timeStamp).fromNow()}
            </time>
          </div>
        </div>
      </div>
    </>
  );
};
