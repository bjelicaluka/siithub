import { type FC, type PropsWithChildren } from "react";
import { NextRouter, useRouter } from "next/router";
import { Cog8ToothIcon, UsersIcon } from "@heroicons/react/24/solid";
import { VerticalMenu } from "../../../../core/components/VerticalMenu";

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

export const RepositorySettingsLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { username, repository } = router.query;

  const links = getLinks(router, username?.toString() ?? "", repository?.toString() ?? "");

  if (!username || !repository) return <></>;

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
