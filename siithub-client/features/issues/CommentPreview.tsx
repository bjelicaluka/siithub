import { type FC, useState } from "react";
import { CommentState, type Comment } from "./issueActions";
import { EyeIcon } from "./Icons";
import parse from "html-react-parser";
import { useAuthContext } from "../../core/contexts/Auth";
import { instantAddReaction, instantDeleteComment, instantHideComment, useIssueContext } from "./IssueContext";
import { CommentForm } from "./CommentForm";
import { PencilSquareIcon } from "@heroicons/react/20/solid";
import { EyeSlashIcon } from "@heroicons/react/20/solid";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { FaceSmileIcon } from "@heroicons/react/20/solid";
import EmojiPicker, { Categories, EmojiStyle } from 'emoji-picker-react';
import { EmojisPreview } from "./EmojisPreview";

type CommentPreviewProps = {
  comment: Comment;
};

function getText(comment: Comment): string {
  const textsForStates = {
    [CommentState.Hidden]: "<p>This comment is hidden.</p>",
    [CommentState.Existing]: comment.text,
    [CommentState.Deleted]: "<p>This comment is deleted.</p>",
  };
  return textsForStates[comment.state];
}
export const CommentPreview: FC<CommentPreviewProps> = ({ comment }) => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { issue, issueDispatcher } = useIssueContext();

  const isHiddable = comment.state === CommentState.Hidden;
  const [showHidden, setShowHidden] = useState(false);

  const toggleShowHidden = () => setShowHidden((show) => !show);

  const [showPreviewDiv, setShowPreviewDiv] = useState(true);
  const toggleDivVisibility = () => setShowPreviewDiv((showPreviewDiv) => !showPreviewDiv);

  const [showEmojiDiv, setShowEmojiDiv] = useState(false);
  const toggleEmojiDivVisibility = () => setShowEmojiDiv((showEmojiDiv) => !showEmojiDiv);

  const deleteComment = () => {
    issueDispatcher(instantDeleteComment(issue, executedBy, comment._id));
  };

  const hideComment = () => {
    issueDispatcher(instantHideComment(issue, executedBy, comment._id));
  };

  const addReaction = (code: string) => {
    issueDispatcher(instantAddReaction(issue, executedBy, comment._id, code));
  }

  return (
    <>
      <div hidden={!showPreviewDiv}>
        <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
          <span className="mr-2">
            {parse(isHiddable ? (showHidden ? comment.text : getText(comment)) : getText(comment))}
          </span>

          <span hidden={!isHiddable} onClick={toggleShowHidden}>
            <EyeIcon />
          </span>
        </div>
      </div>

      <div hidden={!showEmojiDiv}>
        <EmojiPicker
          lazyLoadEmojis={true}
          onEmojiClick={(emojiData) => { addReaction(emojiData.unified) }}
          emojiVersion="0.6"
          skinTonesDisabled
          emojiStyle={EmojiStyle.NATIVE}
          categories={[
            {
              name: "Smiles",
              category: Categories.SMILEYS_PEOPLE
            }
          ]} />
      </div>

      <div >
        {!!comment.reactions && comment.state === CommentState.Existing ?
          <EmojisPreview emojis={comment.reactions} commentId={comment._id} /> :
          <></>
        }
      </div>

      <div hidden={showPreviewDiv} key={showPreviewDiv + comment?._id}>
        <div style={{ marginTop: "10px", display: "flex", alignItems: "center" }}>
          <CommentForm comment={comment} />
        </div>
      </div>

      <div hidden={!showPreviewDiv}>
        <div className="mt-10">
          {comment.state === CommentState.Existing ? (
            <span>
              <PencilSquareIcon
                className="inline-block h-5 w-5 text-indigo-500 mr-2"
                onClick={toggleDivVisibility}
              />
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
