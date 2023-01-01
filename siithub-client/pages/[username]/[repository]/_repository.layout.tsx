import { NextRouter, useRouter } from "next/router";
import { ReactNode, useMemo } from "react";
import { useAuthContext } from "../../../core/contexts/Auth";
import { RepositoryHeader } from "../../../features/repository/RepositoryHeader";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/outline";
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { RepositoryContextProvider } from "../../../features/repository/RepositoryContext";
import { RepositoryMenu } from "../../../features/repository/RepositoryMenu";

function getLinks(router: NextRouter, username: string, repository: string) {
  return [
    {
      title: "Code",
      icon: <CodeBracketIcon className="h-4 w-4 mr-2" />,
      path: "/[username]/[repository]",
      onClick: async () => {
        await router.push(`/${username}/${repository}`);
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
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
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

export const useRepositoryLayout = (page: ReactNode) => {
  const router = useRouter();
  const { username, repository } = router.query;
  const { user } = useAuthContext();

  const links = getLinks(router, username?.toString() ?? "", repository?.toString() ?? "");

  if (!user) return <></>;
  if (!username || !repository) return <></>;

  return (
    <>
      <RepositoryHeader repo={repository?.toString()} username={username?.toString()} activeTab={"code"} />
      <RepositoryMenu links={links} />

      <RepositoryContextProvider>
        <div className="mt-20">{page}</div>
      </RepositoryContextProvider>
    </>
  );
};
