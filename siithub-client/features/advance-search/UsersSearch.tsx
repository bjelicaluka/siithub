import { type FC } from "react";
import { type User } from "../users/user.model";
import { useSearch } from "./useAdvanceSearch";
import { UserCard } from "../users/UserCard";

type UsersSearchProps = { param: string; sort?: any };

export const UsersSearch: FC<UsersSearchProps> = ({ param, sort }) => {
  const { data: users } = useSearch<User>("users", param, undefined, sort);

  return (
    <div className="mt-2">
      {users.map((u: User) => {
        return (
          <div className="mt-1" key={u._id}>
            <UserCard user={u} />
          </div>
        );
      })}
    </div>
  );
};
