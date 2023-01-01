import { useRouter } from "next/router";
import { FC, ReactElement, useCallback } from "react";

export type MenuItem = {
  title: string;
  icon: ReactElement;
  path: string;
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
      {links?.map((link: MenuItem) => {
        return (
          <li key={link.title}>
            <a
              onClick={link.onClick}
              className={
                "flex items-center p-2 text-base font-normal text-gray-900 rounded-lg hover:bg-gray-300" +
                (isActive(link.path) ? " bg-gray-200" : " ")
              }
            >
              {link.icon}
              <span className="ml-3">{link.title}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
};
