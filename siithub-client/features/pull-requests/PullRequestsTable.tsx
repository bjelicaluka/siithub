import { useCallback, type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { PullRequestState, type PullRequest } from "./pullRequestActions";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { useRouter } from "next/router";
import { useLabels } from "../labels/useLabels";
import { type Label } from "../labels/labelActions";
import { LabelPreview } from "../labels/LabelPreview";
import { findLastEvent } from "../common/utils";
import moment from "moment";
import { PRIcon } from "./PRIcon";

type PullRequestsTableProps = {
  repositoryId: Repository["_id"];
  pullRequests: PullRequest[];
};

const AdditionalText = ({ pullRequest }: { pullRequest: PullRequest }) => {
  const prCreated = findLastEvent(pullRequest.events, (e: any) => e.type === "PullRequestCreatedEvent");

  const prClosed = findLastEvent(pullRequest.events, (e: any) =>
    ["PullRequestCanceledEvent", "PullRequestMergedEvent"].includes(e.type)
  );

  const participants = pullRequest.participants;

  if (!pullRequest.csm.isClosed) {
    return (
      <>
        #{pullRequest.localId} opened {moment(prCreated?.timeStamp).fromNow()} by{" "}
        {participants[prCreated?.by]?.username}
      </>
    );
  }

  return (
    <>
      #{pullRequest.localId} by {participants[prClosed?.by]?.username} was{" "}
      {pullRequest.csm.state === PullRequestState.Merged ? "merged" : "canceled"}{" "}
      {moment(prCreated?.timeStamp).fromNow()}
    </>
  );
};

export const PullRequestsTable: FC<PullRequestsTableProps> = ({ repositoryId, pullRequests }) => {
  const { repository } = useRepositoryContext();
  const router = useRouter();

  const { labels } = useLabels(repositoryId);
  const findLabel = useCallback((labelId: Label["_id"]) => labels?.find((l: Label) => l._id === labelId), [labels]);

  const navigateToPullRequestEdit = (localId: number) =>
    router.push(`/${repository?.owner ?? ""}/${repository?.name ?? ""}/pull-requests/${localId}`);

  return (
    <>
      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <tbody>
            {pullRequests?.map((pullRequest: PullRequest) => (
              <tr key={pullRequest._id} className="bg-white border-b">
                <td className="py-4 px-6">
                  <div className="cursor-pointer" onClick={() => navigateToPullRequestEdit(pullRequest.localId)}>
                    <div className="flex">
                      <span className="mr-2 mt-2">
                        <PRIcon pullRequest={pullRequest} />
                      </span>
                      <span className="text-xl mr-2">{pullRequest.csm.title}</span>
                      <span>
                        {pullRequest.csm.labels?.map((lId) => {
                          const label = findLabel(lId) || {};
                          return <LabelPreview key={label._id} {...label} />;
                        })}
                      </span>
                    </div>
                    <div className="ml-6">
                      <AdditionalText pullRequest={pullRequest} />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
