import { useRouter } from "next/router";
import { SortComponent } from "../../features/advance-search/SortComponent";
import { TagsSearch } from "../../features/advance-search/TagsSearch";

const Tags = () => {
  const router = useRouter();
  const { param, repositoryId, sort } = router.query;

  if (!router) return <></>;
  return (
    <>
      <SortComponent
        options={{
          "Sort by timestamp 🔼": {
            timeStamp: -1,
          },
          "Sort by timestamp 🔽": {
            timeStamp: 1,
          },
          "Sort by name 🔼": {
            name: 1,
          },
          "Sort by name 🔽": {
            name: -1,
          },
          "Sort by description 🔼": {
            description: 1,
          },
          "Sort by description 🔽": {
            description: -1,
          },
          "Sort by version 🔼": {
            version: 1,
          },
          "Sort by version 🔽": {
            version: -1,
          },
        }}
      />
      <TagsSearch param={param?.toString() ?? ""} repositoryId={repositoryId?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default Tags;
