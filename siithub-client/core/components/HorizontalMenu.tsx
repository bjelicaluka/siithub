import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useCallback } from "react";

export type MenuItem = {
  title: string;
  path: string;
};

type HorizontalMenuProps = {
  links: MenuItem[];
};

export const HorizontalMenu: FC<HorizontalMenuProps> = ({ links }) => {
  const router = useRouter();

  const isActive = useCallback(
    (path: string) => {
      return !!router && router.pathname === path;
    },
    [router]
  );

  return (
    <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200">
      {links?.map((link: MenuItem) => {
        return (
          <li key={link.title} className="mr-2">
            <Link
              href={link.path}
              className={
                isActive(link.path)
                  ? "inline-block p-4 text-blue-600 bg-gray-100 rounded-t-lg active"
                  : "inline-block p-4 rounded-t-lg hover:text-gray-600 hover:bg-gray-50"
              }
            >
              {link.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
