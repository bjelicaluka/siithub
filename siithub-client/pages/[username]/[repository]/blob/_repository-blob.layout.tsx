import { useRouter } from "next/router";
import { type FC, type PropsWithChildren } from "react";
import { BranchesMenu } from "../../../../features/branches/BranchesMenu";
import { FilePath } from "../../../../features/file/FilePath";

export const RepositoryBlobLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { repository, username, branch, path } = router.query;

  return (
    <>
      <div className="mb-3 flex">
        <BranchesMenu />
        <div className="p-4 text-lg items-center">
          <FilePath
            username={username as string}
            repoName={repository as string}
            branch={branch as string}
            filePath={(path as string[]).join("/")}
          />
        </div>
      </div>

      {children}
    </>
  );
};

export default RepositoryBlobLayout;
