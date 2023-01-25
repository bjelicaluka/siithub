import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { type IssueWithRepository } from "../issues/issueActions";
import { useSearch } from "./useAdvanceSearch";
import { IssueCard } from "./IssueCard";

type IssuesSearchProps = { param: string; repositoryId?: Repository["_id"] };

export const IssuesSearch: FC<IssuesSearchProps> = ({ param, repositoryId }) => {
  const { data: issues } = useSearch<IssueWithRepository>("issues", param, repositoryId);
  return (
    <div>
      {issues.map((i: IssueWithRepository) => {
        return <IssueCard key={i._id} issue={i} />;
      })}
    </div>
  );
};
