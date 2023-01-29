import { type FC, useState, useEffect } from "react";
import { EyeIcon } from "@heroicons/react/20/solid";
import parse from "html-react-parser";
import { useAuthContext } from "../../core/contexts/Auth";
import { CommentForm } from "./CommentForm";
import { PencilSquareIcon } from "@heroicons/react/20/solid";
import { EyeSlashIcon } from "@heroicons/react/20/solid";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { FaceSmileIcon } from "@heroicons/react/20/solid";
import EmojiPicker, { Categories, EmojiStyle } from "emoji-picker-react";
import { type PullRequestComment } from "./pullRequestActions";
import { CommentState } from "../issues/issueActions";
import {
  addReactionToPRComment,
  deleteCommentOnPR,
  hideCommentOnPR,
  usePullRequestContext,
} from "./PullRequestContext";
import { EmojisPreview } from "./EmojisPreview";
import { HashtagLink } from "../../core/components/HashtagLink";

type StylingOptions = {
  buttonsContainer: string;
};

const initialStylingOptions: StylingOptions = {
  buttonsContainer: "mt-10",
};

type CommentPreviewProps = {
  comment: PullRequestComment;
  stylingOptions?: StylingOptions;
};

function getText(comment: PullRequestComment): string {
  const textsForStates = {
    [CommentState.Hidden]: "<p>This comment is hidden.</p>",
    [CommentState.Existing]: comment.text,
    [CommentState.Deleted]: "<p>This comment is deleted.</p>",
  };
  return textsForStates[comment.state];
}
export const CommentPreview: FC<CommentPreviewProps> = ({ comment, stylingOptions = initialStylingOptions }) => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();

  const isHiddable = comment.state === CommentState.Hidden;
  const [showHidden, setShowHidden] = useState(false);

  const toggleShowHidden = () => setShowHidden((show) => !show);

  const [showPreviewDiv, setShowPreviewDiv] = useState(true);
  const toggleDivVisibility = () => setShowPreviewDiv((showPreviewDiv) => !showPreviewDiv);

  const [showEmojiDiv, setShowEmojiDiv] = useState(false);
  const toggleEmojiDivVisibility = () => setShowEmojiDiv((showEmojiDiv) => !showEmojiDiv);

  const deleteComment = () => {
    pullRequestDispatcher(deleteCommentOnPR(pullRequest, executedBy, comment._id));
  };

  const hideComment = () => {
    pullRequestDispatcher(hideCommentOnPR(pullRequest, executedBy, comment._id));
  };

  const addReaction = (code: string) => {
    pullRequestDispatcher(addReactionToPRComment(pullRequest, executedBy, comment._id, code));
  };

  useEffect(() => {
    const lastEvent = pullRequest?.events?.at(-1);
    if (lastEvent.type !== "CommentUpdatedEvent") return;
    lastEvent.commentId === comment._id && setShowPreviewDiv(true);
  }, [pullRequest?.events?.length]);

  return (
    <>
      <div hidden={!showPreviewDiv}>
        <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
          <span className="mr-2">
            <HashtagLink>
              {parse(isHiddable ? (showHidden ? comment.text : getText(comment)) : getText(comment))}
            </HashtagLink>
          </span>

          <span hidden={!isHiddable} onClick={toggleShowHidden}>
            <EyeIcon className="inline-block h-5 w-5 text-indigo-500 mr-2" />
          </span>
        </div>
      </div>

      <div hidden={!showEmojiDiv}>
        <EmojiPicker
          lazyLoadEmojis={true}
          onEmojiClick={(emojiData) => {
            addReaction(emojiData.unified);
          }}
          emojiVersion="0.6"
          skinTonesDisabled
          emojiStyle={EmojiStyle.NATIVE}
          categories={[
            {
              name: "Smiles",
              category: Categories.SMILEYS_PEOPLE,
            },
          ]}
        />
      </div>

      <div>
        {!!comment.reactions && comment.state === CommentState.Existing ? (
          <EmojisPreview emojis={comment.reactions} commentId={comment._id} />
        ) : (
          <></>
        )}
      </div>

      <div hidden={showPreviewDiv} key={showPreviewDiv + comment?._id}>
        <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
          <CommentForm comment={comment} />
        </div>
      </div>

      <div hidden={!showPreviewDiv}>
        <div className={stylingOptions.buttonsContainer}>
          {comment.state === CommentState.Existing ? (
            <span>
              <PencilSquareIcon className="inline-block h-5 w-5 text-indigo-500 mr-2" onClick={toggleDivVisibility} />
              <EyeSlashIcon className="inline-block h-5 w-5 text-indigo-500 mr-2" onClick={hideComment} />
              <XCircleIcon className="inline-block h-5 w-5 text-indigo-500 mr-2" onClick={deleteComment} />
              <FaceSmileIcon className="inline-block h-5 w-5 text-indigo-500" onClick={toggleEmojiDivVisibility} />
            </span>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};
