import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { useSearch } from "./useAdvanceSearch";
import { RepositoryCard } from "../repository/RepositoryCard";

type RepositoriesSearchProps = { param: string; sort?: any };

export const RepositoriesSearch: FC<RepositoriesSearchProps> = ({ param, sort }) => {
  const { data: repositories } = useSearch<Repository>("repositories", param, undefined, sort);
  return (
    <div className="mt-2">
      {repositories.map((r: Repository) => {
        return (
          <div key={r._id} className="mt-1">
            <RepositoryCard repository={r} />
          </div>
        );
      })}
    </div>
  );
};
