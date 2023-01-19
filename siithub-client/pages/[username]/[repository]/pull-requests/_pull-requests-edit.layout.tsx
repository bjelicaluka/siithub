import { type FC, type PropsWithChildren } from "react";
import { HorizontalMenu, type MenuItem } from "../../../../core/components/HorizontalMenu";
import { useRouter } from "next/router";

const links: MenuItem[] = [
  {
    title: "Conversations",
    path: "/[username]/[repository]/pull-requests/[localId]",
  },
  {
    title: "Commits",
    path: "/[username]/[repository]/pull-requests/[localId]/commits",
  },
  {
    title: "File changed",
    path: "/[username]/[repository]/pull-requests/[localId]/changes",
  },
];

export const PullRequestsEditLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();

  const changePath = (path: string) => {
    const queryParams = { ...router.query };

    for (const [param, value] of Object.entries(queryParams)) {
      path = path.replace(`[${param}]`, encodeURIComponent(value?.toString() ?? ""));
    }

    router.push(path);
  };

  return (
    <>
      <HorizontalMenu links={links} onItemClick={changePath} />
      <div className="mt-10">{children}</div>
    </>
  );
};

export default PullRequestsEditLayout;
