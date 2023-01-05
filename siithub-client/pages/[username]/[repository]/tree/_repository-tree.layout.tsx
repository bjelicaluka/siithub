import { type FC, type PropsWithChildren } from "react";
import { BranchesMenu } from "../../../../features/branches/BranchesMenu";

export const RepositoryTreeLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <div className="mb-5">
        <BranchesMenu />
      </div>

      {children}
    </>
  );
};
