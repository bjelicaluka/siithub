import { type FC, useEffect } from "react";
import { useQuill } from "react-quilljs";
import { instantCreateComment, instantUpdateComment, useIssueContext } from "./IssueContext";
import { useAuthContext } from "../../core/contexts/Auth";
import { Button } from "../../core/components/Button";
import { type Comment } from "./issueActions";

type CommentProps = {
  comment?: Comment;
};

export const CommentForm: FC<CommentProps> = ({ comment = undefined }) => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const isEdit = !!comment;

  const { quill, quillRef } = useQuill();
  const { issue, issueDispatcher } = useIssueContext();

  useEffect(() => {
    if (!isEdit) return;
    quill && quill.clipboard.dangerouslyPasteHTML(comment?.text || "");
  }, [quill, comment]);

  const onSubmit = () => {
    const textContent = quill?.root.innerHTML.toString() ?? "";

    issueDispatcher(
      isEdit
        ? instantUpdateComment(issue, executedBy, comment?._id ?? "", textContent)
        : instantCreateComment(issue, executedBy, textContent)
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
              <div style={{ height: 150 }}>
                <div ref={quillRef} />
              </div>
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
