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
          "Sortiraj po datumu 🔼": {
            timeStamp: -1,
          },
          "Sortiraj po datimu 🔽": {
            timeStamp: 1,
          },
          "Sortiraj po naslovu 🔼": {
            name: 1,
          },
          "Sortiraj po naslovu 🔽": {
            name: -1,
          },
          "Sortiraj po opisu 🔼": {
            description: 1,
          },
          "Sortiraj po opisu 🔽": {
            description: -1,
          },
          "Sortiraj po verziji 🔼": {
            version: 1,
          },
          "Sortiraj po verziji 🔽": {
            version: -1,
          },
        }}
      />
      <TagsSearch param={param?.toString() ?? ""} repositoryId={repositoryId?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default Tags;
