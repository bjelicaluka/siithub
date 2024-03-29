import { NextRouter, useRouter } from "next/router";
import { type FC, type PropsWithChildren } from "react";
import { useAuthContext } from "../../../core/contexts/Auth";
import { RepositoryHeader } from "../../../features/repository/RepositoryHeader";
import { CodeBracketIcon, PresentationChartLineIcon } from "@heroicons/react/24/outline";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/outline";
import { TagIcon } from "@heroicons/react/24/outline";
import { TicketIcon } from "@heroicons/react/24/outline";
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { RepositoryContextProvider } from "../../../features/repository/RepositoryContext";
import { RepositoryMenu } from "../../../features/repository/RepositoryMenu";

function getLinks(router: NextRouter, username: string, repository: string) {
  return [
    {
      title: "Code",
      icon: <CodeBracketIcon className="h-4 w-4 mr-2" />,
      path: "/[username]/[repository]",
      isMultimenu: true,
      menus: ["/tree", "/blob", "/branches", "/commits", "/commit", "/tags"],
      onClick: async () => {
        await router.push(`/${username}/${repository}`);
      },
    },
    {
      title: "Issues",
      icon: <TicketIcon className="h-4 w-4 mr-2" />,
      path: "/[username]/[repository]/issues",
      hasChildrens: true,
      onClick: async () => {
        await router.push(`/${username}/${repository}/issues`);
      },
    },
    {
      title: "Pull Requests",
      icon: <TicketIcon className="h-4 w-4 mr-2" />,
      path: "/[username]/[repository]/pull-requests",
      hasChildrens: true,
      onClick: async () => {
        await router.push(`/${username}/${repository}/pull-requests`);
      },
    },
    {
      title: "Milestones",
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
      path: "/[username]/[repository]/milestones",
      hasChildrens: true,
      onClick: async () => {
        await router.push(`/${username}/${repository}/milestones`);
      },
    },
    {
      title: "Labels",
      icon: <TagIcon className="h-4 w-4 mr-2" />,
      path: "/[username]/[repository]/labels",
      onClick: async () => {
        await router.push(`/${username}/${repository}/labels`);
      },
    },
    {
      title: "Stars",
      icon: <StarIcon className="h-4 w-4 mr-2" />,
      path: "/[username]/[repository]/stargazers",
      onClick: async () => {
        await router.push(`/${username}/${repository}/stargazers`);
      },
    },
    {
      title: "Insights",
      icon: <PresentationChartLineIcon className="h-4 w-4 mr-2" />,
      path: "/[username]/[repository]/graphs/[graph]",
      onClick: async () => {
        await router.push(`/${username}/${repository}/graphs/pulse`);
      },
    },
    {
      title: "Settings",
      icon: <Cog8ToothIcon className="h-4 w-4 mr-2" />,
      path: "/[username]/[repository]/settings",
      hasChildrens: true,
      onClick: async () => {
        await router.push(`/${username}/${repository}/settings`);
      },
    },
  ];
}

export const RepositoryLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { username, repository } = router.query;
  const { user } = useAuthContext();

  const links = getLinks(router, username?.toString() ?? "", repository?.toString() ?? "");

  if (!user) return <></>;
  if (!username || !repository) return <></>;

  return (
    <>
      <RepositoryContextProvider>
        <RepositoryHeader />
        <RepositoryMenu links={links} />

        <div className="mt-10 w-full">{children}</div>
      </RepositoryContextProvider>
    </>
  );
};

export default RepositoryLayout;
