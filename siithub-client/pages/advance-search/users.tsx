import { useRouter } from "next/router";
import { UsersSearch } from "../../features/advance-search/UsersSearch";
import { SortComponent } from "../../features/advance-search/SortComponent";

const Users = () => {
  const router = useRouter();
  const { param, sort } = router.query;

  if (!router) return <></>;

  return (
    <>
      <SortComponent
        options={{
          "Sort by username 🔼": {
            username: 1,
          },
          "Sort by username 🔽": {
            username: -1,
          },
          "Sort by name 🔼": {
            name: 1,
          },
          "Sort by name 🔽": {
            name: -1,
          },
        }}
      />
      <UsersSearch param={param?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default Users;
