import { type FC } from "react";
import { useAuthContext } from "../../core/contexts/Auth";
import { EmojiPreview } from "./EmojiPreview";
import { type Comment } from "./issueActions";
import { instantAddReaction, instantRemoveReaction, useIssueContext } from "./IssueContext";

type EmojisPreviewProps = {
  emojis: any;
  commentId: Comment["_id"];
};

export const EmojisPreview: FC<EmojisPreviewProps> = ({ emojis, commentId }) => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { issue, issueDispatcher } = useIssueContext();

  const addReaction = (emoji: string) => {
    issueDispatcher(instantAddReaction(issue, executedBy, commentId, emoji));
  };

  const removeReaction = (emoji: string) => {
    issueDispatcher(instantRemoveReaction(issue, executedBy, commentId, emoji));
  };

  function canUserUnreact(emoji: string): boolean {
    const findLast = (type: string) =>
      issue?.events
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
