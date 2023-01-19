import { type FC, useEffect } from "react";
import { type Repository } from "../repository/repository.service";
import { usePullRequest } from "./usePullRequests";
import { setPullRequest, usePullRequestContext } from "./PullRequestContext";
import { DefinePullRequestForm } from "./DefinePullRequestForm";
import { LabelsForm } from "./LabelsForm";
import { MilestonesForm } from "./MilestonesForm";
import { AssignessForm } from "./AssignessForm";

type PullRequestPageProps = {
  repositoryId: Repository["_id"];
  pullRequestId: number;
};

export const PullRequestPage: FC<PullRequestPageProps> = ({ repositoryId, pullRequestId }) => {
  const { pullRequest: existingPullRequest } = usePullRequest(repositoryId, pullRequestId);

  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();

  useEffect(() => {
    if (!existingPullRequest) return;

    console.log(existingPullRequest);
    pullRequestDispatcher(setPullRequest(existingPullRequest));
  }, [existingPullRequest]);

  if (!pullRequest?._id) return <></>;

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="overflow-hidden shadow sm:rounded-md mb-10">
            <div className="bg-white px-4 py-5 sm:p-6 mb-1">
              <DefinePullRequestForm />
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="bg-white py-6">
            <LabelsForm />
          </div>

          <div className="bg-white pb-6">
            <MilestonesForm />
          </div>

          <AssignessForm />
        </div>
      </div>
    </>
  );
};
