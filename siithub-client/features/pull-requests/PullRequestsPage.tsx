import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { useRouter } from "next/router";
import { usePullRequests } from "./usePullRequests";
import { Button } from "../../core/components/Button";
import { PullRequestsTable } from "./PullRequestsTable";

type PullRequestsPageProps = {
  repositoryId: Repository["_id"];
};

export const PullRequestsPage: FC<PullRequestsPageProps> = ({ repositoryId }) => {
  const { repository } = useRepositoryContext();
  const router = useRouter();
  const { pullRequests } = usePullRequests(repositoryId);

  const navigateToNewPullRequest = () =>
    router.push(`/${repository?.owner ?? ""}/${repository?.name ?? ""}/pull-requests/new`);

  return (
    <>
      <div className="px-4 py-3 text-right sm:px-6">
        <span>
          <Button onClick={navigateToNewPullRequest}>New Pull Request</Button>
        </span>
      </div>

      <PullRequestsTable repositoryId={repositoryId} pullRequests={pullRequests} />
    </>
  );
};
