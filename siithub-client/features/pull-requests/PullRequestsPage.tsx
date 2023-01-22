import { useState, type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { useRouter } from "next/router";
import { useSearchPullRequests } from "./usePullRequests";
import { Button } from "../../core/components/Button";
import { PullRequestsTable } from "./PullRequestsTable";
import { PullRequestsSearchForm } from "./PullRequestsSearchForm";
import { type PullRequestsQuery } from "./pullRequestActions";
import { useRefresh } from "../../core/hooks/useRefresh";

type PullRequestsPageProps = {
  repositoryId: Repository["_id"];
};

export const PullRequestsPage: FC<PullRequestsPageProps> = ({ repositoryId }) => {
  const { repository } = useRepositoryContext();
  const router = useRouter();
  const [existingParams, setExistingParams] = useState<PullRequestsQuery>({});
  const { pullRequests } = useSearchPullRequests(existingParams, repositoryId);
  const { key, refresh } = useRefresh("pr_search_form");

  const navigateToNewPullRequest = () => {
    router.push(`/${repository?.owner ?? ""}/${repository?.name ?? ""}/pull-requests/new`);
  };

  const clearParams = () => {
    setExistingParams({});
    refresh();
  };

  return (
    <>
      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div key={key} className="border-t border-gray-200">
            <PullRequestsSearchForm
              repositoryId={repositoryId}
              existingParams={existingParams}
              onParamsChange={(params: any) => {
                setExistingParams(params);
              }}
            />
          </div>
        </div>
      </div>
      <div className="px-4 py-3 text-right sm:px-6">
        <span className="pr-4">
          <Button onClick={clearParams}>Clear</Button>
        </span>
        <span>
          <Button onClick={navigateToNewPullRequest}>New Pull Request</Button>
        </span>
      </div>

      <PullRequestsTable repositoryId={repositoryId} pullRequests={pullRequests} />
    </>
  );
};
