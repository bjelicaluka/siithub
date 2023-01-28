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
          "Sortiraj po datumu 🔼": {
            "csm.timeStamp": -1,
          },
          "Sortiraj po datimu 🔽": {
            "csm.timeStamp": 1,
          },
          "Sortiraj po naslovu 🔼": {
            "csm.title": 1,
          },
          "Sortiraj po naslovu 🔽": {
            "csm.title": -1,
          },
          "Sortiraj po rednom broju 🔼": {
            localId: 1,
          },
          "Sortiraj po rednom broju 🔽": {
            localId: -1,
          },
        }}
      />
      <IssuesSearch param={param?.toString() ?? ""} repositoryId={repositoryId?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default Issues;
