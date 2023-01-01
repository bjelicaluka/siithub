import { type FC, PropsWithChildren, ReactNode, ReactElement } from "react";
import { useSettingsLayout } from "./settings/_settings.layout";
import { useProfileLayout } from "./users/[username]/_profile.layout";
import { useRouter } from "next/router";
import { useRepositoryLayout } from "./[username]/[repository]/_repository.layout";
import { useRepositorySettingsLayout } from "./[username]/[repository]/settings/_repository-settings.layout";

type NestedLayout = {
  path: string;
  pathMatch: "startsWith" | "exact";
  layoutFactory: (page: ReactNode) => ReactElement;
  children?: NestedLayoutChild[];
};

type NestedLayoutChild = {
  path: string;
  layoutFactory: (page: ReactNode) => ReactElement;
};

const registeredLayouts: NestedLayout[] = [
  {
    path: "/settings",
    pathMatch: "startsWith",
    layoutFactory: useSettingsLayout,
  },
  {
    path: "/users/[username]",
    pathMatch: "startsWith",
    layoutFactory: useProfileLayout,
  },
  {
    path: "/[username]/[repository]",
    pathMatch: "startsWith",
    layoutFactory: useRepositoryLayout,
    children: [
      {
        path: "/settings",
        layoutFactory: useRepositorySettingsLayout,
      },
    ],
  },
];

function match(path: string, routerPath: string, matchType: string) {
  const cleanedRouterPath = routerPath.replace("#", "");
  const matchers: any = {
    startsWith: () => cleanedRouterPath.startsWith(path),
    exact: () => cleanedRouterPath.startsWith(path),
  };

  return (matchers[matchType] || (() => false))();
}

export const NestedLayoutResolver: FC<PropsWithChildren> = ({ children }) => {
  const r = useRouter();

  const findLayoutFactory = () => {
    for (const layout of registeredLayouts) {
      for (const childLayout of layout.children || []) {
        if (match(layout.path + childLayout.path, r.pathname, layout.pathMatch)) {
          return (children: ReactNode) => layout.layoutFactory(childLayout.layoutFactory(children));
        }
      }

      if (match(layout.path, r.pathname, layout.pathMatch)) {
        return layout.layoutFactory;
      }
    }

    return (page: ReactNode) => page;
  };

  return <>{findLayoutFactory()(children)}</>;
};
