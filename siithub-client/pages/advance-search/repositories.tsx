import { useRouter } from "next/router";
import { RepositoriesSearch } from "../../features/advance-search/RepositoriesSearch";
import { SortComponent } from "../../features/advance-search/SortComponent";

const Repositories = () => {
  const router = useRouter();
  const { param, sort } = router.query;

  if (!router) return <></>;

  return (
    <>
      <SortComponent
        options={{
          "Sortiraj po imenu 🔼": {
            name: 1,
          },
          "Sortiraj po imenu 🔽": {
            name: -1,
          },
          "Sortiraj po opisu 🔼": {
            description: 1,
          },
          "Sortiraj po opisu 🔽": {
            description: -1,
          },
        }}
      />
      <RepositoriesSearch param={param?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default Repositories;
