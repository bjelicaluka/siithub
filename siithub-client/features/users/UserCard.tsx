import Link from "next/link";
import { type FC } from "react";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { type User } from "./user.model";

type UserCardProps = {
  user: User;
};

export const UserCard: FC<UserCardProps> = ({ user }) => {
  return (
    <div className="flex items-center border-2 p-2">
      <ProfilePicture username={user.username} size={40} />
      <Link className="text-lg font-semibold  text-blue-500 hover:underline ml-3" href={`/users/${user.username}`}>
        {user.username}
      </Link>
    </div>
  );
};
