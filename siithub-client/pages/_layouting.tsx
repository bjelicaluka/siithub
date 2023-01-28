import { type FC, type PropsWithChildren } from "react";
import { SettingsLayout } from "./settings/_settings.layout";
import { ProfileLayout } from "./users/[username]/_profile.layout";
import { useRouter } from "next/router";
import { RepositoryLayout } from "./[username]/[repository]/_repository.layout";
import { RepositorySettingsLayout } from "./[username]/[repository]/settings/_repository-settings.layout";
import { RepositoryTreeLayout } from "./[username]/[repository]/tree/_repository-tree.layout";
import RepositoryBlobLayout from "./[username]/[repository]/blob/_repository-blob.layout";
import PullRequestsEditLayout from "./[username]/[repository]/pull-requests/[localId]/_pull-requests-edit.layout";
import AdvanceSearchLayout from "./advance-search/_advance-search.layout";

type NestedLayout = {
  path: string;
  pathMatch: "startsWith" | "exact";
  component: FC<PropsWithChildren>;
  children?: NestedLayoutChild[];
};

type NestedLayoutChild = {
  path: string;
  component: FC<PropsWithChildren>;
};

const registeredLayouts: NestedLayout[] = [
  {
    path: "/settings",
    pathMatch: "startsWith",
    component: SettingsLayout,
  },
  {
    path: "/users/[username]",
    pathMatch: "startsWith",
    component: ProfileLayout,
  },
  {
    path: "/advance-search",
    pathMatch: "startsWith",
    component: AdvanceSearchLayout,
  },
  {
    path: "/[username]/[repository]",
    pathMatch: "startsWith",
    component: RepositoryLayout,
    children: [
      {
        path: "/settings",
        component: RepositorySettingsLayout,
      },
      {
        path: "/tree",
        component: RepositoryTreeLayout,
      },
      {
        path: "/blob",
        component: RepositoryBlobLayout,
      },
      {
        path: "/pull-requests/[localId]",
        component: PullRequestsEditLayout,
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

  const findLayoutComponent = () => {
    for (const layout of registeredLayouts) {
      for (const childLayout of layout.children || []) {
        if (match(layout.path + childLayout.path, r.pathname, layout.pathMatch)) {
          const NestedLayout: FC<PropsWithChildren> = ({ children }) => {
            return (
              <>
                <layout.component>
                  <childLayout.component>{children}</childLayout.component>
                </layout.component>
              </>
            );
          };
          return NestedLayout;
        }
      }

      if (match(layout.path, r.pathname, layout.pathMatch)) {
        return layout.component;
      }
    }

    return undefined;
  };

  const LayoutComponent = findLayoutComponent();

  if (!LayoutComponent) return <>{children}</>;

  return (
    <>
      <LayoutComponent>{children}</LayoutComponent>
    </>
  );
};

export default NestedLayoutResolver;
