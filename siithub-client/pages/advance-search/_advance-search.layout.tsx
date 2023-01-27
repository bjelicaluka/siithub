import { type FC, type PropsWithChildren } from "react";
import { type NextRouter, useRouter } from "next/router";
import { VerticalMenu } from "../../core/components/VerticalMenu";
import { useCount } from "../../features/advance-search/useAdvanceSearch";

const MeniItemContent = ({ title, counter }: any) => {
  return (
    <div className="flex space-x-1">
      <div>{title}</div>
      <div className="flex-1 text-right">
        <button
          type="button"
          className={"text-md font-medium leading-6 rounded-full px-2 border-2 bg-indigo-300 text-white"}
        >
          {counter ?? "0"}
        </button>
      </div>
    </div>
  );
};

function getLinks(router: NextRouter, counters: any) {
  return [
    {
      title: <MeniItemContent title="Repositories" counter={counters.reposCount} />,
      icon: <></>,
      path: "/advance-search/repositories",
      visibility: () => !router.query?.repositoryId,
      onClick: async () => {
        const query = { ...router.query };
        query.sort && delete query["sort"];
        await router.push({ pathname: `/advance-search/repositories`, query });
      },
    },
    {
      title: <MeniItemContent title="Commits" counter={counters.commitsCount} />,
      icon: <></>,
      path: "/advance-search/commits",
      visibility: () => !!router.query?.repositoryId,
      onClick: async () => {
        const query = { ...router.query };
        query.sort && delete query["sort"];
        await router.push({ pathname: `/advance-search/commits`, query });
      },
    },
    {
      title: <MeniItemContent title="Issues" counter={counters.issuesCount} />,
      icon: <></>,
      path: "/advance-search/issues",
      onClick: async () => {
        const query = { ...router.query };
        query.sort && delete query["sort"];
        await router.push({ pathname: `/advance-search/issues`, query });
      },
    },
    {
      title: <MeniItemContent title="Users" counter={counters.usersCount} />,
      icon: <></>,
      path: "/advance-search/users",
      visibility: () => !router.query?.repositoryId,
      onClick: async () => {
        const query = { ...router.query };
        query.sort && delete query["sort"];
        await router.push({ pathname: `/advance-search/users`, query });
      },
    },
    {
      title: <MeniItemContent title="Pull Requests" counter={counters.pullReqCount} />,
      icon: <></>,
      path: "/advance-search/pull-requests",
      visibility: () => !!router.query?.repositoryId,
      onClick: async () => {
        const query = { ...router.query };
        query.sort && delete query["sort"];
        await router.push({ pathname: `/advance-search/pull-requests`, query });
      },
    },
  ];
}

export const AdvanceSearchLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();

  const param = router.query.param as string;
  const repositoryId = router.query.repositoryId as string;
  const reposCount = useCount("repositories", param, repositoryId).data;
  const issuesCount = useCount("issues", param, repositoryId).data;
  const usersCount = useCount("users", param, repositoryId).data;
  const commitsCount = useCount("commits", param, repositoryId).data;
  const pullReqCount = useCount("pull-requests", param, repositoryId).data;

  const counters = {
    reposCount,
    issuesCount,
    usersCount,
    commitsCount,
    pullReqCount,
  };

  const links = getLinks(router, counters);

  return (
    <>
      <div className="flex">
        <div>
          <aside className="w-72" aria-label="Sidebar">
            <div className="overflow-y-auto py-4 px-3 bg-gray-50 rounded">
              <VerticalMenu links={links} />
            </div>
          </aside>
        </div>
        <div className="grow ml-4">{children}</div>
      </div>
    </>
  );
};

export default AdvanceSearchLayout;
