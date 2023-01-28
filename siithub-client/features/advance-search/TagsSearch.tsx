import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { useSearch } from "./useAdvanceSearch";
import { type TagWithRepository } from "../tags/tagActions";
import { TagCard } from "./TagCard";

type TagsSearchProps = { param: string; repositoryId?: Repository["_id"]; sort?: any };

export const TagsSearch: FC<TagsSearchProps> = ({ param, repositoryId, sort }) => {
  const { data: tags } = useSearch<TagWithRepository>("tags", param, repositoryId, sort);
  return (
    <div className="mt-2">
      {tags.map((t: TagWithRepository) => {
        return (
          <div className="mt-1" key={t._id}>
            <TagCard tag={t} />
          </div>
        );
      })}
    </div>
  );
};
