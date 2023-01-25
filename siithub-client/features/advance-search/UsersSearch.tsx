import { type FC } from "react";
import { type User } from "../users/user.model";
import { useSearch } from "./useAdvanceSearch";
import { UserCard } from "../users/UserCard";

type UsersSearchProps = { param: string };

export const UsersSearch: FC<UsersSearchProps> = ({ param }) => {
  const { data: users } = useSearch<User>("users", param);

  return (
    <div>
      {users.map((u: User) => {
        return <UserCard key={u._id} user={u} />;
      })}
    </div>
  );
};
