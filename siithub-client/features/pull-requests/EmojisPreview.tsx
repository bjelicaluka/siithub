import { type FC } from "react";
import { useAuthContext } from "../../core/contexts/Auth";
import { EmojiPreview } from "../common/EmojiPreview";
import { type PullRequestComment } from "./pullRequestActions";
import { addReactionToPRComment, removeReactionFromPRComment, usePullRequestContext } from "./PullRequestContext";

type EmojisPreviewProps = {
  emojis: any;
  commentId: PullRequestComment["_id"];
};

export const EmojisPreview: FC<EmojisPreviewProps> = ({ emojis, commentId }) => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();

  const addReaction = (emoji: string) => {
    pullRequestDispatcher(addReactionToPRComment(pullRequest, executedBy, commentId, emoji));
  };

  const removeReaction = (emoji: string) => {
    pullRequestDispatcher(removeReactionFromPRComment(pullRequest, executedBy, commentId, emoji));
  };

  function canUserUnreact(emoji: string): boolean {
    const findLast = (type: string) =>
      pullRequest?.events
        ?.filter((e: any) => e.type === type && e.by === executedBy && e.code === emoji && e.commentId == commentId)
        .pop();

    const userReacted = findLast("UserReactedEvent");
    const userUnreacted = findLast("UserUnreactedEvent");

    return (userReacted && !userUnreacted) || userReacted?.timeStamp > userUnreacted?.timeStamp;
  }

  return (
    <>
      <div className="mt-2">
        {Object.entries(emojis).map(([emoji, counter]) => {
          const isSelected = canUserUnreact(emoji);
          const onClick = () => (isSelected ? removeReaction(emoji) : addReaction(emoji));

          return (
            <span className="mr-2" key={`${emoji}_${counter}`}>
              <EmojiPreview emoji={emoji} counter={counter as number} isSelected={isSelected} onClick={onClick} />
            </span>
          );
        })}
      </div>
    </>
  );
};
