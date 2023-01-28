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
        }}
      />
      <RepositoriesSearch param={param?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default Repositories;
