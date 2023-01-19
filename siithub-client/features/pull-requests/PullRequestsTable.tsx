import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { type PullRequest } from "./pullRequestActions";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { useRouter } from "next/router";
import { PrOpenIcon } from "./Icons";

type PullRequestsTableProps = {
  repositoryId: Repository["_id"];
  pullRequests: PullRequest[];
};

const AdditionalText = ({ pullRequest }: { pullRequest: PullRequest }) => {
  return <>Nothing for now</>;
};

export const PullRequestsTable: FC<PullRequestsTableProps> = ({ repositoryId, pullRequests }) => {
  const { repository } = useRepositoryContext();
  const router = useRouter();

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
                        {/* {pullRequest.csm.state === IssueState.Closed ? <ClosedIcon /> : <OpenedIcon />} */}
                        <PrOpenIcon />
                      </span>
                      <span className="text-xl mr-2">{pullRequest.csm.title}</span>
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
