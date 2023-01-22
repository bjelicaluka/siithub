import { type FC } from "react";
import { cancelPullRequest, mergePullRequest, usePullRequestContext } from "./PullRequestContext";
import { Button } from "../../core/components/Button";
import { useAuthContext } from "../../core/contexts/Auth";
import { PullRequestState } from "./pullRequestActions";

export const PullRequestClosingForm: FC = () => {
  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();
  const { user } = useAuthContext();

  if (pullRequest.csm.isClosed) return <></>;

  const cancel = () => pullRequestDispatcher(cancelPullRequest(pullRequest, user?._id ?? ""));

  const merge = () => pullRequestDispatcher(mergePullRequest(pullRequest, user?._id ?? ""));

  return (
    <>
      <div className="grid grid-cols-12 sm:px-6 bg-gray-200 px-4 py-3 border">
        <div className="col-span-6">
          <Button onClick={cancel}>Cancel</Button>
        </div>

        <div className="col-span-6 text-right">
          {pullRequest.csm.state === PullRequestState.ChangesRequired ? (
            <p className="mt-4 font-medium">Unable to merge because changes are required.</p>
          ) : (
            <Button onClick={merge}>Merge</Button>
          )}
        </div>
      </div>
    </>
  );
};
