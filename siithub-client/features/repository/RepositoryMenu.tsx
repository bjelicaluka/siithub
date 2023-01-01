import { useRouter } from "next/router";
import { FC, ReactElement, useCallback } from "react";

export type RepositoryMenuItem = {
  title: string;
  icon: ReactElement;
  path: string;
  hasChildrens?: boolean;
  onClick: () => any;
};

type RepositoryMenuProps = {
  links: RepositoryMenuItem[];
};

export const RepositoryMenu: FC<RepositoryMenuProps> = ({ links }) => {
  const router = useRouter();

  const isActive = useCallback(
    (path: string, hasChildrens?: boolean) => {
      return !!router && (hasChildrens ? router.pathname.startsWith(path) : router.pathname === path);
    },
    [router]
  );

  return (
    <>
      <div className="bg-gray-700 mt-2">
        <div className="py-1 px-2 flex items-baseline space-x-4 ">
          {links?.map((link: RepositoryMenuItem) => {
            return (
              <a
                key={link.title}
                onClick={link.onClick}
                className={
                  "flex items-center bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium hover:border-indigo-300 hover:border-b-4 " +
                  (isActive(link.path, link.hasChildrens) ? "border-blue-600 border-b-4" : "")
                }
              >
                {link.icon}
                <span className="ml-3">{link.title}</span>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
};
