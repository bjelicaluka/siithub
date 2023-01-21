import { type FC, useEffect, useState } from "react";
import { useAuthContext } from "../../core/contexts/Auth";
import { Button } from "../../core/components/Button";
import { createCommentOnPR, updateCommentOnPR, usePullRequestContext } from "./PullRequestContext";
import type { PullRequestComment } from "./pullRequestActions";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // ES6

type CommentProps = {
  comment?: PullRequestComment;
  conversation?: string;
};

export const CommentForm: FC<CommentProps> = ({ comment = undefined, conversation = undefined }) => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();
  const isEdit = !!comment;

  const [text, setText] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    setText(comment.text);
  }, [comment]);

  const onSubmit = () => {
    pullRequestDispatcher(
      isEdit
        ? updateCommentOnPR(pullRequest, executedBy, comment?._id ?? "", text)
        : createCommentOnPR(pullRequest, executedBy, text, conversation)
    );
  };
  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="bg-white px-4 py-5 sm:p-6 shadow-md">
          <div className="grid grid-cols-6 gap-2">
            <div
              className="col-span-2"
              style={{
                marginBottom: "-9px",
                borderStyle: "solid",
                borderWidth: "1px 1px 0px 1px",
                borderColor: "#CCCCCC",
              }}
            >
              <h3 className="text-center py-2 text-l">{isEdit ? "Edit comment" : "Write new comment"}</h3>
            </div>

            <div className="col-span-6 mb-7">
              <ReactQuill style={{ height: 150 }} value={text} onChange={(text) => setText(text)}></ReactQuill>
            </div>
          </div>

          <div className="grid grid-cols-6">
            <div className="col-span-6 bg-gray-50 px-4 py-3 text-right sm:px-6 mt-10">
              <Button>Submit</Button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};
