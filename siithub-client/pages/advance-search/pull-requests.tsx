import { useRouter } from "next/router";
import { PullRequestsSearch } from "../../features/advance-search/PullReqestSearch";
import { SortComponent } from "../../features/advance-search/SortComponent";

const PullRequests = () => {
  const router = useRouter();
  const { param, repositoryId, sort } = router.query;

  if (!router) return <></>;

  return (
    <>
      <SortComponent
        options={{
          "Sortiraj po vremenu 🔼": {
            "csm.timeStamp": -1,
          },
          "Sortiraj po vremenu 🔽": {
            "csm.timeStamp": 1,
          },
          "Sortiraj po imenu 🔼": {
            "csm.title": 1,
          },
          "Sortiraj po imenu 🔽": {
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
      <PullRequestsSearch param={param?.toString() ?? ""} repositoryId={repositoryId?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default PullRequests;
