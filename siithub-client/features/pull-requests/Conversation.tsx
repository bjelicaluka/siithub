import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import { type PullRequestComment, type PullRequestConversation } from "./pullRequestActions";
import { CommentForm } from "./CommentForm";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { CommentPreview } from "./CommentPreview";
import { HideResolvedIcon, ShowResolvedIcon } from "./Icons";
import { resolveConversation, unresolveConversation, usePullRequestContext } from "./PullRequestContext";
import { findLastEvent } from "../common/utils";
import moment from "moment";
import { type User } from "../users/user.model";
import { useAuthContext } from "../../core/contexts/Auth";
import { Button } from "../../core/components/Button";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { type Repository } from "../repository/repository.service";

type CommentCardProps = {
  comment: PullRequestComment;
};

const CommentCard: FC<CommentCardProps> = ({ comment }) => {
  const { pullRequest } = usePullRequestContext();

  const { user: loggedUser } = useAuthContext();
  const participants = {
    ...pullRequest.participants,
    [loggedUser?._id ?? ""]: loggedUser as any as User,
  };

  const commentCreated = useMemo(
    () => findLastEvent(pullRequest.events, (e: any) => e.type === "CommentCreatedEvent" && e.commentId == comment._id),
    [comment, pullRequest]
  );

  const user = participants[commentCreated?.by];

  return (
    <div className="p-4">
      <div className="flex space-x-2">
        <span className="flex -left-3 justify-center items-center w-6 h-6 bg-blue-200 rounded-full ring-8 ring-white">
          <ProfilePicture username={user?.username ?? ""} size={40} />
        </span>
        <span>
          {user?.name} {moment(commentCreated.timeStamp).fromNow()}
        </span>
        <span></span>
      </div>
      <div className="ml-8">
        <CommentPreview comment={comment} stylingOptions={{ buttonsContainer: "mt-1" }} />
      </div>
    </div>
  );
};

const PlaceholderWriteComment = () => {
  const { user } = useAuthContext();

  return (
    <>
      <div className="flex space-x-2 p-2 justify-center items-center">
        <span className="flex -left-3 justify-center items-center w-6 h-6 bg-blue-200 rounded-full ring-6">
          <ProfilePicture username={user?.username ?? ""} size={32} />
        </span>
        <input
          className={"mt-1 w-[95%] border rounded-md border-gray-300 shadow-sm pl-2"}
          value={"Write comment..."}
          readOnly={true}
        />
      </div>
    </>
  );
};

type ConversationProps = {
  conversation: PullRequestConversation;
};

export const Conversation: FC<ConversationProps> = ({ conversation }) => {
  const [visibility, setVisibility] = useState(false);

  useEffect(() => {
    setVisibility(false);
  }, [conversation.comments?.length]);

  return (
    <>
      {conversation?.comments?.map((comment, i) => (
        <CommentCard key={i} comment={comment} />
      ))}

      {visibility ? (
        <CommentForm comment={undefined} conversation={conversation.topic} />
      ) : (
        <div className="bg-gray-200" onClick={() => setVisibility(true)}>
          <PlaceholderWriteComment />
        </div>
      )}
    </>
  );
};

const LineHighligher = ({ changes }: any) => {
  const getClasses = () => {
    if (changes.isDelete) {
      return "bg-red-500";
    }

    if (changes.isNormal) {
      return "bg-white";
    }

    if (changes.isInsert) {
      return "bg-green-500";
    }
  };

  const getNumber = () => {
    if (changes.isDelete) {
      return changes.lineNumber;
    }

    if (changes.isNormal) {
      return changes.newLineNumber !== changes.oldLineNumber
        ? `${changes.oldLineNumber} => ${changes.newLineNumber}`
        : changes.newLineNumber;
    }

    if (changes.isInsert) {
      return changes.lineNumber;
    }
  };
  return (
    <div className={"pl-2 w-100% border shadow-sm  " + getClasses()}>
      {getNumber()} | {changes.content}
    </div>
  );
};

const ConversationResolvation: FC<ConversationProps> = ({ conversation }) => {
  const { user: loggedUser } = useAuthContext();
  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();

  const participants = {
    ...pullRequest.participants,
    [loggedUser?._id ?? ""]: loggedUser as any as User,
  };

  const lastConversationEvent = useMemo(
    () =>
      findLastEvent(
        pullRequest.events,
        (e: any) => e.type.includes("Conversation") && e.conversationId == conversation._id
      ),
    [conversation, pullRequest]
  );

  const user = participants[lastConversationEvent?.by];

  const resolve = () => {
    pullRequestDispatcher(resolveConversation(pullRequest, loggedUser?._id ?? "", conversation._id));
  };

  const unresolve = () => {
    pullRequestDispatcher(unresolveConversation(pullRequest, loggedUser?._id ?? "", conversation._id));
  };

  return (
    <>
      <Button
        className="mt-3 ml-2 mb-0 text-xs bg-gray-500 hover:bg-gray-400 focus:ring-0 focus:ring-none focus:ring-offset-0"
        onClick={() => (conversation.isResolved ? unresolve() : resolve())}
      >
        {conversation.isResolved ? "Unresolve conversation" : "Resolve conversation"}
      </Button>{" "}
      {lastConversationEvent.type === "ConversationResolvedEvent" ? (
        <>
          <span className="font-medium">{user?.username}</span> has marked this conversation as resolved
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export const ConversationCard: FC<ConversationProps> = ({ conversation }) => {
  const { pullRequest } = usePullRequestContext();
  const { repository } = useRepositoryContext();
  const { owner, name } = repository as Repository;

  const [visibility, setVisibility] = useState(!conversation.isResolved);
  const fileName = conversation.topic.split("_")[0];

  const toggleVisibility = useCallback(() => setVisibility((v) => !v), []);

  return (
    <>
      <div className="overflow-hidden shadow sm:rounded-md mb-5">
        <div className={"bg-white mb-1 pb-2"}>
          <div className="bg-gray-200 hover:bg-gray-100 cursor-pointer" onClick={toggleVisibility}>
            <div className="border-b border-gray-200 flex">
              <div className="px-3 py-3 w-100 flex-1">
                <div className="grid grid-cols-12">
                  <div className="col-span-10">
                    <div>
                      <a
                        className="hover:underline"
                        href={`/${owner}/${name}/blob/${pullRequest.csm.compare}/${fileName}`}
                      >
                        {fileName}
                      </a>
                    </div>
                  </div>
                  <div className="col-span-2">
                    {conversation?.isResolved ? (
                      <div className="flex justify-center items-center text-xs">
                        {visibility ? (
                          <>
                            <HideResolvedIcon /> Hide resolved
                          </>
                        ) : (
                          <>
                            <ShowResolvedIcon /> Show resolved
                          </>
                        )}
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {visibility ? (
            <div>
              <LineHighligher changes={conversation.changes} />
              <Conversation conversation={conversation} />
              <ConversationResolvation conversation={conversation} />
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};
