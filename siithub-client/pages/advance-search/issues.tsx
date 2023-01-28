import { useRouter } from "next/router";
import { IssuesSearch } from "../../features/advance-search/IssuesSearch";
import { SortComponent } from "../../features/advance-search/SortComponent";

const Issues = () => {
  const router = useRouter();
  const { param, repositoryId, sort } = router.query;

  if (!router) return <></>;

  return (
    <>
      <SortComponent
        options={{
          "Sort by timestamp 🔼": {
            "csm.timeStamp": -1,
          },
          "Sort by timestamp 🔽": {
            "csm.timeStamp": 1,
          },
          "Sort by title 🔼": {
            "csm.title": 1,
          },
          "Sort by title 🔽": {
            "csm.title": -1,
          },
          "Sort by local number 🔼": {
            localId: 1,
          },
          "Sort by local number 🔽": {
            localId: -1,
          },
        }}
      />
      <IssuesSearch param={param?.toString() ?? ""} repositoryId={repositoryId?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default Issues;
