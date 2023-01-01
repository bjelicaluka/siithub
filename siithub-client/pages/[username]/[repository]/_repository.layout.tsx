import { NextRouter, useRouter } from "next/router";
import { ReactNode } from "react";
import { useAuthContext } from "../../../core/contexts/Auth";
import { RepositoryHeader } from "../../../features/repository/RepositoryHeader";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/outline";
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { RepositoryContextProvider } from "../../../features/repository/RepositoryContext";

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
      align: "right",
    },
  ];
}

export const useRepositoryLayout = (page: ReactNode) => {
  const router = useRouter();
  const { username, repository } = router.query;
  const { user } = useAuthContext();

  const links = getLinks(router, username?.toString() ?? "", repository?.toString() ?? "");

  const isActive = (path: string, hasChildrens?: boolean) => {
    return !!router && (hasChildrens ? router.pathname.startsWith(path) : router.pathname === path);
  };

  if (!user) return <></>;
  if (!username || !repository) return <></>;

  return (
    <>
      <RepositoryHeader repo={repository?.toString()} username={username?.toString()} activeTab={"code"} />

      <div className="bg-gray-700 mt-2">
        <div className="py-1 px-2 flex items-baseline space-x-4 ">
          {links?.map((l) => {
            return (
              <a
                key={l.title}
                onClick={l.onClick}
                className={
                  "flex items-center bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium hover:border-indigo-300 hover:border-b-4 " +
                  (isActive(l.path, l.hasChildrens) ? "border-blue-600 border-b-4" : "")
                }
              >
                {l.icon}
                <span className="ml-3">{l.title}</span>
              </a>
            );
          })}
        </div>
      </div>

      <RepositoryContextProvider>
        <div className="mt-20">{page}</div>
      </RepositoryContextProvider>
    </>
  );
};
