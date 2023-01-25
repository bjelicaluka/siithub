import { useRouter } from "next/router";
import { type FC, ReactElement, useCallback } from "react";

export type MenuItem = {
  title: string | ReactElement;
  icon: ReactElement;
  path: string;
  visibility?: () => boolean;
  onClick: () => any;
};

type VerticalMenuProps = {
  links: MenuItem[];
};

export const VerticalMenu: FC<VerticalMenuProps> = ({ links }) => {
  const router = useRouter();

  const isActive = useCallback(
    (path: string) => {
      return router.pathname === path;
    },
    [router]
  );

  return (
    <ul className="space-y-2">
      {links
        ?.filter((link: MenuItem) => !link.visibility || link.visibility())
        .map((link: MenuItem, i) => {
          return (
            <li key={i}>
              <p
                onClick={link.onClick}
                className={
                  "flex items-center p-2 text-base cursor-pointer font-normal text-gray-900 rounded-lg hover:bg-gray-300" +
                  (isActive(link.path) ? " bg-gray-200" : " ")
                }
              >
                {link.icon}
                {<span className="ml-3 flex-1">{link.title}</span>}
              </p>
            </li>
          );
        })}
    </ul>
  );
};
