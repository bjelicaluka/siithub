import { type FC } from "react";

type RepositoryViewProps = {
  repo: string;
  username: string;
  isEmpty: boolean;
};

export const RepositoryView: FC<RepositoryViewProps> = ({ username, repo, isEmpty }) => {
  if (isEmpty)
    return (
      <div>
        <p className="text-2xl">This repository is empty</p>
      </div>
    );
  return <div>Loading...</div>;
};
