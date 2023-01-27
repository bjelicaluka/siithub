import { type FC } from "react";
import { type User } from "../users/user.model";
import { useSearch } from "./useAdvanceSearch";
import { UserCard } from "../users/UserCard";

type UsersSearchProps = { param: string; sort?: any };

export const UsersSearch: FC<UsersSearchProps> = ({ param, sort }) => {
  const { data: users } = useSearch<User>("users", param, undefined, sort);

  return (
    <div>
      {users.map((u: User) => {
        return <UserCard key={u._id} user={u} />;
      })}
    </div>
  );
};
