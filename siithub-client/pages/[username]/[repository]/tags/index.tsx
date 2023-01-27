import { useRepositoryContext } from "../../../../features/repository/RepositoryContext";
import { type Repository } from "../../../../features/repository/repository.service";
import { TagsPage } from "../../../../features/tags/TagsPage";

const Tags = () => {
  const { repository } = useRepositoryContext();
  const { owner, name } = repository as Repository;

  return (
    <>
      <TagsPage owner={owner} name={name} />
    </>
  );
};

export default Tags;
