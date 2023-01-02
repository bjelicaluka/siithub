import { type FC } from "react";
import { RepositoryHeader } from "./RepositoryHeader";

type RepositoryViewProps = {
  repo: string;
  username: string;
};

export const RepositoryView: FC<RepositoryViewProps> = ({ username, repo }) => {
  return (
    <div>
      <RepositoryHeader username={username} repo={repo} activeTab={"code"} />
    </div>
  );
};
