import { useEffect, type FC, type PropsWithChildren } from "react";
import { HorizontalMenu, type MenuItem } from "../../../../../core/components/HorizontalMenu";
import { useRouter } from "next/router";
import {
  PullRequestContextProvider,
  setPullRequest,
  usePullRequestContext,
} from "../../../../../features/pull-requests/PullRequestContext";
import { usePullRequest } from "../../../../../features/pull-requests/usePullRequests";
import { useRepositoryContext } from "../../../../../features/repository/RepositoryContext";

const links: MenuItem[] = [
  {
    title: "Conversations",
    path: "/[username]/[repository]/pull-requests/[localId]",
  },
  {
    title: "Commits",
    path: "/[username]/[repository]/pull-requests/[localId]/commits",
  },
  {
    title: "Changed files",
    path: "/[username]/[repository]/pull-requests/[localId]/changes",
  },
];

export const PullRequestFetcher: FC<PropsWithChildren> = ({ children }) => {
  const { repository } = useRepositoryContext();
  const repositoryId = repository?._id ?? "";

  const router = useRouter();
  const { localId } = router.query as any;

  const { pullRequest: existingPullRequest } = usePullRequest(repositoryId, +localId);

  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();

  useEffect(() => {
    if (!existingPullRequest) return;

    pullRequestDispatcher(setPullRequest(existingPullRequest));
  }, [existingPullRequest]);

  if (!pullRequest?._id) return <></>;

  return <>{children}</>;
};

export const PullRequestsEditLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();

  const changePath = (path: string) => {
    const queryParams = { ...router.query };

    for (const [param, value] of Object.entries(queryParams)) {
      path = path.replace(`[${param}]`, encodeURIComponent(value?.toString() ?? ""));
    }

    router.push(path);
  };

  return (
    <>
      <PullRequestContextProvider>
        <PullRequestFetcher>
          <HorizontalMenu links={links} onItemClick={changePath} />
          <div className="mt-10">{children}</div>
        </PullRequestFetcher>
      </PullRequestContextProvider>
    </>
  );
};

export default PullRequestsEditLayout;
