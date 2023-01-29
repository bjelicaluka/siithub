import { useState, type FC } from "react";
import { approvePullRequest, requireChangesForPullRequest, usePullRequestContext } from "./PullRequestContext";
import { useAuthContext } from "../../core/contexts/Auth";
import { Button } from "../../core/components/Button";
import { Modal } from "../../core/components/Modal";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css"; // ES6

type ReviewFormProps = {
  type: "approve" | "required";
};

const ReviewForm: FC<ReviewFormProps> = ({ type }) => {
  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();
  const { user } = useAuthContext();
  const reviewer = user?._id ?? "";
  const [review, setReview] = useState("");

  const submitReview = () => {
    if (type === "approve") {
      pullRequestDispatcher(approvePullRequest(pullRequest, reviewer, review));
      return;
    }
    pullRequestDispatcher(requireChangesForPullRequest(pullRequest, reviewer, review));
  };

  return (
    <>
      <div className="grid grid-cols-12">
        <div className="col-span-12 mb-12 mt-4">
          <ReactQuill style={{ height: 150 }} value={review} onChange={(review) => setReview(review)}></ReactQuill>
        </div>

        <div className="col-span-12 text-right mt-4">
          <Button onClick={submitReview}>Submit</Button>
        </div>
      </div>
    </>
  );
};

export const PullRequestReviewForm: FC = () => {
  const { pullRequest } = usePullRequestContext();
  const { user } = useAuthContext();

  const [type, setType] = useState<"approve" | "required">("approve");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUserId = user?._id ?? "";
  const assigness = pullRequest.csm?.assignees ?? [];

  if (pullRequest.csm.isClosed) return <></>;

  const approve: any = () => {
    setType("approve");
    setIsModalOpen(true);
  };
  const requireChanges: any = () => {
    setType("required");
    setIsModalOpen(true);
  };

  return (
    <>
      <Modal title="Submit review" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ReviewForm type={type} />
      </Modal>

      {/* {assigness.includes(currentUserId) && currentUserId !== pullRequest.csm.author ? ( */}
      {assigness.includes(currentUserId) ? (
        <div className="grid grid-cols-12 w-100 py-3 ">
          <div className="col-span-12 text-right space-x-2">
            <Button onClick={approve}>Approve</Button>
            <Button onClick={requireChanges}>Require Changes</Button>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
