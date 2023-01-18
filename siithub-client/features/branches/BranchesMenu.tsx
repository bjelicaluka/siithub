import Link from "next/link";
import { useRouter } from "next/router";
import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { useBranches } from "./useBranches";
import Select from "react-select";

const BranchesIcon = ({ className }: any) => {
  return (
    <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" className={"octicon octicon-git-branch " + className}>
      <path d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"></path>
    </svg>
  );
};

export const BranchesMenu: FC<{ count?: boolean }> = ({ count }) => {
  const router = useRouter();
  const { repository } = useRepositoryContext();
  const { owner, name } = repository as Repository;
  const { branches } = useBranches(owner, name);
  const { branch } = router.query;

  if (!branch) return <></>;

  const changeBranch = (branch: string) => {
    if (!branch) return;

    let finalRoute = router.pathname;

    const queryParams = { ...router.query };
    queryParams["branch"] = branch;

    for (const [param, value] of Object.entries(queryParams)) {
      if (typeof value == "string") {
        finalRoute = finalRoute.replace(`[${param}]`, encodeURIComponent(value?.toString()));
      } else {
        if (value?.length ?? 0 >= 2) {
          finalRoute = finalRoute.replace(`[...${param}]`, encodeURIComponent(value?.join("/") ?? ""));
        } else {
          finalRoute = finalRoute.replace(`[...${param}]`, encodeURIComponent(value?.at(0) ?? ""));
        }
      }
    }

    router.push(finalRoute);
  };

  return (
    <>
      <div className="flex space-x-2 items-center">
        <div className="min-w-[256px]">
          <Select
            defaultValue={{ value: branch, label: branch }}
            options={branches?.map((b) => ({ value: b, label: b }))}
            onChange={(val) => changeBranch(val?.label as string)}
          />
        </div>

        {count && (
          <Link href={`/${owner}/${name}/branches`} className="flex hover:text-blue-800">
            <BranchesIcon className="mt-1 mr-1" />
            {branches?.length} branches
          </Link>
        )}
      </div>
    </>
  );
};
