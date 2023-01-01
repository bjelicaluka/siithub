import { LabelsPage } from "../../../../features/labels/LabelsPage";
import { useRepositoryContext } from "../../../../features/repository/RepositoryContext";

const Labels = () => {
  const { repository } = useRepositoryContext();
  const repositoryId = repository?._id ?? "";

  return (
    <>
      <LabelsPage repositoryId={repositoryId} />
    </>
  );
};

export default Labels;
