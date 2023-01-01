import { ReactNode } from "react";
import { NextRouter, useRouter } from "next/router";
import { Cog8ToothIcon, UsersIcon } from "@heroicons/react/24/solid";
import { useRepositoryLayout } from "../_repository.layout";
import { RepositoryContextProvider } from "../../../../features/repository/RepositoryContext";

function getLinks(router: NextRouter, username: string, repository: string) {
  return [
    {
      title: "General",
      icon: <Cog8ToothIcon className="h-4 w-4 mr-2" />,
      path: "/[username]/[repository]/settings",
      onClick: async () => {
        await router.push(`/${username}/${repository}/settings`);
      },
    },
    {
      title: "Collaborators",
      icon: <UsersIcon className="h-6 w-6 text-gray-500" />,
      path: "/[username]/[repository]/settings/collaborators",
      onClick: async () => {
        await router.push(`/${username}/${repository}/settings/collaborators`);
      },
    },
  ];
}

const useRepositorySettingsLayout = (page: ReactNode) => {
  const router = useRouter();
  const { username, repository } = router.query;

  const links = getLinks(router, username?.toString() ?? "", repository?.toString() ?? "");

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  if (!username || !repository) return <></>;

  return (
    <>
      <div className="flex">
        <div>
          <aside className="w-72" aria-label="Sidebar">
            <div className="overflow-y-auto py-4 px-3 bg-gray-50 rounded">
              <ul className="space-y-2">
                {links?.map((l) => {
                  return (
                    <li key={l.title}>
                      <a
                        onClick={l.onClick}
                        className={
                          "flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-300" +
                          (isActive(l.path) ? " bg-gray-200" : " ")
                        }
                      >
                        {l.icon}
                        <span className="ml-3">{l.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
        <div className="grow ml-4">{page}</div>
      </div>
    </>
  );
};

useRepositorySettingsLayout.parentLayout = useRepositoryLayout;

export { useRepositorySettingsLayout };
