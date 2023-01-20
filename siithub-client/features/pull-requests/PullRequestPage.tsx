import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { DefinePullRequestForm } from "./DefinePullRequestForm";
import { LabelsForm } from "./LabelsForm";
import { MilestonesForm } from "./MilestonesForm";
import { AssignessForm } from "./AssignessForm";
import { CommentForm } from "./CommentForm";
import { usePullRequestContext } from "./PullRequestContext";
import { CommentPreview } from "./CommentPreview";

type PullRequestPageProps = {
  repositoryId: Repository["_id"];
  pullRequestId: number;
};

export const PullRequestPage: FC<PullRequestPageProps> = ({ repositoryId, pullRequestId }) => {
  const { pullRequest, isEdit } = usePullRequestContext();

  if (!isEdit) return <></>;

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="overflow-hidden shadow sm:rounded-md mb-10">
            <div className="bg-white px-4 py-5 sm:p-6 mb-1">
              <DefinePullRequestForm />
            </div>
          </div>

          <div key={pullRequest?.events.length}>
            {pullRequest?.csm?.comments?.map((c, i) => (
              <div key={i} className="overflow-hidden shadow sm:rounded-md mb-10">
                {c?._id}
                <CommentPreview comment={c} />
              </div>
            ))}
          </div>

          <div key={pullRequest?.csm?.comments?.length ?? -1}>
            <CommentForm />
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
