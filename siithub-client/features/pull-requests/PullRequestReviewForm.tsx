import { type FC } from "react";
import { approvePullRequest, requireChangesForPullRequest, usePullRequestContext } from "./PullRequestContext";
import { useAuthContext } from "../../core/contexts/Auth";
import { Button } from "../../core/components/Button";

export const PullRequestReviewForm: FC = () => {
  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();
  const { user } = useAuthContext();

  if (pullRequest.csm.isClosed) return <></>;

  const approve: any = () => pullRequestDispatcher(approvePullRequest(pullRequest, user?._id ?? ""));

  const requireChanges = () => pullRequestDispatcher(requireChangesForPullRequest(pullRequest, user?._id ?? ""));

  return (
    <>
      <div className="grid grid-cols-12 w-100 py-3 ">
        <div className="col-span-12 text-right space-x-2">
          <Button onClick={approve}>Approve</Button>
          <Button onClick={requireChanges}>Require Changes</Button>
        </div>
      </div>
    </>
  );
};
