import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { type IssueWithRepository } from "../issues/issueActions";
import { useSearch } from "./useAdvanceSearch";
import { IssueCard } from "./IssueCard";

type IssuesSearchProps = { param: string; repositoryId?: Repository["_id"]; sort?: any };

export const IssuesSearch: FC<IssuesSearchProps> = ({ param, repositoryId, sort }) => {
  const { data: issues } = useSearch<IssueWithRepository>("issues", param, repositoryId, sort);
  return (
    <div>
      {issues.map((i: IssueWithRepository) => {
        return <IssueCard key={i._id} issue={i} />;
      })}
    </div>
  );
};
