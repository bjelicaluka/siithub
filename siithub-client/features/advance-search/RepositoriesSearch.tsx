import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { useSearch } from "./useAdvanceSearch";
import { RepositoryCard } from "../repository/RepositoryCard";

type RepositoriesSearchProps = { param: string };

export const RepositoriesSearch: FC<RepositoriesSearchProps> = ({ param }) => {
  const { data: repositories } = useSearch<Repository>("repositories", param);
  return (
    <div>
      {repositories.map((r: Repository) => {
        return <RepositoryCard key={r._id} repository={r} />;
      })}
    </div>
  );
};
